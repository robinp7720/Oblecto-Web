<template>
  <div
    class="volume"
    :class="{ expanded }"
  >
    <button
      type="button"
      class="icon-button"
      :aria-label="muted || volume === 0 ? 'Unmute' : 'Mute'"
      :title="`${muted || volume === 0 ? 'Unmute' : 'Mute'} (M)`"
      :aria-pressed="muted || volume === 0 ? 'true' : 'false'"
      @click="$emit('toggle-mute')"
    >
      <PlayerIcon :name="iconName" />
    </button>
    <label
      v-if="supported"
      class="slider-wrap"
    >
      <span class="sr-only">Volume</span>
      <input
        class="slider"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="muted ? 0 : volume"
        :style="{ '--fill': `${(muted ? 0 : volume) * 100}%` }"
        @input="$emit('set-volume', Number($event.target.value))"
      >
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PlayerIcon from './PlayerIcon.vue'

const props = defineProps({
  volume: { type: Number, default: 1 },
  muted: { type: Boolean, default: false },
  // False on iOS Safari, where writes to video.volume are ignored. The mute
  // button stays — `muted` is settable there — but a slider would do nothing.
  supported: { type: Boolean, default: true },
  expanded: { type: Boolean, default: false }
})

defineEmits(['set-volume', 'toggle-mute'])

const iconName = computed(() => {
  if (props.muted || props.volume === 0) return 'volume-mute'
  return props.volume < 0.5 ? 'volume-low' : 'volume-high'
})
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.volume
  display: inline-flex
  align-items: center
  gap: 2px

.icon-button
  +p.player-button

.sr-only
  +p.visually-hidden

.slider-wrap
  display: flex
  align-items: center
  width: 0
  overflow: hidden
  transition: width 0.18s ease

.volume:hover .slider-wrap,
.volume:focus-within .slider-wrap,
.volume.expanded .slider-wrap
  width: 88px

.slider
  width: 80px
  height: 20px
  margin: 0 4px
  padding: 0
  border: 0
  background: transparent
  appearance: none
  cursor: pointer
  &::-webkit-slider-runnable-track
    height: 4px
    border-radius: 999px
    background: linear-gradient(to right, var(--color-accent) var(--fill), rgba(245, 245, 241, 0.25) var(--fill))
  &::-moz-range-track
    height: 4px
    border-radius: 999px
    background: linear-gradient(to right, var(--color-accent) var(--fill), rgba(245, 245, 241, 0.25) var(--fill))
  &::-webkit-slider-thumb
    appearance: none
    width: 12px
    height: 12px
    margin-top: -4px
    border-radius: 50%
    background: var(--color-accent-strong)
  &::-moz-range-thumb
    width: 12px
    height: 12px
    border: 0
    border-radius: 50%
    background: var(--color-accent-strong)
  &:focus
    outline: none
    box-shadow: none
  &:focus-visible
    outline: 2px solid var(--color-text)
    outline-offset: 2px
    border-radius: 999px
</style>
