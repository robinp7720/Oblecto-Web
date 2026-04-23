<template>
  <div class="discover">
    <section class="intro">
      <span class="eyebrow">Discover</span>
      <h1>Jump into the catalog by intent, not by raw list names.</h1>
      <p>
        The new IA separates curation from exhaustive library browsing. Use this page for
        faster editorial entry points, then drop into the full movie or series library when
        you want precision.
      </p>
    </section>

    <section class="discover-cards">
      <RouterLink class="discover-card" :to="{ name: 'Library', params: { mediaType: 'movies' }, query: { sort: 'popularity' } }">
        <strong>Popular Films</strong>
        <span>Start with the most watched and most visible titles.</span>
      </RouterLink>
      <RouterLink class="discover-card" :to="{ name: 'Library', params: { mediaType: 'movies' }, query: { sort: 'releaseDate' } }">
        <strong>Recent Releases</strong>
        <span>Find the newest additions and latest release-year arrivals.</span>
      </RouterLink>
      <RouterLink class="discover-card" :to="{ name: 'Library', params: { mediaType: 'series' }, query: { sort: 'siteRating' } }">
        <strong>Rated Series</strong>
        <span>Open highly rated shows and scan directly into episodes.</span>
      </RouterLink>
    </section>

    <MediaShelf
      v-for="section in discoverRails"
      :key="section.id"
      :title="section.title"
      :type="section.type"
      :items="section.items.slice(0, 6)"
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

const discoverRails = computed(() => mediaStore.home.rails.slice(0, 4))
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
  border-radius: 24px
  background: rgba(30, 25, 28, 0.72)
  border: 1px solid var(--color-border)
  min-height: 180px

  span
    color: var(--color-text-muted)

@media screen and (max-width: 900px)
  .discover-cards
    grid-template-columns: 1fr
</style>
