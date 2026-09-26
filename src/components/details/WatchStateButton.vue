<template>
  <div
    class="watch-control"
    :class="{ compact, 'status-label': statusLabel }"
  >
    <button
      type="button"
      :class="compact ? 'watch-button' : 'detail-button secondary'"
      :disabled="saving"
      :aria-pressed="watched"
      :aria-label="statusLabel ? actionLabel : undefined"
      :title="statusLabel ? actionLabel : undefined"
      @click="toggle"
    >
      <span aria-hidden="true">{{ watched ? '✓' : '○' }}</span>
      {{ saving ? 'Saving…' : statusLabel ? watchState : watched ? 'Mark unwatched' : 'Mark watched' }}
    </button>
    <span
      v-if="error"
      class="watch-error"
      role="status"
    >{{ error }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import oblectoClient from '@/oblectoClient'
import { describeError } from '@/composables/useSaveState'
import { useMediaStore } from '@/stores/media'

const props = defineProps({
  type: { type: String, required: true },
  id: { type: [Number, String], required: true },
  track: { type: Object, default: null },
  compact: { type: Boolean, default: false },
  statusLabel: { type: Boolean, default: false },
  itemTitle: { type: String, default: 'episode' }
})
const emit = defineEmits(['updated'])
const media = useMediaStore()
const saving = ref(false)
const error = ref('')
const watched = computed(() => Number(props.track?.progress) >= 0.9)
const watchState = computed(() => watched.value ? 'Watched' : Number(props.track?.progress) > 0 ? 'In progress' : 'Unwatched')
const actionLabel = computed(() => `Mark ${props.itemTitle} ${watched.value ? 'unwatched' : 'watched'}`)
let request = 0
watch(() => [props.type, props.id], () => { request++; saving.value = false; error.value = '' })

async function toggle () {
  if (saving.value) return
  saving.value = true
  error.value = ''
  const current = ++request
  const epoch = media.epoch
  const { type, id } = props
  try {
    const client = type === 'movie' ? oblectoClient.movieLibrary : oblectoClient.episodeLibrary
    const result = await client.setWatched(id, !watched.value)
    if (epoch !== media.epoch) return
    if (!result?.track) throw new Error('Invalid watch-state response')
    media.applyProgress({ type, id, track: { ...result.track, updatedAt: result.track.updatedAt || new Date().toISOString() } }, { persisted: true })
    if (current === request) emit('updated', result.track)
  } catch (reason) {
    if (current === request && epoch === media.epoch) error.value = describeError(reason, 'Could not update watch state')
  } finally {
    if (current === request) saving.value = false
  }
}
</script>

<style scoped lang="sass">
.watch-control
  display: grid
  gap: 6px
  justify-items: start
.watch-button
  display: inline-flex
  align-items: center
  gap: 7px
  min-height: 34px
  padding: 5px 9px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  background: transparent
  color: var(--color-text-muted)
  font-size: 0.72rem
  cursor: pointer
  &:hover:not(:disabled)
    color: var(--color-brand-turquoise)
    border-color: var(--color-brand-turquoise)
  &:disabled
    opacity: 0.6
    cursor: progress
.watch-error
  max-width: 32ch
  color: var(--color-danger)
  font-size: 0.72rem
  line-height: 1.35
.compact .watch-error
  grid-column: 1 / -1
.status-label .watch-button
  min-height: 44px
  border-color: transparent
  padding: 5px 0
  &[aria-pressed="true"]
    color: var(--color-brand-turquoise)
</style>
