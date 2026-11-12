<template>
  <div
    v-if="open"
    ref="surface"
    class="surface"
    :class="sheet ? 'as-sheet' : 'as-popover'"
  >
    <div
      v-if="sheet"
      class="backdrop"
      @click="$emit('close')"
    />
    <div
      ref="container"
      class="container"
      :role="sheet ? 'dialog' : 'group'"
      :aria-modal="sheet ? 'true' : undefined"
      :aria-label="anchor === 'audio' ? 'Audio tracks' : anchor === 'subtitles' ? 'Subtitles' : 'Playback settings'"
      :style="sheetStyle"
      @keydown="onKeydown"
    >
      <div
        v-if="sheet"
        class="handle-area"
        @pointerdown="onHandleDown"
        @pointermove="onHandleMove"
        @pointerup="onHandleUp"
        @pointercancel="onHandleUp"
      >
        <span
          class="handle"
          aria-hidden="true"
        />
      </div>
      <div
        ref="body"
        class="body"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  page: { type: String, default: null },
  anchor: { type: String, default: 'settings' },
  // True on coarse pointers / narrow viewports: the panel becomes a bottom
  // sheet rather than a popover anchored to the gear.
  sheet: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const surface = ref(null)
const container = ref(null)
const body = ref(null)
const anchorOffset = ref(0)
const dragOffset = ref(0)

let drag = null
let restoreFocus = null

const sheetStyle = computed(() => {
  if (!props.sheet) return { right: `${anchorOffset.value}px` }
  return dragOffset.value ? { transform: `translateY(${dragOffset.value}px)` } : null
})

const FOCUSABLE = 'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function focusable () {
  if (!container.value) return []
  return Array.from(container.value.querySelectorAll(FOCUSABLE))
}

function onKeydown (event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
    return
  }

  if (event.key !== 'Tab' || !props.sheet) return

  const items = focusable()
  if (items.length === 0) return

  const first = items[0]
  const last = items[items.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onHandleDown (event) {
  if (!event.isPrimary) return

  drag = { y: event.clientY, t: Date.now() }

  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch (error) {
    // Best effort.
  }
}

function onHandleMove (event) {
  if (!drag || !event.isPrimary) return

  event.preventDefault()
  dragOffset.value = Math.max(0, event.clientY - drag.y)
}

function onHandleUp (event) {
  if (!drag) return

  const distance = dragOffset.value
  const velocity = distance / Math.max(1, Date.now() - drag.t)

  try {
    event.currentTarget.releasePointerCapture(event.pointerId)
  } catch (error) {
    // Already released.
  }

  drag = null
  dragOffset.value = 0

  if (distance > 80 || velocity > 0.5) emit('close')
}

// The sheet has a backdrop, but the desktop popover needs an explicit
// outside-click close or it stays open until the gear is pressed again.
function onDocumentPointerDown (event) {
  if (!props.open || props.sheet) return
  if (container.value?.contains(event.target)) return
  // Menu triggers handle toggling/switching without closing and reopening.
  if (surface.value?.parentElement?.contains(event.target.closest?.('[data-player-menu]'))) return

  emit('close')
}

function trigger () {
  return surface.value?.parentElement?.querySelector(`[data-player-menu="${props.anchor}"]`)
}

function positionPopover () {
  if (!props.open || props.sheet) return
  const button = trigger()?.getBoundingClientRect()
  const parent = surface.value?.parentElement?.getBoundingClientRect()
  if (!button || !parent) return
  const width = container.value?.getBoundingClientRect().width || 0
  // Align with the trigger, keeping the left edge inside small/docked players.
  anchorOffset.value = Math.min(parent.right - button.right, parent.right - width - 16)
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  window.addEventListener('resize', positionPopover)
})

watch(() => [props.open, props.page, props.anchor, props.sheet], async ([isOpen, page, anchor], previous) => {
  const [wasOpen, previousPage, previousAnchor] = previous || []
  if (isOpen) {
    dragOffset.value = 0
    await nextTick()
    if (!props.open) return
    if (!wasOpen || anchor !== previousAnchor) restoreFocus = trigger() || document.activeElement
    positionPopover()
    if (body.value) body.value.scrollTop = 0
    const returningCategory = page === 'settings' && previousPage
      ? container.value?.querySelector(`[data-category="${previousPage}"]`)
      : null
    const selected = container.value?.querySelector('[aria-checked="true"]:not(:disabled)')
    const target = returningCategory || selected || focusable()[0]
    target?.focus({ preventScroll: true })
    // Selected tracks can be deep in a long list.
    if (selected && !returningCategory) selected.scrollIntoView({ block: 'nearest' })
    return
  }

  if (wasOpen && restoreFocus instanceof HTMLElement && document.contains(restoreFocus)) {
    restoreFocus.focus({ preventScroll: true })
  }
  restoreFocus = null
})

onBeforeUnmount(() => {
  drag = null
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  window.removeEventListener('resize', positionPopover)
})
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.backdrop
  position: fixed
  inset: 0
  background: var(--color-scrim-soft)

.container
  +p.player-panel

.body
  overflow-y: auto
  scroll-padding-top: 52px
  overscroll-behavior: contain
  touch-action: pan-y

.as-popover
  .container
    position: absolute
    right: 0
    bottom: calc(100% + 10px)
    width: min(340px, calc(100vw - 32px))
    border-radius: var(--radius-md)
  .body
    max-height: min(60vh, 520px)
    padding: 14px 6px

.as-sheet
  position: fixed
  inset: 0
  display: flex
  align-items: flex-end
  z-index: 2

  .container
    position: relative
    width: 100%
    border-width: 1px 0 0
    border-radius: var(--radius-lg) var(--radius-lg) 0 0
    transition: transform 0.18s ease

  .body
    max-height: min(68vh, 560px)
    padding: 4px 6px calc(20px + var(--safe-bottom))

.handle-area
  display: flex
  align-items: center
  justify-content: center
  height: 30px
  cursor: grab
  touch-action: none

.handle
  width: 40px
  height: 4px
  border-radius: 999px
  background: var(--color-border-strong)
</style>
