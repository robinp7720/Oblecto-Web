<template>
  <div class="home">
    <section
      v-if="spotlight"
      class="hero"
      aria-labelledby="spotlight-title"
    >
      <img
        v-if="!heroFailed"
        :key="heroImage"
        class="hero-backdrop"
        :class="{ loaded: heroLoaded }"
        :src="heroImage"
        alt=""
        fetchpriority="high"
        @load="heroLoaded = true"
        @error="heroFailed = true"
      >
      <div class="hero-overlay" />
      <div class="hero-content motion-stagger">
        <span class="eyebrow"><span class="oblecto-mark">O</span> FEATURED {{ spotlight.type === 'movie' ? 'FILM' : 'SERIES' }}</span>
        <h1
          id="spotlight-title"
          class="hero-title"
        >
          {{ spotlightTitle }}
        </h1>
        <p
          v-if="spotlightSubtitle"
          class="hero-meta"
        >
          {{ spotlightSubtitle }}
        </p>
        <p class="hero-overview">
          {{ spotlightOverview }}
        </p>
        <div class="hero-actions">
          <PlaybackButton
            v-if="spotlight.type === 'movie'"
            :label="playbackLabel('movie', spotlight.item)"
            @play="playSpotlight"
          />
          <RouterLink
            :to="spotlightRoute"
            class="secondary-button"
          >
            <span
              class="info-icon"
              aria-hidden="true"
            >i</span> More Info
          </RouterLink>
        </div>
      </div>
      <span class="hero-caption">IN YOUR LIBRARY</span>
    </section>

    <div
      v-if="mediaStore.home.loading && !spotlight"
      class="loading-state"
      role="status"
    >
      <div class="skeleton-hero motion-skeleton" />
      <p>Finding your next great watch…</p>
    </div>
    <section
      v-else-if="!mediaStore.home.loading && !mediaStore.home.error && !mediaStore.home.rails.length"
      class="state-card"
    >
      <span class="eyebrow">MAKE YOURSELF AT HOME</span>
      <h1>Your next favorite belongs here.</h1>
      <p>Add your movies and TV shows to start watching.</p>
      <RouterLink
        :to="{ name: 'SettingsLibraries' }"
        class="primary-button"
      >
        Manage libraries
      </RouterLink>
    </section>

    <div
      class="home-shelves"
      :class="{ 'with-hero': spotlight }"
    >
      <HomeLoadState />
      <MediaShelf
        v-for="section in mediaStore.home.rails"
        :key="section.id"
        :title="section.title"
        :type="section.type"
        :items="section.items"
        :action-label="section.type === 'movie' ? 'Explore movies' : section.type === 'series' ? 'Explore shows' : null"
        :action-to="section.type === 'movie' ? { name: 'Library', params: { mediaType: 'movies' } } : { name: 'Library', params: { mediaType: 'series' } }"
      />
    </div>
  </div>
</template>

<script setup>
import { playbackLabel } from '@/utils/media'
import HomeLoadState from '@/components/media/HomeLoadState.vue'
import PlaybackButton from '@/components/remote/PlaybackButton.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import MediaShelf from '@/components/media/MediaShelf.vue'
import { useMediaStore } from '@/stores/media'
import { imageUrl, titleForItem, subtitleForItem } from '@/utils/media'

const mediaStore = useMediaStore()
const store = useStore()
const heroFailed = ref(false)
const heroLoaded = ref(false)
onMounted(() => { mediaStore.loadHome() })
const spotlight = computed(() => mediaStore.home.spotlight)
const spotlightTitle = computed(() => spotlight.value ? titleForItem(spotlight.value.type, spotlight.value.item) : '')
const spotlightSubtitle = computed(() => spotlight.value ? subtitleForItem(spotlight.value.type, spotlight.value.item) : '')
const spotlightOverview = computed(() => spotlight.value?.item?.overview || 'Settle in and discover something great from your collection.')
const heroImage = computed(() => spotlight.value ? imageUrl(store.state.host, spotlight.value.type, spotlight.value.item.id, spotlight.value.type === 'movie' ? 'fanart' : 'poster') : '')
watch(heroImage, () => { heroFailed.value = false; heroLoaded.value = false })
const spotlightRoute = computed(() => {
  if (!spotlight.value) return { name: 'Main' }
  if (spotlight.value.type === 'movie') return { name: 'MovieInfo', params: { movieId: spotlight.value.item.id } }
  return { name: 'SeriesView', params: { seriesId: spotlight.value.item.id } }
})
function playSpotlight () {
  if (spotlight.value?.type === 'movie') store.dispatch('playMovie', spotlight.value.item.id)
}
</script>

<style scoped lang="sass">
.hero
  position: relative
  min-height: 590px
  height: min(76vh, 850px)
  display: flex
  align-items: center
  padding: 50px var(--page-gutter) 120px
  background: linear-gradient(120deg, #242424, #38302e 65%, #141414)
.hero-backdrop, .hero-overlay
  position: absolute
  inset: 0
  width: 100%
  height: 100%
.hero-backdrop
  object-fit: cover
  object-position: center 30%
  transition: opacity var(--motion-slow) var(--ease-out)
  // Held back until the image has decoded, so it settles in rather than
  // painting top to bottom.
  &:not(.loaded)
    opacity: 0
.hero-overlay
  background: linear-gradient(0deg, #141414 0%, transparent 35%), linear-gradient(90deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.05) 80%)
.hero-content
  position: relative
  max-width: 600px
  width: 50%
.eyebrow
  display: inline-flex
  align-items: center
  gap: 12px
  letter-spacing: 0.25em
  font-size: 0.75rem
  font-weight: 700
.oblecto-mark
  color: var(--color-accent)
  font-size: 2rem
  font-weight: 900
.hero-title
  font-size: clamp(2.8rem, 5.8vw, 6rem)
  line-height: 1.02
  letter-spacing: -0.045em
  margin: 14px 0 22px
  text-wrap: balance
  overflow-wrap: anywhere
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.3)
.hero-meta
  font-size: 0.875rem
  color: #ddd
.hero-overview
  font-size: clamp(1rem, 1.3vw, 1.2rem)
  line-height: 1.55
  display: -webkit-box
  -webkit-line-clamp: 3
  -webkit-box-orient: vertical
  overflow: hidden
  text-shadow: 0 1px 4px black
.hero-actions
  display: flex
  flex-wrap: wrap
  gap: 12px
  margin-top: 26px
.primary-button, .secondary-button
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 12px
  padding: 12px 28px
  min-height: 48px
  border: 0
  border-radius: 4px
  font-size: 1.1rem
  font-weight: 700
  cursor: pointer
  &:hover
    opacity: 0.8
.primary-button, .secondary-button
  transition: transform var(--motion-fast) var(--ease-out), background-color var(--motion-fast)
  &:active
    transform: scale(0.97)
.primary-button
  background: var(--color-brand-coral)
  color: #141414
.secondary-button
  background: rgba(109, 109, 110, 0.7)
  color: white
.info-icon
  display: grid
  place-items: center
  border: 2px solid currentColor
  border-radius: 50%
  width: 22px
  height: 22px
  font-family: Georgia, serif
.hero-caption
  position: absolute
  right: 0
  bottom: 150px
  padding: 12px 28px
  border-left: 3px solid #ddd
  background: rgba(30, 30, 30, 0.65)
  font-size: 0.7rem
  letter-spacing: 0.15em
.home-shelves
  position: relative
  display: grid
  gap: 38px
  padding: 0 var(--page-gutter)
  &.with-hero
    margin-top: -70px
.state-card
  margin: 50px var(--page-gutter)
  padding: 50px 0
  h1
    font-size: clamp(2rem, 4vw, 3.5rem)
    letter-spacing: -0.03em
  p
    color: var(--color-text-muted)
    margin-bottom: 28px
.loading-state
  padding: 24px var(--page-gutter)
  color: var(--color-text-muted)
.skeleton-hero
  height: 50vh
  border-radius: 4px
@media (max-width: 760px)
  .hero
    min-height: 360px
    height: auto
    align-items: flex-end
    padding-top: 60px
    padding-bottom: 100px
  .hero-content
    width: 100%
    max-width: 480px
  .hero-overlay
    background: linear-gradient(0deg, #141414, rgba(20, 20, 20, 0.65) 70%, rgba(20, 20, 20, 0.15))
  .hero-title
    font-size: clamp(2.5rem, 10vw, 4rem)
  .hero-caption
    display: none
  .home-shelves.with-hero
    margin-top: -40px
  .primary-button, .secondary-button
    padding: 12px 22px
    font-size: 1rem
</style>
