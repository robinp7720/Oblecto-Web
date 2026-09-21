<template>
  <section
    class="detail-hero"
    :class="{ 'portrait-backdrop': type === 'series' && backdropFailed && !fallbackFailed }"
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
      <RouterLink
        :to="backTo"
        class="back-link"
      >
        ‹ {{ backLabel }}
      </RouterLink>
      <div class="detail-layout">
        <div class="detail-copy motion-stagger">
          <span class="detail-eyebrow">{{ type === 'movie' ? 'MOVIE' : type === 'series' ? 'TV SHOW' : 'EPISODE' }} · YOUR OBLECTO LIBRARY</span>
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
            v-if="tagline"
            class="detail-tagline"
          >
            {{ tagline }}
          </p>
          <p class="detail-overview">
            {{ overview || 'No synopsis available yet.' }}
          </p>
          <div
            v-if="genres.length"
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
            v-if="facts.length"
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
        </div>
        <img
          v-if="poster && !posterFailed"
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
import { computed, ref, watch } from 'vue'
const props = defineProps({
  type: { type: String, required: true },
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
    border-radius: 4px
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
  border-radius: 6px
  box-shadow: var(--shadow-strong)
  flex-shrink: 0
@media (max-width: 760px)
  .detail-content
    padding-bottom: 32px
  .detail-layout
    min-height: 0
  .detail-poster
    display: none
  .back-link
    margin-bottom: 36px
</style>
