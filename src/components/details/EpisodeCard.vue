<template>
  <article
    class="episode-card"
    data-motion-card
  >
    <button
      class="episode-art"
      data-motion-origin
      type="button"
      :aria-label="`${playLabel} ${title}`"
      @click="store.playEpisode(episode.id)"
    >
      <img
        v-if="!imageFailed"
        :src="artwork"
        alt=""
        loading="lazy"
        @error="imageFailed = true"
      >
      <span
        v-else
        class="art-fallback"
        aria-hidden="true"
      >{{ episodeNumber }}</span>
      <span
        class="episode-play"
        aria-hidden="true"
      >▶</span>
      <span
        v-if="episode.runtime"
        class="runtime"
      >{{ formatRuntime(episode.runtime) }}</span>
      <span
        v-if="progress > 0"
        class="episode-progress"
        role="progressbar"
        :aria-label="`Watch progress for ${title}`"
        :aria-valuenow="Math.round(progress * 100)"
        :aria-valuemin="0"
        :aria-valuemax="100"
      ><span :style="{ width: `${progress * 100}%` }" /></span>
    </button>
    <div class="episode-copy">
      <span class="episode-number">{{ episodeNumber }}</span>
      <RouterLink
        class="episode-title"
        :to="{ name: 'EpisodeInfo', params: { episodeId: episode.id } }"
      >
        {{ title }}
      </RouterLink>
      <WatchStateButton
        :id="episode.id"
        :track="media.trackFor('episode', episode)"
        :item-title="title"
        type="episode"
        compact
        status-label
        @updated="$emit('watch-state', $event)"
      />
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import { formatRuntime, progressForItem, playbackLabel } from '@/utils/media'
import WatchStateButton from './WatchStateButton.vue'

const props = defineProps({ episode: { type: Object, required: true } })
defineEmits(['watch-state'])
const store = useAppStore()
const media = useMediaStore()
const trackedEpisode = computed(() => media.withProgress('episode', props.episode))
const imageFailed = ref(false)
const title = computed(() => props.episode.episodeName || `Episode ${props.episode.airedEpisodeNumber ?? ''}`)
const episodeNumber = computed(() => `Episode ${props.episode.airedEpisodeNumber ?? '—'}`)
const progress = computed(() => Math.max(0, Math.min(1, progressForItem('episode', trackedEpisode.value))))
const playLabel = computed(() => playbackLabel('episode', trackedEpisode.value).split(' · ')[0])
const artwork = computed(() => media.artworkUrl(store.host, 'episode', props.episode.id, 'banner'))
watch(artwork, () => { imageFailed.value = false })
</script>

<style scoped lang="sass">
.episode-card
  min-width: 0
.episode-art
  position: relative
  display: block
  width: 100%
  aspect-ratio: 16 / 9
  padding: 0
  border: 0
  border-radius: 8px
  overflow: hidden
  background: linear-gradient(135deg, var(--color-brand-blue), var(--color-surface))
  color: white
  cursor: pointer
  img
    display: block
    width: 100%
    height: 100%
    object-fit: cover
  &:hover .episode-play, &:focus-visible .episode-play
    background: var(--color-brand-coral)
    color: #141414
.art-fallback
  display: grid
  place-items: center
  height: 100%
  padding-bottom: 44px
  color: var(--color-text-muted)
  font-size: 0.8rem
.episode-play
  position: absolute
  inset: 50% auto auto 50%
  transform: translate(-50%, -50%)
  display: grid
  place-items: center
  width: 44px
  height: 44px
  border-radius: 50%
  background: rgba(15, 15, 15, 0.65)
  font-size: 0.9rem
.runtime
  position: absolute
  right: 8px
  bottom: 10px
  border-radius: 4px
  padding: 3px 6px
  background: rgba(15, 15, 15, 0.8)
  font-size: 0.7rem
.episode-progress
  position: absolute
  inset: auto 0 0
  height: 3px
  background: rgba(255, 255, 255, 0.2)
  span
    display: block
    height: 100%
    background: var(--color-brand-turquoise)
.episode-copy
  display: grid
  grid-template-columns: minmax(0, 1fr) auto
  align-items: center
  column-gap: 8px
  padding: 12px 2px 0
.episode-number
  grid-column: 1 / -1
  margin-bottom: 3px
  color: var(--color-text-muted)
  font-size: 0.72rem
.episode-title
  display: -webkit-box
  -webkit-box-orient: vertical
  -webkit-line-clamp: 2
  overflow: hidden
  min-width: 0
  color: var(--color-text)
  font-size: 0.95rem
  font-weight: 600
  &:hover
    color: var(--color-brand-turquoise)
.episode-copy :deep(.watch-control)
  justify-self: end
</style>
