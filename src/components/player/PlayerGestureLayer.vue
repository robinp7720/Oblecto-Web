<template>
  <div
    ref="layer"
    class="gestures"
    v-bind="handlers"
  >
    <div
      v-if="ripple"
      :key="ripple.key"
      class="ripple"
      :class="ripple.direction < 0 ? 'left' : 'right'"
      aria-hidden="true"
    >
      <span class="ripple-label">
        {{ ripple.direction < 0 ? '-' : '+' }}{{ ripple.amount }}s
      </span>
    </div>

    <div
      v-if="volumeHud !== null"
      class="hud"
      aria-hidden="true"
    >
      <PlayerIcon :name="volumeHud > 0 ? 'volume-high' : 'volume-mute'" />
      <span class="hud-track">
        <span
          class="hud-fill"
          :style="{ height: `${volumeHud * 100}%` }"
        />
      </span>
      <span class="hud-value">{{ Math.round(volumeHud * 100) }}%</span>
    </div>

    <p
      class="sr-only"
      aria-live="polite"
    >
      {{ announcement }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PlayerIcon from './PlayerIcon.vue'

defineProps({
  handlers: { type: Object, required: true },
  ripple: { type: Object, default: null },
  volumeHud: { type: Number, default: null },
  announcement: { type: String, default: '' }
})

const layer = ref(null)

defineExpose({ layer })
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.gestures
  position: absolute
  inset: 0
  // Stops a scrub or a volume swipe from scrolling the page behind the stage.
  touch-action: none
  user-select: none
  -webkit-user-select: none
  -webkit-touch-callout: none
  -webkit-tap-highlight-color: transparent

.sr-only
  +p.visually-hidden

.ripple
  position: absolute
  top: 0
  bottom: 0
  width: 42%
  display: flex
  align-items: center
  justify-content: center
  pointer-events: none
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 70%)
  animation: player-ripple 0.6s ease-out

.ripple.left
  left: 0
  border-radius: 0 50% 50% 0

.ripple.right
  right: 0
  border-radius: 50% 0 0 50%

.ripple-label
  padding: 8px 14px
  border-radius: 999px
  background: rgba(0, 0, 0, 0.55)
  color: var(--color-text)
  font-size: 1rem
  font-weight: 700
  font-variant-numeric: tabular-nums

.hud
  position: absolute
  top: 50%
  right: 6%
  transform: translateY(-50%)
  display: grid
  justify-items: center
  gap: 10px
  padding: 16px 12px
  border-radius: var(--radius-md)
  background: rgba(0, 0, 0, 0.6)
  color: var(--color-text)
  font-size: 20px
  pointer-events: none

.hud-track
  position: relative
  width: 5px
  height: 110px
  border-radius: 999px
  background: rgba(245, 245, 241, 0.25)
  overflow: hidden

.hud-fill
  position: absolute
  left: 0
  bottom: 0
  width: 100%
  border-radius: 999px
  background: var(--color-accent)

.hud-value
  font-size: 0.75rem
  font-variant-numeric: tabular-nums

@keyframes player-ripple
  from
    opacity: 0.9
  to
    opacity: 0
</style>
