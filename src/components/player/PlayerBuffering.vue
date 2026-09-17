<template>
  <div
    v-if="shown"
    class="buffering"
    role="status"
    aria-live="polite"
  >
    <span
      class="ring"
      :class="{ still: reducedMotion }"
      aria-hidden="true"
    />
    <span class="sr-only">Buffering</span>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  reducedMotion: { type: Boolean, default: false },
  // Short `waiting` blips are constant on adaptive streams; showing the ring
  // immediately makes playback look broken when it is not.
  delay: { type: Number, default: 400 }
})

const shown = ref(false)
let timer = null

watch(() => props.active, isActive => {
  clearTimeout(timer)

  if (!isActive) {
    shown.value = false
    return
  }

  timer = setTimeout(() => { shown.value = true }, props.delay)
}, { immediate: true })

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.buffering
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  pointer-events: none

.sr-only
  +p.visually-hidden

.ring
  display: block
  width: 54px
  height: 54px
  border-radius: 50%
  border: 3px solid rgba(245, 245, 241, 0.2)
  border-top-color: var(--color-accent)
  animation: player-spin 0.9s linear infinite

// The global reduced-motion rule zeroes animation durations, which would leave
// a static ring reading as a stalled arc. Give it a visible resting state.
.ring.still
  animation: none
  border-top-color: var(--color-accent)
  border-right-color: var(--color-accent)

@keyframes player-spin
  to
    transform: rotate(360deg)
</style>
