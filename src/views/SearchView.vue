<template>
  <div class="search-page">
    <section class="search-hero">
      <span class="eyebrow">Search</span>
      <h1>Search your library.</h1>
      <form
        class="search-form"
        @submit.prevent="submit"
      >
        <input
          v-model="query"
          type="search"
          placeholder="Search all media"
          aria-label="Search all media"
        >
        <button type="submit">
          Search
        </button>
      </form>
    </section>

    <div
      v-if="searchStore.loading"
      role="status"
      class="state-card"
    >
      Searching the catalog…
    </div>
    <div
      v-else-if="searchStore.error"
      class="state-card"
    >
      {{ searchStore.error }}
      <button
        type="button"
        @click="searchStore.runSearch(normalizedQuery)"
      >
        Try again
      </button>
    </div>
    <div
      v-else-if="!hasResults && normalizedQuery"
      class="state-card"
    >
      No results found for “{{ normalizedQuery }}”.
    </div>

    <p
      v-if="normalizedQuery && hasResults && !searchStore.loading && !searchStore.error"
      role="status"
    >
      {{ resultCount }} {{ resultCount === 1 ? 'result' : 'results' }}
    </p>
    <MediaShelf
      v-if="searchStore.results.movies.length"
      title="Movie Results"
      type="movie"
      :items="searchStore.results.movies"
      eyebrow="Search"
    />
    <section
      v-if="searchStore.results.people.length"
      class="people-results"
    >
      <h2>People</h2>
      <div class="people-grid motion-stagger">
        <PersonCard
          v-for="person in searchStore.results.people"
          :key="person.id"
          :credit="{ person, job: person.knownForDepartment }"
        />
      </div>
    </section>
    <MediaShelf
      v-if="searchStore.results.series.length"
      title="Series Results"
      type="series"
      :items="searchStore.results.series"
      eyebrow="Search"
    />
    <MediaShelf
      v-if="searchStore.results.episodes.length"
      title="Episode Results"
      type="episode"
      :items="searchStore.results.episodes"
      eyebrow="Search"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaShelf from '@/components/media/MediaShelf.vue'
import PersonCard from '@/components/details/PersonCard.vue'
import { useSearchStore } from '@/stores/search'
import { useMediaStore } from '@/stores/media'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const mediaStore = useMediaStore()
watch(() => mediaStore.catalogRevision, () => searchStore.runSearch(searchStore.query, { silent: true }))
const query = ref(String(route.query.q || ''))

const normalizedQuery = computed(() => String(route.query.q || '').trim())
const resultCount = computed(() => Object.values(searchStore.results).reduce((count, items) => count + items.length, 0))
const hasResults = computed(() => {
  const results = searchStore.results
  return results.movies.length > 0 || results.series.length > 0 || results.episodes.length > 0 || results.people.length > 0
})

function submit () {
  router.replace({
    name: 'Search',
    query: {
      q: query.value || undefined
    }
  })
}

watch(() => route.query.q, value => {
  // The route changes before this page has finished leaving; that is not a
  // new, empty search.
  if (route.name !== 'Search') return
  query.value = String(value || '')

  // Back from a result: the store still holds this search, so show it as it
  // was (and where it was scrolled to), refreshing quietly behind it.
  const normalized = query.value.trim()
  if (normalized && normalized === searchStore.query && !searchStore.error) {
    if (!searchStore.loading) searchStore.runSearch(normalized, { silent: true })
    return
  }

  searchStore.runSearch(value || '')
}, { immediate: true })
</script>

<style scoped lang="sass">
.search-page
  display: grid
  gap: 24px

.search-hero
  display: grid
  gap: 14px
  padding: 24px
  border-radius: var(--radius-md)
  background: var(--color-surface)
  border: 1px solid var(--color-border)

  h1
    margin: 0
    font-family: var(--font-display)
    font-size: clamp(1.6rem, 3vw, 2.4rem)

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.18em
  color: var(--color-accent-strong)

.search-form
  display: grid
  grid-template-columns: 1fr auto
  gap: 12px

  button
    min-height: 48px
    padding: 0 18px
    border-radius: var(--radius-sm)
    border: none
    background: var(--color-brand-coral)
    color: #1b1616
    font-weight: 800
    cursor: pointer

.state-card
  padding: 18px
  border-radius: var(--radius-md)
  border: 1px solid var(--color-border)
  background: var(--color-surface)

.people-results
  h2
    margin-bottom: 18px
.people-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr))
  gap: 20px

@media screen and (max-width: 720px)
  .search-form
    grid-template-columns: 1fr
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
