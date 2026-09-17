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
            @change="applyFilters"
          >
        </div>
        <select
          v-model="filters.sort"
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
      </div>

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
          @click="toggleGenre(genre)"
        >
          {{ genre }}
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
    </div>
    <div
      v-else-if="!libraryState.items.length"
      class="state-card"
    >
      No items match your filter criteria.
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

    <button
      v-if="libraryState.pageInfo?.hasNextPage"
      type="button"
      class="load-more"
      :disabled="libraryState.loadingMore"
      @click="loadMore"
    >
      {{ libraryState.loadingMore ? 'Loading more…' : 'Load More' }}
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
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
  mediaStore.updateLibraryFilters(mediaType.value, {
    ...filters
  })

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

  mediaStore.loadLibrary(mediaType.value)
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

onMounted(() => {
  syncFromRoute()
  mediaStore.loadLibrary(mediaType.value)
})

watch(() => route.params.mediaType, () => {
  syncFromRoute()
  mediaStore.loadLibrary(mediaType.value)
})

watch(() => route.query, () => {
  syncFromRoute()
})
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
  grid-template-columns: minmax(220px, 1.4fr) repeat(4, minmax(0, 1fr))
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
