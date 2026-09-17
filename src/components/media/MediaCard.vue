<template>
  <article
    class="media-card"
    :class="{ landscape }"
  >
    <div class="poster">
      <RouterLink
        :to="detailsRoute"
        class="poster-link"
        :aria-label="`More info about ${title}`"
      >
        <img
          v-if="!imageFailed"
          :src="artwork"
          alt=""
          loading="lazy"
          @error="handleImageError"
        >
        <span
          v-else
          class="artwork-fallback"
        >{{ title }}</span>
        <span
          v-if="landscape && !imageFailed"
          class="artwork-title"
        >{{ title }}</span>
      </RouterLink>
      <button
        v-if="playable"
        type="button"
        class="play-button"
        :aria-label="`Play ${title}`"
        @click="play"
      >
        <span aria-hidden="true">▶</span>
      </button>
      <div
        v-if="progress > 0"
        class="progress"
        role="progressbar"
        :aria-label="`Watch progress for ${title}`"
        :aria-valuenow="Math.round(Math.min(progress, 1) * 100)"
        :aria-valuemin="0"
        :aria-valuemax="100"
      >
        <span :style="{ width: `${Math.min(progress, 1) * 100}%` }" />
      </div>
    </div>
    <div class="body">
      <RouterLink
        :to="detailsRoute"
        class="title"
      >
        {{ title }}
      </RouterLink>
      <p
        v-if="subtitle"
        class="subtitle"
      >
        {{ subtitle }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { titleForItem, subtitleForItem, imageUrl, progressForItem } from '@/utils/media'

const props = defineProps({
  landscape: { type: Boolean, default: false },
  item: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  }
})

const store = useStore()

const title = computed(() => titleForItem(props.type, props.item))
const subtitle = computed(() => subtitleForItem(props.type, props.item))
const progress = computed(() => progressForItem(props.type, props.item))
const host = computed(() => store.state.host)
const imageFailed = ref(false)
const posterFallback = ref(false)
const artwork = computed(() => {
  const variant = props.type === 'episode' ? 'banner' : props.landscape && !posterFallback.value ? 'fanart' : 'poster'
  return imageUrl(host.value, props.type, props.item.id, variant)
})
watch(() => [props.item.id, props.type, props.landscape, host.value], () => {
  imageFailed.value = false
  posterFallback.value = false
})
function handleImageError () {
  if (props.type === 'movie' && props.landscape && !posterFallback.value) posterFallback.value = true
  else imageFailed.value = true
}
const detailsRoute = computed(() => {
  if (props.type === 'movie') {
    return { name: 'MovieInfo', params: { movieId: props.item.id } }
  }

  if (props.type === 'series') {
    return { name: 'SeriesView', params: { seriesId: props.item.id } }
  }

  return { name: 'EpisodeInfo', params: { episodeId: props.item.id } }
})
const playable = computed(() => props.type !== 'series')

function play () {
  if (props.type === 'movie') {
    store.dispatch('playMovie', props.item.id)
    return
  }

  if (props.type === 'episode') {
    store.dispatch('playEpisode', props.item.id)
  }
}
</script>

<style scoped lang="sass">
.media-card
  min-width: 0
  display: grid
  align-content: start
  gap: 10px
.poster
  position: relative
  aspect-ratio: 2 / 3
  border-radius: 4px
  overflow: hidden
  background: #252525
  transition: transform 0.2s ease, box-shadow 0.2s ease
  &:hover, &:focus-within
    transform: translateY(-4px)
    box-shadow: 0 8px 24px #0008
    .play-button
      opacity: 1
.landscape .poster
  aspect-ratio: 16 / 9
.poster-link
  display: block
  height: 100%
  img
    display: block
    width: 100%
    height: 100%
    object-fit: cover
.artwork-title
  position: absolute
  inset: 35% 0 0
  display: flex
  align-items: flex-end
  padding: 16px 60px 16px 16px
  background: linear-gradient(transparent, #000c)
  font-size: clamp(1rem, 1.5vw, 1.35rem)
  font-weight: 800
  letter-spacing: -0.03em
  pointer-events: none
.artwork-fallback
  display: grid
  place-items: center
  height: 100%
  padding: 24px
  text-align: center
  font-size: 1.3rem
  font-weight: 700
  background: linear-gradient(135deg, #353535, #202020)
.play-button
  position: absolute
  right: 12px
  bottom: 14px
  display: grid
  place-items: center
  width: 38px
  height: 38px
  border: 0
  border-radius: 50%
  background: white
  color: #141414
  cursor: pointer
  opacity: 0
  transition: opacity 0.2s
  &:hover
    background: #ddd
.progress
  position: absolute
  inset: auto 0 0
  height: 4px
  background: #666
  pointer-events: none
  span
    display: block
    height: 100%
    background: var(--color-accent)
.body
  min-width: 0
.title
  display: block
  font-weight: 600
  font-size: 0.875rem
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  &:hover
    text-decoration: underline
.subtitle
  margin: 5px 0 0
  color: var(--color-text-faint)
  font-size: 0.75rem
  line-height: 1.4
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
@media (hover: none)
  .play-button
    opacity: 1
</style>
