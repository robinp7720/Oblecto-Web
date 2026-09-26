<template>
  <article
    class="media-card"
    :class="{ landscape }"
    data-motion-card
  >
    <div
      class="poster"
      data-motion-origin
    >
      <!-- The same link as the title below, for the pointer; keyboard and
           screen reader users get the title, so a card is one stop, not two. -->
      <RouterLink
        :to="detailsRoute"
        class="poster-link"
        tabindex="-1"
        aria-hidden="true"
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
        :aria-label="`${playLabel} ${title}${remote.isRemote && remote.activeDevice ? ` on ${remote.activeDevice.name}` : ''}`"
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
        v-if="playLabel.startsWith('Resume')"
        class="subtitle"
      >
        {{ playLabel }}
      </p>
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
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import { useRemoteStore } from '@/remote/state'
import { titleForItem, subtitleForItem, progressForItem, playbackLabel } from '@/utils/media'

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

const store = useAppStore()
const media = useMediaStore()
// Play follows the device chosen for playback; the label says where.
const remote = useRemoteStore()
const trackedItem = computed(() => media.withProgress(props.type, props.item))

const title = computed(() => titleForItem(props.type, props.item))
const subtitle = computed(() => subtitleForItem(props.type, props.item))
const playLabel = computed(() => playbackLabel(props.type, trackedItem.value))
const progress = computed(() => progressForItem(props.type, trackedItem.value))
const host = computed(() => store.host)
const imageFailed = ref(false)
const posterFallback = ref(false)
const artwork = computed(() => {
  const variant = props.type === 'episode' ? 'banner' : props.landscape && !posterFallback.value ? 'fanart' : 'poster'
  return media.artworkUrl(host.value, props.type, props.item.id, variant)
})
watch(() => [props.item.id, props.type, props.landscape, host.value], () => {
  imageFailed.value = false
  posterFallback.value = false
})
watch(artwork, () => { imageFailed.value = false })
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
    store.playMovie(props.item.id)
    return
  }

  if (props.type === 'episode') {
    store.playEpisode(props.item.id)
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
  transition: transform var(--motion-base) var(--ease-out), box-shadow var(--motion-base) var(--ease-out)
  &:hover, &:focus-within
    transform: translateY(-4px)
    box-shadow: 0 8px 24px #0008
    .play-button
      opacity: 1
      transform: none
// Keyboard focus on the title lifts and rings the artwork, which is what
// identifies the card; the poster clips an outline, so this is a shadow ring.
.media-card:focus-within .poster
  transform: translateY(-4px)
  .play-button
    opacity: 1
    transform: none
.media-card:has(.title:focus-visible) .poster
  box-shadow: 0 0 0 2px white, 0 8px 24px #0008
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
  width: var(--control-size)
  height: var(--control-size)
  border: 0
  border-radius: 50%
  background: white
  color: #141414
  cursor: pointer
  opacity: 0
  transform: translateY(6px)
  transition: opacity var(--motion-base) var(--ease-out), transform var(--motion-base) var(--ease-out), background-color var(--motion-fast)
  &:hover
    background: #ddd
// Beats the hover and focus reveals above, which also set the transform.
.media-card .poster .play-button:active
  transform: scale(0.92)
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
    transform: none
</style>
