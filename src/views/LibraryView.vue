<template>
  <div class="library">
    <section class="toolbar">
      <div class="toolbar-copy">
        <span class="eyebrow">{{ isMovieLibrary ? 'Movies' : 'Series' }}</span>
        <h1>{{ isMovieLibrary ? 'Browse the film catalog.' : 'Browse the series catalog.' }}</h1>
      </div>

      <div class="filters">
        <input v-model="query" type="search" placeholder="Filter by title" @change="applyFilters" />
        <select v-model="filters.sort" @change="applyFilters">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <select v-model="filters.order" @change="applyFilters">
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <select v-model="filters.watched" @change="applyFilters">
          <option value="all">All watch states</option>
          <option value="watched">Watched</option>
          <option value="unwatched">Unwatched</option>
          <option value="inprogress">In progress</option>
        </select>
        <select v-model="filters.libraryPath" @change="applyFilters">
          <option value="">All libraries</option>
          <option v-for="library in libraryState.libraries" :key="library.path || library" :value="library.path || library">
            {{ library.path || library }}
          </option>
        </select>
      </div>

      <div v-if="libraryState.facets.genres?.length" class="genre-list">
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

    <div v-if="libraryState.loading" class="state-card">Loading {{ isMovieLibrary ? 'movies' : 'series' }}…</div>
    <div v-else-if="libraryState.error" class="state-card">{{ libraryState.error }}</div>
    <div v-else-if="!libraryState.items.length" class="state-card">No results match the current filter set.</div>

    <section v-else class="results-grid">
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
  gap: 24px

.toolbar
  display: grid
  gap: 18px
  padding: 22px
  border-radius: 26px
  background: rgba(30, 25, 28, 0.74)
  border: 1px solid var(--color-border)

.toolbar-copy h1
  margin: 6px 0 0
  font-family: var(--font-display)
  font-size: clamp(2rem, 4vw, 3.4rem)

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.18em
  color: var(--color-accent-strong)

.filters
  display: grid
  grid-template-columns: minmax(220px, 1.2fr) repeat(4, minmax(0, 1fr))
  gap: 12px

.genre-list
  display: flex
  flex-wrap: wrap
  gap: 10px

.genre-chip
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.06)
  color: var(--color-text)
  border-radius: 999px
  padding: 8px 14px
  cursor: pointer

  &.active
    background: rgba(217, 129, 60, 0.18)
    border-color: rgba(217, 129, 60, 0.5)
    color: var(--color-accent-strong)

.results-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))
  gap: 20px

.state-card
  padding: 18px
  border-radius: 20px
  border: 1px solid var(--color-border)
  background: rgba(30, 25, 28, 0.7)

.load-more
  justify-self: center
  min-height: 48px
  padding: 0 20px
  border-radius: 999px
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.08)
  color: var(--color-text)
  cursor: pointer

@media screen and (max-width: 980px)
  .filters
    grid-template-columns: 1fr
</style>
