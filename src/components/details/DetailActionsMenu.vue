<template>
  <div
    ref="root"
    class="detail-actions-menu"
    @keydown.esc.stop.prevent="close(true)"
    @focusout="focusOut"
  >
    <button
      ref="trigger"
      type="button"
      class="more-trigger"
      :aria-label="label"
      title="More actions"
      :aria-expanded="open"
      :aria-controls="`detail-actions-${id}`"
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
      :id="`detail-actions-${id}`"
      ref="panel"
      class="more-panel"
      role="group"
      :aria-label="label"
    >
      <slot :close="close" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ id: { type: [String, Number], required: true }, label: { type: String, default: 'More actions' } })
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
watch(() => props.id, () => close())
onMounted(() => document.addEventListener('pointerdown', outsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', outsideClick))
</script>

<style scoped lang="sass">
.detail-actions-menu
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
  :deep(.menu-action), :deep(.detail-button.secondary)
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
  :deep(.files-action)
    border-top: 1px solid var(--color-border)
    border-radius: 0
    margin-top: 4px
  :deep(.save-error), :deep(.watch-error)
    padding: 0 12px 10px
</style>
