<template>
  <dialog
    ref="root"
    class="app-dialog"
    :class="`app-dialog--${size}`"
    :aria-labelledby="headingId"
    @cancel.prevent="close('cancel')"
    @mousedown.self="backdropArmed = true"
    @mouseup.self="onBackdropRelease"
  >
    <form
      class="app-dialog__form"
      @submit.prevent="$emit('submit')"
    >
      <header class="app-dialog__header">
        <div class="app-dialog__titles">
          <h2 :id="headingId">
            {{ title }}
          </h2>
          <p v-if="subtitle">
            {{ subtitle }}
          </p>
        </div>
        <button
          type="button"
          class="app-dialog__close"
          aria-label="Close dialog"
          @click="close('dismiss')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          ><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <div class="app-dialog__body">
        <slot />
      </div>

      <footer
        v-if="$slots.footer || $slots.status"
        class="app-dialog__footer"
      >
        <!-- Save/validation feedback sits at the leading edge of the action row
             so it reads before the buttons rather than over the page. -->
        <div class="app-dialog__status">
          <slot name="status" />
        </div>
        <div class="app-dialog__actions">
          <slot name="footer" />
        </div>
      </footer>
    </form>
  </dialog>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

// The native <dialog> element gives us the parts a hand-rolled overlay always
// got wrong: focus trap, Escape, inert background, and top-layer stacking that
// no z-index on the page can beat.
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  size: { type: String, default: 'md' }
})

const emit = defineEmits(['update:open', 'close', 'submit'])

const headingId = `app-dialog-title-${nextDialogId()}`
const root = ref(null)
const backdropArmed = ref(false)
let locked = false

watch(() => props.open, sync, { flush: 'post' })
onMounted(() => { if (props.open) sync(true) })
onBeforeUnmount(() => {
  if (root.value?.open) root.value.close()
  unlockScroll()
})

function sync (open) {
  const el = root.value
  if (!el) return

  if (open && !el.open) {
    el.showModal()
    lockScroll()
    focusFirstField(el)
  } else if (!open && el.open) {
    el.close()
    unlockScroll()
  }
}

// showModal() focuses the first focusable element, which is the close button
// in the header. A dialog that asks for input starts at its first field
// instead; one that marks a control autofocus (ConfirmDialog) already has it.
function focusFirstField (el) {
  if (el.querySelector('[autofocus]')) return
  el.querySelector('.app-dialog__body :is(input:not([type=hidden]), select, textarea):not(:disabled)')?.focus()
}

function close (reason) {
  unlockScroll()
  emit('update:open', false)
  emit('close', reason)
}

// Only treat a click as a backdrop dismiss when press and release both land
// outside the panel, so a text selection that drags out does not close it.
function onBackdropRelease () {
  if (!backdropArmed.value) return
  backdropArmed.value = false
  close('backdrop')
}

// The dialog element does not stop the page behind it from scrolling.
function lockScroll () {
  if (locked) return
  locked = true
  openDialogs += 1
  document.documentElement.classList.add('has-open-dialog')
}

function unlockScroll () {
  if (!locked) return
  locked = false
  openDialogs = Math.max(0, openDialogs - 1)
  if (openDialogs === 0) document.documentElement.classList.remove('has-open-dialog')
}
</script>

<script>
// Module scope, so ids stay unique and the scroll lock is shared across every
// dialog instance rather than reset per component.
let dialogIds = 0
let openDialogs = 0

function nextDialogId () {
  dialogIds += 1
  return dialogIds
}

export default { name: 'AppDialog' }
</script>

<style scoped lang="sass">
.app-dialog
  padding: 0
  border: 1px solid var(--color-border-strong)
  border-radius: var(--radius-lg)
  background: var(--color-surface-card)
  color: var(--color-text)
  box-shadow: var(--shadow-strong)
  width: min(var(--dialog-width, 560px), calc(100vw - 32px))
  max-height: min(calc(100vh - 48px), 820px)
  overflow: hidden

  &::backdrop
    background: rgba(8, 6, 8, 0.72)
    backdrop-filter: blur(6px)

  &[open]
    animation: dialog-in var(--motion-base) var(--ease-out)

  // Literal timing: ::backdrop does not inherit custom properties everywhere.
  &[open]::backdrop
    animation: motion-fade 220ms ease-out

.app-dialog--sm
  --dialog-width: 420px

.app-dialog--md
  --dialog-width: 560px

.app-dialog--lg
  --dialog-width: 760px

.app-dialog__form
  display: flex
  flex-direction: column
  max-height: inherit

.app-dialog__header
  display: flex
  align-items: flex-start
  gap: 16px
  padding: 20px 20px 16px
  border-bottom: 1px solid var(--color-border)

.app-dialog__titles
  flex: 1
  min-width: 0

  h2
    margin: 0
    font-family: var(--font-display)
    font-size: 1.15rem
    font-weight: 700

  p
    margin: 6px 0 0
    color: var(--color-text-muted)
    font-size: 0.85rem
    line-height: 1.5

.app-dialog__close
  flex-shrink: 0
  display: grid
  place-items: center
  width: 32px
  height: 32px
  padding: 0
  border: 1px solid transparent
  border-radius: var(--radius-sm)
  background: transparent
  color: var(--color-text-muted)
  cursor: pointer

  svg
    width: 18px
    height: 18px

  &:hover
    background: var(--color-surface-hover)
    color: var(--color-text)

.app-dialog__body
  flex: 1
  min-height: 0
  overflow-y: auto
  padding: 20px

.app-dialog__footer
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: space-between
  gap: 10px
  padding: 16px 20px
  border-top: 1px solid var(--color-border)
  background: rgba(0, 0, 0, 0.2)

.app-dialog__status
  flex: 1
  min-width: 0

.app-dialog__actions
  display: flex
  flex-wrap: wrap
  justify-content: flex-end
  gap: 10px

@keyframes dialog-in
  from
    opacity: 0
    transform: translateY(12px) scale(0.98)
  to
    opacity: 1
    transform: none

@media (max-width: 560px)
  .app-dialog
    width: calc(100vw - 24px)

  .app-dialog__actions
    flex: 1

    :deep(> .btn)
      flex: 1
</style>
