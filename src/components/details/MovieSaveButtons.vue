<template>
  <div
    v-for="action in actions"
    :key="action.key"
    class="save-control"
    :class="{ 'icon-only': iconOnly, 'movie-watchlist': action.key === 'watchlist', 'episode-favourite': type === 'episode' }"
  >
    <button
      type="button"
      class="detail-button secondary"
      :class="{ 'save-icon': iconOnly }"
      :aria-pressed="Boolean(state[action.key])"
      :aria-label="label(action)"
      :title="iconOnly ? label(action) : undefined"
      :disabled="saving[action.key]"
      @click="toggle(action.key)"
    >
      <svg
        v-if="iconOnly || action.key === 'favourite'"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          v-if="action.key === 'watchlist'"
          d="M6 4h12v17l-6-4-6 4V4Z"
        />
        <path
          v-else
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
        />
      </svg>
      <span v-if="!iconOnly">{{ label(action) }}</span>
    </button>
    <span
      v-if="errors[action.key]"
      class="save-error"
      role="status"
    >{{ errors[action.key] }}</span>
  </div>
</template>

<script setup>
import { computed, reactive, watch, onBeforeUnmount } from 'vue'
import oblectoClient from '@/oblectoClient'
import { useMediaStore } from '@/stores/media'
import { describeError } from '@/composables/useSaveState'

const props = defineProps({
  type: { type: String, default: 'movie' },
  id: { type: [Number, String], required: true },
  state: { type: Object, default: () => ({}) },
  kind: { type: String, default: '' },
  iconOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['updated'])
const media = useMediaStore()
const actions = computed(() => [
  { key: 'favourite', label: 'Add to favourites', saved: 'Remove from favourites' },
  { key: 'watchlist', label: 'Add to watchlist', saved: 'Remove from watchlist' }
].filter(action => (props.type !== 'episode' || action.key === 'favourite') && (!props.kind || action.key === props.kind)))
const saving = reactive({ favourite: false, watchlist: false })
const errors = reactive({ favourite: '', watchlist: '' })
function label (action) { return saving[action.key] ? 'Saving…' : props.state[action.key] ? action.saved : action.label }
let generation = 0
watch(() => [props.id, props.type], () => {
  generation++
  Object.assign(saving, { favourite: false, watchlist: false })
  Object.assign(errors, { favourite: '', watchlist: '' })
})
onBeforeUnmount(() => { generation++ })
async function toggle (key) {
  if (saving[key]) return
  const current = generation
  const epoch = media.epoch
  saving[key] = true
  errors[key] = ''
  try {
    const client = oblectoClient[`${props.type}Library`]
    const result = await (key === 'favourite' ? client.setFavourite(props.id, !props.state[key]) : client.setWatchlist(props.id, !props.state[key]))
    if (current !== generation || epoch !== media.epoch) return
    if (typeof result?.[key] !== 'boolean') throw new Error('Invalid saved-item response')
    emit('updated', { [key]: result[key] })
  } catch (error) {
    if (current === generation && epoch === media.epoch) errors[key] = describeError(error, 'Could not save this change. Try again.')
  } finally {
    if (current === generation) saving[key] = false
  }
}
</script>

<style scoped lang="sass">
.save-control
  position: relative
  display: grid
  gap: 6px
  justify-items: start
  button[aria-pressed="true"]
    border-color: var(--color-brand-turquoise)
  button:disabled
    opacity: 0.6
    cursor: progress
  .save-icon
    width: 44px
    min-height: 44px
    padding: 0
    background: rgba(20, 20, 20, 0.65)
    border-color: var(--color-border)
    &[aria-pressed="true"]
      color: var(--color-brand-turquoise)
      border-color: var(--color-brand-turquoise)
      svg
        fill: rgba(98, 220, 219, 0.15)
.icon-only .save-error
  position: absolute
  z-index: 2
  top: calc(100% + 8px)
  right: 0
  width: min(240px, calc(100vw - 48px))
  padding: 12px
  background: var(--color-bg-2)
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
.save-error
  max-width: 32ch
  color: var(--color-danger)
  font-size: 0.8rem
</style>
