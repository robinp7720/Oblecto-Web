<template>
  <div
    v-if="details.duration || details.progress"
    class="movie-progress"
  >
    <progress
      :value="details.watched ? 100 : details.progress * 100"
      max="100"
      aria-label="Viewing progress"
    />
    <div class="progress-copy">
      <span>{{ progressLabel }}</span>
      <span v-if="finishTime">Finish at {{ finishTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { moviePlaybackDetails } from '@/utils/movieDetails'
import { formatRuntime } from '@/utils/media'
const props = defineProps({ movie: { type: Object, default: null }, episode: { type: Object, default: null } })
const now = ref(Date.now())
let timer
onMounted(() => { timer = window.setInterval(() => { now.value = Date.now() }, 30000) })
onBeforeUnmount(() => window.clearInterval(timer))
const details = computed(() => moviePlaybackDetails(props.episode ? { ...props.episode, TrackMovies: props.episode.TrackEpisodes } : props.movie))
const progressLabel = computed(() => {
  if (details.value.watched) return 'Watched'
  if (details.value.resuming && details.value.duration) return `${Math.ceil(details.value.remainingSeconds / 60)} min left`
  if (details.value.duration) return formatRuntime(details.value.duration / 60)
  return `${Math.round(details.value.progress * 100)}% watched`
})
const finishTime = computed(() => {
  if (!details.value.duration) return ''
  const date = new Date(now.value + details.value.remainingSeconds * 1000)
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric', minute: '2-digit', ...(date.toDateString() !== new Date(now.value).toDateString() ? { weekday: 'short' } : {})
  }).format(date)
})
</script>

<style scoped lang="sass">
.movie-progress
  margin-top: 18px
  max-width: 380px
.progress-copy
  display: flex
  flex-wrap: wrap
  justify-content: space-between
  gap: 8px 16px
  margin-top: 8px
  font-size: 0.75rem
  color: var(--color-text-muted)
progress
  display: block
  width: 100%
  height: 3px
  margin: 0
  border: 0
  border-radius: 99px
  overflow: hidden
  background: var(--color-border)
  color: var(--color-brand-turquoise)
  &::-webkit-progress-bar
    background: var(--color-border)
  &::-webkit-progress-value
    background: var(--color-brand-turquoise)
  &::-moz-progress-bar
    background: var(--color-brand-turquoise)
</style>
