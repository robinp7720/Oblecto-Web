<template>
  <div class="library">
    <section class="toolbar">
      <div class="toolbar-header">
        <div class="toolbar-copy">
          <span class="eyebrow">{{ isMovieLibrary ? 'Film Catalog' : 'Series Catalog' }}</span>
          <h1>{{ isMovieLibrary ? 'Movies' : 'TV Shows' }}</h1>
        </div>
      </div>

      <div class="filters">
        <div class="search-box">
          <input
            v-model="query"
            type="search"
            placeholder="Filter titles..."
            aria-label="Filter titles"
            @input="scheduleFilter"
          >
        </div>
        <button
          type="button"
          class="filter-toggle"
          :aria-expanded="filtersOpen"
          aria-controls="advanced-filters"
          @click="filtersOpen = !filtersOpen"
        >
          Filters ({{ activeChips.length }})
        </button>
      </div>
      <div
        id="advanced-filters"
        class="advanced-filters"
        :class="{ expanded: filtersOpen }"
      >
        <select
          v-model="filters.sort"
          aria-label="Sort by"
          class="select-pill"
          @change="applyFilters"
        >
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <select
          v-model="filters.order"
          aria-label="Sort direction"
          class="select-pill"
          @change="applyFilters"
        >
          <option value="desc">
            Descending
          </option>
          <option value="asc">
            Ascending
          </option>
        </select>
        <select
          v-model="filters.watched"
          aria-label="Watch state"
          class="select-pill"
          @change="applyFilters"
        >
          <option value="all">
            All watch states
          </option>
          <option value="watched">
            Watched
          </option>
          <option value="unwatched">
            Unwatched
          </option>
          <option value="inprogress">
            In progress
          </option>
        </select>
        <select
          v-model="filters.libraryPath"
          aria-label="Library"
          class="select-pill"
          @change="applyFilters"
        >
          <option value="">
            All libraries
          </option>
          <option
            v-for="library in libraryState.libraries"
            :key="library.path || library"
            :value="library.path || library"
          >
            {{ library.name || library.path || library }}
          </option>
        </select>

        <div
          v-if="libraryState.facets.genres?.length"
          class="genre-list"
        >
          <button
            v-for="genre in libraryState.facets.genres"
            :key="genre"
            type="button"
            class="genre-chip"
            :class="{ active: filters.genre.includes(genre) }"
            :aria-pressed="filters.genre.includes(genre)"
            @click="toggleGenre(genre)"
          >
            {{ genre }}
          </button>
        </div>
      </div>
      <div
        v-if="activeChips.length"
        class="active-filters"
        aria-label="Active filters"
      >
        <button
          v-for="chip in activeChips"
          :key="chip.key + chip.value"
          type="button"
          class="genre-chip"
          :aria-label="`Remove ${chip.label} filter`"
          @click="removeFilter(chip)"
        >
          {{ chip.label }} ×
        </button>
        <button
          type="button"
          class="genre-chip"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </section>

    <div
      v-if="libraryState.loading"
      class="state-card"
    >
      <div class="spinner" />
      <span>Loading {{ isMovieLibrary ? 'movies' : 'series' }}…</span>
    </div>
    <div
      v-else-if="libraryState.error"
      class="state-card error"
    >
      {{ libraryState.error }}
      <button
        type="button"
        @click="mediaStore.loadLibrary(mediaType)"
      >
        Try again
      </button>
    </div>
    <div
      v-else-if="!libraryState.items.length"
      class="state-card"
    >
      <template v-if="hasConstraints">
        No titles match these filters. <button
          type="button"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </template>
      <template v-else-if="libraryState.librariesLoaded && !libraryState.libraries.length">
        No libraries configured. <RouterLink :to="{ name: 'SettingsLibraries' }">
          Add a library
        </RouterLink>
      </template>
      <template v-else>
        No titles have been indexed yet. <RouterLink :to="{ name: 'SettingsMaintenance' }">
          Manage library scans
        </RouterLink>
      </template>
    </div>

    <section
      v-else
      class="results-grid"
    >
      <MediaCard
        v-for="item in libraryState.items"
        :key="`${mediaType}-${item.id}`"
        :item="item"
        :type="mediaCardType"
      />
    </section>

    <p
      v-if="libraryState.moreError"
      role="alert"
    >
      {{ libraryState.moreError }}
    </p>
    <button
      v-if="libraryState.pageInfo?.hasNextPage"
      type="button"
      class="load-more"
      :disabled="libraryState.loading || libraryState.loadingMore"
      @click="loadMore"
    >
      {{ libraryState.loadingMore ? 'Loading more…' : libraryState.moreError ? 'Retry loading more' : 'Load More' }}
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaCard from '@/components/media/MediaCard.vue'
import { useMediaStore } from '@/stores/media'

const route = useRoute()
const router = useRouter()
const mediaStore = useMediaStore()

const mediaType = computed(() => route.params.mediaType === 'series' ? 'series' : 'movies')
const mediaCardType = computed(() => mediaType.value === 'movies' ? 'movie' : 'series')
const libraryState = computed(() => mediaStore.library[mediaType.value])
const isMovieLibrary = computed(() => mediaType.value === 'movies')

const filters = reactive({
  q: '',
  sort: 'createdAt',
  order: 'desc',
  watched: 'all',
  genre: [],
  libraryPath: ''
})

const query = computed({
  get: () => filters.q,
  set: value => {
    filters.q = value
  }
})

const sortOptions = computed(() => {
  if (isMovieLibrary.value) {
    return [
      { value: 'createdAt', label: 'Date Added' },
      { value: 'movieName', label: 'Title' },
      { value: 'releaseDate', label: 'Release Date' },
      { value: 'popularity', label: 'Popularity' }
    ]
  }

  return [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'seriesName', label: 'Title' },
    { value: 'firstAired', label: 'First Aired' },
    { value: 'siteRating', label: 'Rating' }
  ]
})

function syncFromRoute () {
  filters.q = String(route.query.q || '')
  filters.sort = String(route.query.sort || 'createdAt')
  filters.order = String(route.query.order || 'desc')
  filters.watched = String(route.query.watched || 'all')
  filters.genre = route.query.genre ? String(route.query.genre).split(',').filter(Boolean) : []
  filters.libraryPath = String(route.query.libraryPath || '')

  mediaStore.updateLibraryFilters(mediaType.value, {
    ...filters
  })
}

function applyFilters () {
  clearTimeout(filterTimer)
  router.replace({
    name: 'Library',
    params: { mediaType: mediaType.value },
    query: {
      q: filters.q || undefined,
      sort: filters.sort !== 'createdAt' ? filters.sort : undefined,
      order: filters.order !== 'desc' ? filters.order : undefined,
      watched: filters.watched !== 'all' ? filters.watched : undefined,
      genre: filters.genre.length ? filters.genre.join(',') : undefined,
      libraryPath: filters.libraryPath || undefined
    }
  })
}

function toggleGenre (genre) {
  if (filters.genre.includes(genre)) {
    filters.genre = filters.genre.filter(entry => entry !== genre)
  } else {
    filters.genre = [...filters.genre, genre]
  }
  applyFilters()
}

function loadMore () {
  mediaStore.loadLibrary(mediaType.value, { append: true })
}

const filtersOpen = ref(false)
let filterTimer
const hasConstraints = computed(() => Boolean(filters.q || filters.genre.length || filters.watched !== 'all' || filters.libraryPath))
const activeChips = computed(() => [
  ...(filters.q ? [{ key: 'q', value: filters.q, label: filters.q }] : []),
  ...filters.genre.map(value => ({ key: 'genre', value, label: value })),
  ...['sort', 'order', 'watched', 'libraryPath'].filter(key => filters[key] !== ({ sort: 'createdAt', order: 'desc', watched: 'all', libraryPath: '' })[key]).map(key => ({ key, value: filters[key], label: key === 'sort' ? sortOptions.value.find(option => option.value === filters[key])?.label || filters[key] : filters[key] }))
])
function scheduleFilter () {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(applyFilters, 300)
}
function removeFilter (chip) {
  clearTimeout(filterTimer)
  if (chip.key === 'genre') filters.genre = filters.genre.filter(value => value !== chip.value)
  else filters[chip.key] = ({ q: '', sort: 'createdAt', order: 'desc', watched: 'all', libraryPath: '' })[chip.key]
  applyFilters()
}
function clearFilters () {
  clearTimeout(filterTimer)
  Object.assign(filters, { q: '', sort: 'createdAt', order: 'desc', watched: 'all', genre: [], libraryPath: '' })
  applyFilters()
}
watch(() => [route.params.mediaType, route.query], () => {
  clearTimeout(filterTimer)
  syncFromRoute()
  mediaStore.loadLibrary(mediaType.value)
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(filterTimer))
</script>

<style scoped lang="sass">
.library
  display: grid
  gap: 28px

.toolbar
  display: grid
  gap: 20px
  padding: 0 0 24px
  border-bottom: 1px solid var(--color-border)

.toolbar-copy h1
  margin: 4px 0 0
  font-family: var(--font-display)
  font-size: clamp(2rem, 4vw, 3.2rem)
  letter-spacing: -0.01em

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.18em
  color: var(--color-accent-strong)
  font-size: 0.78rem
  font-weight: 700

.filters
  display: grid
  grid-template-columns: minmax(0, 1fr) auto
  gap: 12px

.select-pill
  cursor: pointer

.genre-list
  display: flex
  flex-wrap: wrap
  gap: 8px

.genre-chip
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.04)
  color: var(--color-text-muted)
  border-radius: 999px
  padding: 6px 14px
  font-size: 0.85rem
  font-weight: 600
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: rgba(255, 255, 255, 0.1)
    color: var(--color-text)

  &.active
    background: var(--color-accent-soft)
    border-color: var(--color-accent)
    color: var(--color-accent-strong)
    box-shadow: 0 2px 10px var(--color-accent-soft)

.results-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))
  gap: 28px 16px

.state-card
  padding: 32px
  border-radius: var(--radius-md)
  border: 1px solid var(--color-border)
  background: var(--color-surface)
  display: flex
  align-items: center
  gap: 16px
  color: var(--color-text-muted)

  &.error
    border-color: rgba(239, 68, 68, 0.4)
    color: #ef4444

.spinner
  width: 20px
  height: 20px
  border: 2px solid var(--color-border)
  border-top-color: var(--color-accent)
  border-radius: 50%
  animation: spin 0.8s linear infinite

@keyframes spin
  to
    transform: rotate(360deg)

.load-more
  justify-self: center
  min-height: 48px
  padding: 0 28px
  border-radius: 999px
  border: 1px solid var(--color-border-strong)
  background: rgba(255, 255, 255, 0.08)
  color: var(--color-text)
  font-weight: 700
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: rgba(255, 255, 255, 0.15)
    border-color: var(--color-accent)
    transform: translateY(-2px)

  &:disabled
    opacity: 0.5
    cursor: not-allowed

@media screen and (max-width: 980px)
  .filters
    grid-template-columns: 1fr
</style>


<style scoped lang="sass">
@media (max-width: 480px)
  .results-grid
    grid-template-columns: repeat(2, minmax(0, 1fr))
  .search-box input
    width: 100%
</style>

<style scoped lang="sass">
.search-box input
  width: 100%
.advanced-filters
  display: grid
  grid-template-columns: repeat(4, minmax(0, 1fr))
  gap: 12px
  .genre-list
    grid-column: 1 / -1
.filter-toggle
  display: none
.active-filters
  display: flex
  flex-wrap: wrap
  gap: 8px
button, select
  min-height: var(--control-size)
@media (max-width: 980px)
  .filters
    grid-template-columns: minmax(0, 1fr) auto
  .filter-toggle
    display: block
    background: var(--color-surface)
    color: var(--color-text)
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    padding: 8px 12px
  .advanced-filters
    display: none
    &.expanded
      display: grid
      grid-template-columns: minmax(0, 1fr)
</style>

<style scoped lang="sass">
.state-card button
  min-height: var(--control-size)
  padding: 8px 16px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  background: var(--color-surface)
  color: var(--color-text)
  cursor: pointer
.state-card a
  text-decoration: underline
</style>
