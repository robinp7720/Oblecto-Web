<template>
  <article
    class="episode-card"
    data-motion-card
  >
    <button
      class="episode-art"
      data-motion-origin
      type="button"
      :aria-label="`${playLabel} ${title}${remote.isRemote && remote.activeDevice ? ` on ${remote.activeDevice.name}` : ''}`"
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
      <CardPlayIndicator />
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
import CardPlayIndicator from '@/components/media/CardPlayIndicator.vue'
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import { useRemoteStore } from '@/remote/state'
import { formatRuntime, progressForItem, playbackLabel } from '@/utils/media'
import WatchStateButton from './WatchStateButton.vue'

const props = defineProps({ episode: { type: Object, required: true } })
defineEmits(['watch-state'])
const store = useAppStore()
const media = useMediaStore()
// Play follows the device chosen for playback; the label says where.
const remote = useRemoteStore()
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
@use '@/assets/sass/episode-card' as card

.episode-card
  +card.episode-card
</style>
