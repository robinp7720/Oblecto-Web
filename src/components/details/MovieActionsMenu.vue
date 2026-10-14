<template>
  <div
    ref="root"
    class="movie-actions-menu"
    @keydown.esc.stop.prevent="close(true)"
    @focusout="focusOut"
  >
    <button
      ref="trigger"
      type="button"
      class="more-trigger"
      aria-label="More movie actions"
      title="More actions"
      :aria-expanded="open"
      :aria-controls="`movie-actions-${movie.id}`"
      @click="toggle"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      ><circle
        cx="5"
        cy="12"
        r="1.5"
      /><circle
        cx="12"
        cy="12"
        r="1.5"
      /><circle
        cx="19"
        cy="12"
        r="1.5"
      /></svg>
    </button>
    <div
      v-show="open"
      :id="`movie-actions-${movie.id}`"
      ref="panel"
      class="more-panel"
      role="group"
      aria-label="More movie actions"
    >
      <button
        v-if="resuming"
        type="button"
        class="menu-action"
        @click="$emit('start-over'); close(true)"
      >
        <span aria-hidden="true">↺</span> Start over
      </button>
      <WatchStateButton
        :id="movie.id"
        :track="movie.TrackMovies?.[0]"
        type="movie"
        @updated="$emit('watch-updated', $event)"
      />
      <MovieSaveButtons
        :id="movie.id"
        :state="movie.userState"
        kind="favourite"
        @updated="$emit('user-updated', $event)"
      />
      <a
        href="#movie-files"
        class="menu-action files-action"
        @click="$emit('files'); close()"
      >Available files</a>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import WatchStateButton from '@/components/details/WatchStateButton.vue'
import MovieSaveButtons from '@/components/details/MovieSaveButtons.vue'

const props = defineProps({ movie: { type: Object, required: true }, resuming: { type: Boolean, default: false } })
defineEmits(['start-over', 'watch-updated', 'user-updated', 'files'])
const root = ref(null)
const trigger = ref(null)
const panel = ref(null)
const open = ref(false)
function close (restoreFocus = false) {
  open.value = false
  if (restoreFocus) trigger.value?.focus()
}
async function toggle () {
  if (open.value) return close()
  open.value = true
  await nextTick()
  panel.value?.querySelector('button:not(:disabled), a').focus()
}
function outsideClick (event) { if (!root.value?.contains(event.target)) close() }
function focusOut (event) { if (event.relatedTarget && !root.value?.contains(event.relatedTarget)) close() }
watch(() => props.movie.id, () => close())
onMounted(() => document.addEventListener('pointerdown', outsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', outsideClick))
</script>

<style scoped lang="sass">
.movie-actions-menu
  position: relative
  align-self: center
.more-trigger
  display: grid
  place-items: center
  width: 44px
  height: 44px
  padding: 0
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  background: rgba(20, 20, 20, 0.65)
  color: var(--color-text)
  cursor: pointer
  &:hover, &[aria-expanded="true"]
    background: var(--color-surface-hover)
    border-color: var(--color-border-strong)
.more-panel
  position: absolute
  z-index: 10
  top: calc(100% + 8px)
  right: 0
  width: 240px
  max-width: calc(100vw - 2 * var(--page-gutter))
  padding: 6px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-md)
  background: var(--color-surface)
  box-shadow: var(--shadow-strong)
  :deep(.watch-control), :deep(.save-control)
    justify-items: stretch
  .menu-action, :deep(.detail-button.secondary)
    display: flex
    align-items: center
    justify-content: flex-start
    gap: 10px
    width: 100%
    min-height: 44px
    padding: 10px 12px
    border: 0
    border-radius: var(--radius-sm)
    background: transparent
    color: var(--color-text)
    text-align: left
    font-size: 0.875rem
    font-weight: 400
    text-decoration: none
    cursor: pointer
    &:hover:not(:disabled)
      background: var(--color-surface-hover)
    &[aria-pressed="true"]
      color: var(--color-brand-turquoise)
  .files-action
    border-top: 1px solid var(--color-border)
    border-radius: 0
    margin-top: 4px
  :deep(.save-error), :deep(.watch-error)
    padding: 0 12px 10px
</style>
