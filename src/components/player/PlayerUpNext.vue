<template>
  <aside
    class="up-next"
    aria-label="Up next"
  >
    <div class="copy">
      <p class="label">
        {{ countdown ? `Next episode in ${remaining}` : 'Up next' }}
      </p>
      <PlayerEpisodePreview
        :info="{ title, numbering, artwork, runtime }"
        playable
        :action-label="countdown ? 'Play now' : 'Play next'"
        :countdown="countdown"
        :elapsed="elapsed"
        @play="$emit('play')"
      />
    </div>
    <div class="actions">
      <button
        v-if="skipLabel"
        type="button"
        class="text-action"
        @click="$emit('skip')"
      >
        {{ skipLabel }}
      </button>
      <button
        type="button"
        class="text-action"
        @click="$emit(countdown ? 'cancel' : 'dismiss')"
      >
        {{ countdown ? 'Cancel' : 'Not now' }}
      </button>
    </div>
    <!-- Announced once per state, not every second of the countdown. -->
    <p
      class="sr-only"
      role="status"
    >
      {{ countdown ? `Next episode, ${title}, starts in ${total} seconds.` : `Up next: ${title}.` }}
    </p>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import PlayerEpisodePreview from './PlayerEpisodePreview.vue'

// The next episode, offered outside the auto-hiding controls so it is there
// when the credits roll. With autoplay on it counts down, in playback time
// (pausing pauses it), and starts the episode itself.
const props = defineProps({
  title: { type: String, required: true },
  artwork: { type: String, default: '' },
  runtime: { type: String, default: '' },
  skipLabel: { type: String, default: '' },
  numbering: { type: String, default: '' },
  countdown: { type: Boolean, default: false },
  remaining: { type: Number, default: 0 },
  total: { type: Number, default: 10 }
})

defineEmits(['play', 'cancel', 'dismiss', 'skip'])

const elapsed = computed(() => props.total ? 1 - props.remaining / props.total : 0)
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.up-next
  position: absolute
  right: 24px
  bottom: 112px
  display: grid
  grid-template-rows: minmax(0, 1fr) auto
  gap: 2px
  width: min(260px, calc(100% - 32px))
  max-height: calc(100% - 130px)
  overflow: hidden
  animation: motion-rise var(--motion-base) var(--ease-out)

.copy
  display: grid
  gap: 8px
  min-height: 0
  overflow: auto

.label
  +p.player-label
  color: rgba(255, 255, 255, 0.85)
  font-weight: 500
  letter-spacing: 0
  text-transform: none
  text-shadow: 0 1px 4px #000, 0 0 8px #000

.copy :deep(.episode-copy)
  padding-top: 8px
  text-shadow: 0 1px 4px #000, 0 0 8px #000

.copy :deep(.countdown-progress)
  height: 2px

.actions
  display: flex
  justify-content: space-between
  gap: 12px

.text-action
  min-width: 44px
  min-height: 44px
  padding: 0 4px
  border: 0
  border-radius: var(--radius-sm)
  background: transparent
  color: rgba(255, 255, 255, 0.85)
  font-size: 0.8rem
  font-weight: 500
  text-shadow: 0 1px 4px #000, 0 0 8px #000
  cursor: pointer
  touch-action: manipulation
  &:last-child
    margin-left: auto
  &:hover
    color: white
    text-decoration: underline
    text-underline-offset: 3px
  &:focus-visible
    outline: 2px solid white
    outline-offset: -2px

.sr-only
  +p.visually-hidden

@media (max-width: 760px)
  .up-next
    right: 12px
    bottom: 96px
    width: min(220px, calc(100% - 24px))
</style>
