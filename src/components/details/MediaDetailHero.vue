<template>
  <section
    class="detail-hero"
    :class="{ focused, 'portrait-backdrop': type === 'series' && backdropFailed && !fallbackFailed }"
    aria-labelledby="detail-title"
  >
    <img
      v-if="activeBackdrop"
      :key="activeBackdrop"
      class="detail-backdrop"
      :class="{ loaded: backdropLoaded }"
      :src="activeBackdrop"
      alt=""
      @load="backdropLoaded = true"
      @error="failBackdrop"
    >
    <div class="detail-shade" />
    <div class="detail-content">
      <a
        :href="back.href.value"
        class="back-link"
        @click="back.go"
      >
        ‹ {{ back.label.value }}
      </a>
      <div class="detail-layout">
        <div class="detail-copy motion-stagger">
          <span
            v-if="!focused"
            class="detail-eyebrow"
          >{{ type === 'movie' ? 'MOVIE' : type === 'series' ? 'TV SHOW' : 'EPISODE' }} · YOUR OBLECTO LIBRARY</span>
          <h1 id="detail-title">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="detail-subtitle"
          >
            {{ subtitle }}
          </p>
          <p
            v-if="tagline && !focused"
            class="detail-tagline"
          >
            {{ tagline }}
          </p>
          <div class="detail-overview-block">
            <p
              ref="overviewElement"
              class="detail-overview"
              :class="{ clamped: (focused || longOverview) && !overviewOpen }"
            >
              {{ overview || 'No synopsis available yet.' }}
            </p>
            <button
              v-if="longOverview"
              type="button"
              class="overview-toggle"
              :aria-expanded="overviewOpen"
              @click="overviewOpen = !overviewOpen"
            >
              {{ overviewOpen ? 'Less' : 'More' }}
            </button>
          </div>
          <div
            v-if="genres.length && !focused"
            class="detail-genres"
          >
            <RouterLink
              v-for="genre in genres"
              :key="genre"
              :to="{ name: 'Library', params: { mediaType: type === 'movie' ? 'movies' : 'series' }, query: { genre } }"
            >
              {{ genre }}
            </RouterLink>
          </div>
          <ul
            v-if="facts.length && !focused"
            class="detail-facts"
            aria-label="Available media features"
          >
            <li
              v-for="fact in facts"
              :key="fact"
            >
              {{ fact }}
            </li>
          </ul>
          <div class="detail-actions">
            <slot />
          </div>
          <div
            v-if="$slots['after-actions']"
            class="detail-after-actions"
          >
            <slot name="after-actions" />
          </div>
        </div>
        <img
          v-if="poster && !posterFailed && !focused"
          :key="poster"
          class="detail-poster"
          :src="poster"
          :alt="`${title} poster`"
          @error="posterFailed = true"
        >
      </div>
    </div>
  </section>
</template>
<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useBackLink } from '@/composables/useBackLink'
const props = defineProps({
  type: { type: String, required: true },
  focused: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  tagline: { type: String, default: '' },
  overview: { type: String, default: '' },
  genres: { type: Array, default: () => [] },
  facts: { type: Array, default: () => [] },
  backdrop: { type: String, default: '' },
  fallbackBackdrop: { type: String, default: '' },
  poster: { type: String, default: '' },
  backTo: { type: Object, required: true },
  backLabel: { type: String, required: true }
})
// Every title page renders this hero, so it names the tab for all of them.
usePageTitle(() => props.title)
const back = useBackLink(() => props.backTo, () => props.backLabel)
// On phones a long synopsis is cut to a few lines (see the media query), so
// Play is not pushed below the fold by it.
const overviewElement = ref(null)
const overviewOverflow = ref(false)
const longOverview = computed(() => props.focused ? overviewOverflow.value : (props.overview || '').length > 240)
const overviewOpen = ref(false)
function measureOverview () {
  if (overviewElement.value && !overviewOpen.value) {
    overviewOverflow.value = overviewElement.value.scrollHeight > overviewElement.value.clientHeight + 1
  }
}
let overviewObserver
onMounted(() => {
  overviewObserver = new ResizeObserver(measureOverview)
  overviewObserver.observe(overviewElement.value)
  measureOverview()
})
onBeforeUnmount(() => overviewObserver?.disconnect())
watch(() => [props.title, props.overview], () => { overviewOpen.value = false }, { flush: 'pre' })
watch(() => [props.overview, props.focused, overviewOpen.value], measureOverview, { flush: 'post' })
const backdropFailed = ref(false)
const fallbackFailed = ref(false)
const activeBackdrop = computed(() => !backdropFailed.value && props.backdrop ? props.backdrop : !fallbackFailed.value ? props.fallbackBackdrop : '')
function failBackdrop () {
  backdropLoaded.value = false
  if (!backdropFailed.value && props.backdrop) backdropFailed.value = true
  else fallbackFailed.value = true
}
const backdropLoaded = ref(false)
const posterFailed = ref(false)
watch(() => [props.backdrop, props.fallbackBackdrop], () => { backdropFailed.value = false; fallbackFailed.value = false; backdropLoaded.value = false })
watch(() => props.poster, () => { posterFailed.value = false })
</script>
<style scoped lang="sass">
.detail-hero
  position: relative
  isolation: isolate
  background: var(--color-bg-1)
.detail-backdrop, .detail-shade
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  z-index: -1
.detail-backdrop
  object-fit: cover
  object-position: center 25%
.portrait-backdrop .detail-backdrop
  opacity: 0.25
  object-position: center 35%
// Held back until the image has decoded, so it settles in rather than painting
// top to bottom. After the portrait rule, which it has to beat.
.detail-backdrop
  transition: opacity var(--motion-slow) var(--ease-out)
  &:not(.loaded)
    opacity: 0
.detail-shade
  background: linear-gradient(0deg, var(--color-bg-1), transparent 60%), linear-gradient(90deg, rgba(20, 20, 20, 0.96), rgba(20, 20, 20, 0.75) 50%, rgba(20, 20, 20, 0.3))
.detail-content
  padding: 28px var(--page-gutter) 60px
.back-link
  display: inline-block
  color: var(--color-text-muted)
  font-size: 0.875rem
  padding: 8px 0
  margin-bottom: 40px
  &:hover
    color: var(--color-brand-turquoise)
.detail-layout
  display: flex
  align-items: center
  justify-content: space-between
  gap: 60px
  min-height: 370px
.detail-copy
  max-width: 760px
  min-width: 0
.detail-eyebrow
  color: var(--color-brand-turquoise)
  font-size: 0.7rem
  font-weight: 700
  letter-spacing: 0.2em
h1
  font-size: clamp(2.5rem, 5vw, 5.5rem)
  line-height: 1.05
  letter-spacing: -0.045em
  margin: 18px 0
  overflow-wrap: anywhere
.detail-subtitle
  color: #ddd
  font-size: 0.95rem
.detail-tagline
  color: var(--color-brand-turquoise)
  font-size: 1.1rem
  margin: 24px 0 0
.detail-overview
  line-height: 1.7
  color: #ddd
  max-width: 68ch
.detail-genres
  display: flex
  flex-wrap: wrap
  gap: 10px
  margin: 22px 0
  a
    padding: 5px 10px
    border: 1px solid var(--color-border-strong)
    border-radius: var(--radius-sm)
    color: var(--color-text-muted)
    font-size: 0.75rem
.detail-facts
  display: flex
  flex-wrap: wrap
  gap: 8px
  margin: 18px 0 0
  padding: 0
  list-style: none
  li
    padding: 5px 9px
    border-radius: 999px
    background: rgba(20, 20, 20, 0.72)
    color: #ddd
    font-size: 0.72rem
.detail-actions
  display: flex
  flex-wrap: wrap
  gap: 12px
  margin-top: 28px
.detail-poster
  width: clamp(180px, 20vw, 290px)
  aspect-ratio: 2 / 3
  object-fit: cover
  border-radius: var(--radius-md)
  box-shadow: var(--shadow-strong)
  flex-shrink: 0
// The synopsis toggle only matters where the synopsis is cut.
.overview-toggle
  display: none
@media (max-width: 760px)
  // Title, then what to do: on a phone the buttons come straight after the
  // name and facts line, ahead of tagline, synopsis and genres.
  .detail-copy
    display: flex
    flex-direction: column
  .detail-eyebrow
    order: 1
  h1
    order: 2
  .detail-subtitle
    order: 3
  .detail-actions
    order: 4
    margin: 18px 0 8px
  .detail-after-actions
    order: 4
  .detail-tagline
    order: 5
  .detail-overview-block
    order: 6
  .detail-genres
    order: 7
  .detail-facts
    order: 8
  .detail-overview.clamped
    display: -webkit-box
    -webkit-line-clamp: 4
    -webkit-box-orient: vertical
    overflow: hidden
  .overview-toggle
    display: inline
    padding: 0
    border: 0
    background: none
    color: var(--color-brand-turquoise)
    font-weight: 700
    cursor: pointer
  .detail-content
    padding-bottom: 32px
  .detail-layout
    min-height: 0
  .detail-poster
    display: none
  .back-link
    margin-bottom: 36px
.focused
  // Keep the action disclosure above the next section, while the app header
  // and player retain their own higher stacking layers.
  z-index: 1
  .detail-content
    padding-top: 20px
    padding-bottom: 32px
  .back-link
    margin-bottom: 30px
  .detail-layout
    min-height: 0
  .detail-copy
    display: block
    width: 100%
    max-width: 680px
  h1
    margin: 0 0 16px
    font-size: clamp(2.5rem, 5.5vw, 4.5rem)
  .detail-subtitle
    margin: 0
    color: var(--color-text-muted)
    font-size: 0.85rem
  .detail-overview-block
    margin-top: 20px
    max-width: 52ch
  .detail-overview
    margin: 0
    color: var(--color-text-muted)
    font-size: 0.95rem
    line-height: 1.65
    &.clamped
      display: -webkit-box
      -webkit-line-clamp: 2
      -webkit-box-orient: vertical
      overflow: hidden
  .overview-toggle
    display: inline-block
    min-height: 36px
    padding: 6px 0
    border: 0
    background: none
    color: var(--color-brand-turquoise)
    font-size: 0.8rem
    cursor: pointer
  .detail-actions
    // Staggered siblings create stacking contexts, so disclosures must also
    // sit above the progress row inside this hero.
    position: relative
    z-index: 2
    align-items: center
    gap: 12px
    margin: 26px 0 0
@media (max-width: 540px)
  .focused
    .back-link
      margin-bottom: 24px
    .detail-overview.clamped
      -webkit-line-clamp: 3
    .detail-actions
      display: grid
      grid-template-columns: minmax(0, 1fr) 44px 44px
      gap: 10px
      :deep(.playback-control)
        grid-column: 1 / -1
        width: 100%
      :deep(.playback-button)
        width: 100%
      :deep(.movie-watchlist), :deep(.episode-favourite)
        grid-column: 2
      :deep(.movie-actions-menu), :deep(.detail-actions-menu)
        grid-column: 3
      :deep(.movie-trailer-trigger)
        justify-content: flex-start
        padding-left: 0
</style>
