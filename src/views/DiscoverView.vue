<template>
  <div class="discover">
    <section class="intro">
      <span class="eyebrow">Discover</span>
      <h1>Find your next great watch.</h1>
      <p>
        Fresh arrivals, popular movies, and shows worth settling in for.
      </p>
    </section>

    <section class="discover-cards">
      <RouterLink
        class="discover-card"
        :to="{ name: 'Library', params: { mediaType: 'movies' }, query: { sort: 'popularity' } }"
      >
        <strong>Popular Films</strong>
        <span>Explore the popular titles in your collection.</span>
      </RouterLink>
      <RouterLink
        class="discover-card"
        :to="{ name: 'Library', params: { mediaType: 'movies' }, query: { sort: 'releaseDate' } }"
      >
        <strong>Recent Releases</strong>
        <span>Catch up on the latest releases in your library.</span>
      </RouterLink>
      <RouterLink
        class="discover-card"
        :to="{ name: 'Library', params: { mediaType: 'series' }, query: { sort: 'siteRating' } }"
      >
        <strong>Rated Series</strong>
        <span>Discover your next favorite series.</span>
      </RouterLink>
    </section>

    <MediaShelf
      v-for="section in discoverRails"
      :key="section.id"
      :title="section.title"
      :type="section.type"
      :items="section.items"
      eyebrow="Discover"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
import { useMediaStore } from '@/stores/media'

const mediaStore = useMediaStore()

onMounted(() => {
  mediaStore.loadHome()
})

const discoverRails = computed(() => mediaStore.home.rails.filter(section => ['recent-movies', 'recent-series', 'popular-movies', 'top-series'].includes(section.id)))
</script>

<style scoped lang="sass">
.discover
  display: grid
  gap: 26px

.intro
  max-width: 760px

  h1
    margin: 10px 0 14px
    font-family: var(--font-display)
    font-size: clamp(2.2rem, 5vw, 4rem)
    line-height: 0.98

  p
    color: var(--color-text-muted)
    line-height: 1.6

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.18em
  color: var(--color-accent-strong)

.discover-cards
  display: grid
  grid-template-columns: repeat(3, minmax(0, 1fr))
  gap: 18px

.discover-card
  display: grid
  gap: 10px
  padding: 24px
  border-radius: var(--radius-md)
  background: var(--color-surface)
  border: 1px solid var(--color-border)
  min-height: 140px
  &:hover
    background: var(--color-surface-hover)

  span
    color: var(--color-text-muted)

@media screen and (max-width: 900px)
  .discover-cards
    grid-template-columns: 1fr
</style>
