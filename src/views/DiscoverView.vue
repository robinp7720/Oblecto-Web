<template>
  <div class="discover">
    <section class="intro">
      <span class="eyebrow">Discover</span>
      <h1>Find your next great watch.</h1>
      <p>
        Popular movies, highly rated series, and new ways into your collection.
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

    <HomeLoadState :ids="discoverIds" />
    <p
      v-if="!discoverPending && !discoverError && !discoverRails.length"
      class="state-card"
    >
      No titles to discover yet.
      <RouterLink
        v-if="canOpenPage('SettingsLibraries', authStore.can)"
        :to="{ name: 'SettingsLibraries' }"
      >
        Manage libraries
      </RouterLink>
    </p>
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
import HomeLoadState from '@/components/media/HomeLoadState.vue'
import { computed, onMounted } from 'vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
import { useMediaStore } from '@/stores/media'
import { useAuthStore } from '@/stores/auth'
import { canOpenPage } from '@/components/settings/registry'

const mediaStore = useMediaStore()
const authStore = useAuthStore()
const discoverIds = ['popular-movies', 'top-series']

// Rows already loaded (from Home or an earlier visit) refresh quietly.
onMounted(() => {
  mediaStore.loadHome(null, { silent: discoverIds.some(id => mediaStore.home.sections[id]?.settled) })
})

const discoverPending = computed(() => discoverIds.some(id => mediaStore.home.sections[id]?.loading))
const discoverError = computed(() => discoverIds.some(id => mediaStore.home.sections[id]?.error))
const discoverRails = computed(() => mediaStore.home.rails.filter(section => discoverIds.includes(section.id)))
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
