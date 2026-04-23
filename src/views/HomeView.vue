<template>
  <div class="home">
    <section v-if="spotlight" class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Featured Tonight</span>
        <h1>{{ spotlightTitle }}</h1>
        <p>{{ spotlightOverview }}</p>
        <div class="hero-actions">
          <button
            v-if="spotlight.type !== 'series'"
            type="button"
            class="primary-button"
            @click="playSpotlight"
          >
            Play Now
          </button>
          <RouterLink :to="spotlightRoute" class="secondary-button">
            Open Details
          </RouterLink>
        </div>
      </div>
      <div class="hero-art" :style="{ backgroundImage: heroImage }" />
    </section>

    <section class="jump-grid">
      <RouterLink class="jump-card" :to="{ name: 'Discover' }">
        <strong>Discover</strong>
        <span>Curated rails, latest arrivals, and fast entry points.</span>
      </RouterLink>
      <RouterLink class="jump-card" :to="{ name: 'Library', params: { mediaType: 'movies' } }">
        <strong>Movie Library</strong>
        <span>Search, filter, and page through your entire film catalog.</span>
      </RouterLink>
      <RouterLink class="jump-card" :to="{ name: 'Library', params: { mediaType: 'series' } }">
        <strong>Series Library</strong>
        <span>Browse ongoing shows, recent episodes, and rated favorites.</span>
      </RouterLink>
    </section>

    <div v-if="mediaStore.home.loading" class="state-card">Loading the dashboard…</div>
    <div v-else-if="mediaStore.home.error" class="state-card">{{ mediaStore.home.error }}</div>

    <MediaShelf
      v-for="section in mediaStore.home.rails"
      :key="section.id"
      :title="section.title"
      :type="section.type"
      :items="section.items.slice(0, 8)"
      eyebrow="Home"
      :action-label="section.type === 'movie' ? 'Open movie library' : (section.type === 'series' ? 'Open series library' : 'View more')"
      :action-to="section.type === 'movie' ? { name: 'Library', params: { mediaType: 'movies' } } : (section.type === 'series' ? { name: 'Library', params: { mediaType: 'series' } } : { name: 'Search', query: { q: '' } })"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import MediaShelf from '@/components/media/MediaShelf.vue'
import { useMediaStore } from '@/stores/media'
import { imageUrl, titleForItem } from '@/utils/media'

const mediaStore = useMediaStore()
const store = useStore()

onMounted(() => {
  mediaStore.loadHome()
})

const spotlight = computed(() => mediaStore.home.spotlight)
const spotlightTitle = computed(() => spotlight.value ? titleForItem(spotlight.value.type, spotlight.value.item) : '')
const spotlightOverview = computed(() => spotlight.value?.item?.overview || 'No featured item available.')
const heroImage = computed(() => {
  if (!spotlight.value) return 'none'
  const type = spotlight.value.type === 'series' ? 'series' : 'movie'
  const variant = spotlight.value.type === 'movie' ? 'fanart' : 'poster'
  return `url(${imageUrl(store.state.host, type, spotlight.value.item.id, variant)})`
})
const spotlightRoute = computed(() => {
  if (!spotlight.value) return { name: 'Main' }
  if (spotlight.value.type === 'movie') return { name: 'MovieInfo', params: { movieId: spotlight.value.item.id } }
  return { name: 'SeriesView', params: { seriesId: spotlight.value.item.id } }
})

function playSpotlight () {
  if (!spotlight.value) return
  if (spotlight.value.type === 'movie') {
    store.dispatch('playMovie', spotlight.value.item.id)
    return
  }

  store.dispatch('playEpisode', spotlight.value.item.id)
}
</script>

<style scoped lang="sass">
.home
  display: grid
  gap: 28px

.hero
  display: grid
  grid-template-columns: minmax(0, 1.1fr) 360px
  gap: 24px
  padding: 28px
  border-radius: 30px
  background: radial-gradient(circle at top left, rgba(217, 129, 60, 0.2), transparent 45%), rgba(30, 25, 28, 0.78)
  border: 1px solid var(--color-border)
  box-shadow: var(--shadow-strong)

.hero-copy
  align-self: center

  h1
    margin: 10px 0 16px
    font-family: var(--font-display)
    font-size: clamp(2.6rem, 6vw, 4.8rem)
    line-height: 0.92

  p
    max-width: 50ch
    color: var(--color-text-muted)
    line-height: 1.6

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.18em
  color: var(--color-accent-strong)

.hero-art
  min-height: 360px
  border-radius: 24px
  background-size: cover
  background-position: center
  box-shadow: var(--shadow-soft)

.hero-actions
  display: flex
  gap: 12px
  margin-top: 22px

.primary-button,
.secondary-button
  min-height: 46px
  padding: 0 18px
  border-radius: 999px
  display: inline-flex
  align-items: center
  justify-content: center

.primary-button
  border: none
  background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong))
  color: #1b1616
  font-weight: 800
  cursor: pointer

.secondary-button
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.08)
  color: var(--color-text)

.jump-grid
  display: grid
  grid-template-columns: repeat(3, minmax(0, 1fr))
  gap: 18px

.jump-card
  display: grid
  gap: 8px
  padding: 22px
  border-radius: 24px
  background: rgba(30, 25, 28, 0.68)
  border: 1px solid var(--color-border)

  strong
    font-size: 1.1rem

  span
    color: var(--color-text-muted)
    line-height: 1.5

.state-card
  padding: 18px
  border-radius: 18px
  background: rgba(30, 25, 28, 0.65)
  border: 1px solid var(--color-border)

@media screen and (max-width: 960px)
  .hero
    grid-template-columns: 1fr

  .jump-grid
    grid-template-columns: 1fr
</style>
