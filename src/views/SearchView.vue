<template>
  <div class="search-page">
    <section class="search-hero">
      <span class="eyebrow">Search</span>
      <h1>Find a title, episode, or series instantly.</h1>
      <form class="search-form" @submit.prevent="submit">
        <input v-model="query" type="search" placeholder="Search all media" />
        <button type="submit">Search</button>
      </form>
    </section>

    <div v-if="searchStore.loading" class="state-card">Searching the catalog…</div>
    <div v-else-if="searchStore.error" class="state-card">{{ searchStore.error }}</div>
    <div v-else-if="!hasResults && normalizedQuery" class="state-card">No results found for “{{ normalizedQuery }}”.</div>

    <MediaShelf
      v-if="searchStore.results.movies.length"
      title="Movie Results"
      type="movie"
      :items="searchStore.results.movies"
      eyebrow="Search"
    />
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
import { useSearchStore } from '@/stores/search'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const query = ref(String(route.query.q || ''))

const normalizedQuery = computed(() => String(route.query.q || '').trim())
const hasResults = computed(() => {
  const results = searchStore.results
  return results.movies.length > 0 || results.series.length > 0 || results.episodes.length > 0
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
  query.value = String(value || '')
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
  border-radius: 26px
  background: rgba(30, 25, 28, 0.74)
  border: 1px solid var(--color-border)

  h1
    margin: 0
    font-family: var(--font-display)
    font-size: clamp(2rem, 4vw, 3.5rem)

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
    border-radius: 999px
    border: none
    background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong))
    color: #1b1616
    font-weight: 800
    cursor: pointer

.state-card
  padding: 18px
  border-radius: 20px
  border: 1px solid var(--color-border)
  background: rgba(30, 25, 28, 0.7)

@media screen and (max-width: 720px)
  .search-form
    grid-template-columns: 1fr
</style>
