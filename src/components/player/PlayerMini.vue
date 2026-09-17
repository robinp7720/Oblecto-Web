<template>
  <div class="mini">
    <button
      type="button"
      class="expand"
      :aria-label="`Expand player: ${title}`"
      @click="$emit('expand')"
    />

    <div
      v-if="showArt"
      class="art"
    >
      <img
        v-if="artwork && !artFailed"
        :src="artwork"
        alt=""
        @error="artFailed = true"
      >
    </div>

    <div class="copy">
      <p class="title">
        {{ title }}
      </p>
      <p
        v-if="subtitle"
        class="subtitle"
      >
        {{ subtitle }}
      </p>
    </div>

    <button
      type="button"
      class="icon-button"
      :aria-label="paused ? 'Play' : 'Pause'"
      @click="$emit('toggle-play')"
    >
      <PlayerIcon :name="paused ? 'play' : 'pause'" />
    </button>

    <button
      type="button"
      class="icon-button"
      aria-label="Stop playback"
      @click="$emit('stop')"
    >
      <PlayerIcon name="close" />
    </button>

    <div
      class="progress"
      aria-hidden="true"
    >
      <span :style="{ width: `${progress * 100}%` }" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PlayerIcon from './PlayerIcon.vue'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  artwork: { type: String, default: '' },
  // Only the phone bar needs it: the desktop card already shows the frame in
  // its own 16:9 row above the strip.
  showArt: { type: Boolean, default: false },
  paused: { type: Boolean, default: true },
  progress: { type: Number, default: 0 }
})

defineEmits(['expand', 'toggle-play', 'stop'])

const artFailed = ref(false)
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.mini
  position: relative
  display: flex
  align-items: center
  gap: 10px
  height: 100%
  padding: 8px 8px 10px 10px

// Covers the card so the whole surface expands; the buttons sit above it.
.expand
  position: absolute
  inset: 0
  border: 0
  background: transparent
  cursor: pointer
  &:focus-visible
    outline: 2px solid var(--color-text)
    outline-offset: -3px
    border-radius: var(--radius-md)

.art,
.copy,
.icon-button
  position: relative

.art
  flex: none
  width: 52px
  height: 34px
  border-radius: var(--radius-sm)
  background: #000
  overflow: hidden

  img
    width: 100%
    height: 100%
    object-fit: cover

.copy
  flex: 1
  min-width: 0
  pointer-events: none

.title,
.subtitle
  margin: 0
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.title
  font-size: 0.85rem
  font-weight: 700

.subtitle
  color: var(--color-text-faint)
  font-size: 0.72rem

.icon-button
  +p.player-button
  min-width: 38px
  min-height: 38px
  font-size: 18px

.progress
  position: absolute
  left: 0
  right: 0
  bottom: 0
  height: 2px
  background: rgba(245, 245, 241, 0.18)

  span
    display: block
    height: 100%
    background: var(--color-accent)
</style>
