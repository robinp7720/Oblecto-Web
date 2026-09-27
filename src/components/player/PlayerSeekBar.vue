<template>
  <div
    ref="rail"
    class="seek"
    :class="{ dragging, disabled }"
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-valuemin="0"
    :aria-valuemax="Math.round(duration)"
    :aria-valuenow="Math.round(displayTime)"
    :aria-valuetext="valueText"
    :aria-disabled="disabled ? 'true' : 'false'"
    aria-label="Seek"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @pointerleave="hover = null"
    @keydown="onKeydown"
  >
    <div class="track">
      <div
        class="buffered"
        :style="{ width: `${bufferedRatio * 100}%` }"
      />
      <div
        class="played"
        :style="{ width: `${playedRatio * 100}%` }"
      />
      <div
        class="thumb"
        :style="{ left: `${playedRatio * 100}%` }"
      />
    </div>
    <div
      v-if="tooltip !== null"
      class="tooltip"
      :style="{ left: `clamp(28px, ${tooltip.ratio * 100}%, calc(100% - 28px))` }"
      aria-hidden="true"
    >
      {{ formatSeconds(tooltip.time) }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatSeconds } from '@/utils/time'

const props = defineProps({
  currentTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  bufferedEnd: { type: Number, default: 0 },
  scrubPosition: { type: Number, default: null },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['scrub-start', 'scrub', 'scrub-end', 'activity'])

const rail = ref(null)
const dragging = ref(false)
const hover = ref(null)
const localScrub = ref(null)

const displayTime = computed(() => {
  if (localScrub.value !== null) return localScrub.value
  if (props.scrubPosition !== null) return props.scrubPosition
  return props.currentTime
})

const playedRatio = computed(() => ratio(displayTime.value))
const bufferedRatio = computed(() => ratio(props.bufferedEnd))

const valueText = computed(() => `${formatSeconds(displayTime.value)} of ${formatSeconds(props.duration)}`)

const tooltip = computed(() => {
  if (dragging.value) return { ratio: playedRatio.value, time: displayTime.value }
  if (hover.value !== null) return hover.value
  return null
})

function ratio (value) {
  if (!props.duration) return 0
  return Math.min(1, Math.max(0, value / props.duration))
}

function positionFromEvent (event) {
  const bounds = rail.value?.getBoundingClientRect()
  if (!bounds || !bounds.width) return 0

  const fraction = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
  return fraction * props.duration
}

function onPointerDown (event) {
  if (props.disabled || !props.duration || !event.isPrimary) return

  dragging.value = true
  localScrub.value = positionFromEvent(event)
  emit('activity')
  emit('scrub-start', localScrub.value)

  try {
    rail.value?.setPointerCapture(event.pointerId)
  } catch (error) {
    // Best effort; dragging still works without capture.
  }
}

function onPointerMove (event) {
  if (!event.isPrimary) return

  if (!dragging.value) {
    if (props.disabled || !props.duration) return
    const time = positionFromEvent(event)
    hover.value = { ratio: ratio(time), time }
    return
  }

  event.preventDefault()
  localScrub.value = positionFromEvent(event)
  emit('scrub', localScrub.value)
}

function onPointerUp (event) {
  if (!dragging.value || !event.isPrimary) return

  const position = localScrub.value

  try {
    rail.value?.releasePointerCapture(event.pointerId)
  } catch (error) {
    // Already released.
  }

  dragging.value = false
  localScrub.value = null
  emit('scrub-end', position)
}

function onPointerCancel () {
  if (!dragging.value) return

  dragging.value = false
  localScrub.value = null
  emit('scrub-end', null)
}

// Where the last key press asked to go. Repeated presses build on it rather
// than on currentTime, which lags until each seek completes and made quick
// presses stall on the same spot.
let pendingTarget = null
let pendingTimer = null

function onKeydown (event) {
  if (props.disabled || !props.duration) return

  // The same 10 seconds as the player's own arrow keys.
  const steps = {
    ArrowLeft: -10,
    ArrowRight: 10,
    PageDown: -60,
    PageUp: 60
  }

  let target = null

  if (event.key in steps) target = (pendingTarget ?? props.currentTime) + steps[event.key]
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = props.duration

  if (target === null) return

  event.preventDefault()
  event.stopPropagation()
  pendingTarget = Math.min(props.duration, Math.max(0, target))
  clearTimeout(pendingTimer)
  pendingTimer = setTimeout(() => { pendingTarget = null }, 1000)
  emit('activity')
  emit('scrub-end', pendingTarget)
}
</script>

<style scoped lang="sass">
.seek
  position: relative
  width: 100%
  // The rail is 4px of paint but needs a finger-sized hit area.
  padding: 12px 0
  cursor: pointer
  touch-action: none
  -webkit-tap-highlight-color: transparent
  &:focus-visible
    outline: 2px solid var(--color-text)
    outline-offset: 4px
    border-radius: 2px

.seek.disabled
  cursor: default
  opacity: 0.5

.track
  position: relative
  height: 4px
  border-radius: 999px
  background: rgba(245, 245, 241, 0.22)
  transition: height 0.12s ease

.seek:hover .track,
.seek.dragging .track,
.seek:focus-visible .track
  height: 6px

.buffered,
.played
  position: absolute
  top: 0
  left: 0
  height: 100%
  border-radius: 999px

.buffered
  background: rgba(245, 245, 241, 0.4)

.played
  background: var(--color-accent)

.thumb
  position: absolute
  top: 50%
  width: 13px
  height: 13px
  margin-left: -6.5px
  border-radius: 50%
  background: var(--color-accent-strong)
  transform: translateY(-50%) scale(0)
  transition: transform 0.12s ease

.seek:hover .thumb,
.seek.dragging .thumb,
.seek:focus-visible .thumb
  transform: translateY(-50%) scale(1)

.tooltip
  position: absolute
  bottom: calc(100% - 2px)
  transform: translateX(-50%)
  padding: 4px 8px
  border-radius: var(--radius-sm)
  background: var(--color-surface-card)
  border: 1px solid var(--color-border)
  color: var(--color-text)
  font-size: 0.75rem
  font-variant-numeric: tabular-nums
  white-space: nowrap
  pointer-events: none

@media (pointer: coarse)
  .seek
    padding: 14px 0
  .thumb
    width: 16px
    height: 16px
    margin-left: -8px
    transform: translateY(-50%) scale(1)
</style>
