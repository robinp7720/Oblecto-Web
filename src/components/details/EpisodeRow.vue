<template>
  <article
    class="episode-row"
    data-motion-card
  >
    <span class="episode-number">{{ episode.airedEpisodeNumber ?? '—' }}</span>
    <button
      class="episode-art"
      data-motion-origin
      type="button"
      :aria-label="`Play ${title}`"
      @click="play"
    >
      <img
        v-if="!imageFailed"
        :src="artwork"
        alt=""
        loading="lazy"
        @error="imageFailed = true"
      >
      <span
        class="episode-play"
        aria-hidden="true"
      >▶</span>
      <span
        v-if="progress > 0"
        class="episode-progress"
        :style="{ width: `${progress * 100}%` }"
      />
    </button>
    <div class="episode-copy">
      <div class="episode-heading">
        <RouterLink :to="{ name: 'EpisodeInfo', params: { episodeId: episode.id } }">
          {{ title }}
        </RouterLink><span v-if="episode.runtime">{{ formatRuntime(episode.runtime) }}</span>
      </div>
      <p>{{ episode.overview || 'No synopsis available yet.' }}</p>
      <span
        v-if="progress >= 0.9"
        class="watched"
      >Watched</span>
    </div>
  </article>
</template>
<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { getSocket } from '@/socket'
import { imageUrl, formatRuntime, progressForItem } from '@/utils/media'
const props = defineProps({ episode: { type: Object, required: true } })
const store = useStore()
const imageFailed = ref(false)
const progress = ref(0)
const title = computed(() => props.episode.episodeName || `Episode ${props.episode.airedEpisodeNumber ?? ''}`)
const artwork = computed(() => imageUrl(store.state.host, 'episode', props.episode.id, 'banner'))
watch(artwork, () => { imageFailed.value = false })
watch(() => props.episode, value => { progress.value = Math.max(0, Math.min(1, progressForItem('episode', value))) }, { immediate: true, deep: true })
function play () { store.dispatch('playEpisode', props.episode.id) }
function updateProgress (message) {
  if (String(message.episodeId) === String(props.episode.id)) progress.value = Math.max(0, Math.min(1, Number(message.progress) || 0))
}
let socket
onMounted(() => { socket = getSocket(); socket?.on('client-episode-progress', updateProgress) })
onBeforeUnmount(() => socket?.off('client-episode-progress', updateProgress))
</script>
<style scoped lang="sass">
.episode-row
  display: grid
  grid-template-columns: 24px 180px minmax(0, 1fr)
  align-items: center
  gap: 24px
  padding: 24px 12px
  border-bottom: 1px solid var(--color-border)
  &:hover, &:focus-within
    background: var(--color-surface)
.episode-number
  color: var(--color-text-faint)
  font-size: 1.25rem
  text-align: center
.episode-art
  position: relative
  aspect-ratio: 16 / 9
  padding: 0
  border: 0
  border-radius: 4px
  overflow: hidden
  background: var(--color-brand-blue)
  cursor: pointer
  img
    display: block
    width: 100%
    height: 100%
    object-fit: cover
.episode-play
  position: absolute
  left: calc(50% - 18px)
  top: calc(50% - 18px)
  display: grid
  place-items: center
  width: 36px
  height: 36px
  border: 1px solid white
  border-radius: 50%
  background: #0009
  color: white
.episode-progress
  position: absolute
  bottom: 0
  left: 0
  height: 4px
  background: var(--color-accent)
.episode-copy
  min-width: 0
  p
    font-size: 0.875rem
    line-height: 1.6
    color: var(--color-text-muted)
    display: -webkit-box
    -webkit-line-clamp: 3
    -webkit-box-orient: vertical
    overflow: hidden
    margin: 10px 0 0
.episode-heading
  display: flex
  align-items: baseline
  justify-content: space-between
  gap: 16px
  a
    font-weight: 700
    &:hover
      color: var(--color-brand-turquoise)
  span
    color: var(--color-text-muted)
    white-space: nowrap
    font-size: 0.8rem
.watched
  display: inline-block
  color: var(--color-brand-turquoise)
  font-size: 0.75rem
  margin-top: 8px
@media (max-width: 760px)
  .episode-row
    grid-template-columns: 110px minmax(0, 1fr)
    gap: 12px
    padding: 20px 0
  .episode-number
    display: none
  .episode-heading
    display: block
    span
      display: block
      margin-top: 6px
  .episode-copy p
    -webkit-line-clamp: 2
@media (max-width: 400px)
  .episode-row
    grid-template-columns: 88px minmax(0, 1fr)
    gap: 8px
</style>
