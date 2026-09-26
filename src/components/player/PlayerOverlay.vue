<template>
  <div
    class="overlay"
    :class="{ hidden: !visible }"
    :aria-hidden="visible ? 'false' : 'true'"
    :inert="visible ? undefined : true"
    @pointerenter="$emit('activity')"
    @focusin="$emit('activity')"
  >
    <div class="top">
      <button
        type="button"
        class="icon-button"
        aria-label="Minimize player"
        @click="$emit('minimize')"
      >
        <PlayerIcon name="chevron-down" />
      </button>

      <div class="titles">
        <component
          :is="subtitle && canViewShow ? 'button' : 'p'"
          v-if="subtitle"
          class="subtitle"
          :type="canViewShow ? 'button' : undefined"
          @click="canViewShow && $emit('view-show')"
        >
          {{ subtitle }}
        </component>
        <h2 class="title">
          {{ title }}
        </h2>
      </div>

      <button
        type="button"
        class="icon-button"
        aria-label="Stop playback"
        @click="$emit('stop')"
      >
        <PlayerIcon name="close" />
      </button>
    </div>

    <div
      v-if="showCentreTransport"
      class="centre"
    >
      <button
        type="button"
        class="icon-button centre-side"
        aria-label="Back 10 seconds"
        title="Back 10 seconds (←)"
        @click="$emit('seek-by', -10)"
      >
        <PlayerIcon name="replay-10" />
      </button>
      <button
        type="button"
        class="centre-play"
        :aria-label="paused ? 'Play' : 'Pause'"
        :title="`${paused ? 'Play' : 'Pause'} (Space)`"
        @click="$emit('toggle-play')"
      >
        <PlayerIcon :name="paused ? 'play' : 'pause'" />
      </button>
      <button
        type="button"
        class="icon-button centre-side"
        aria-label="Forward 10 seconds"
        title="Forward 10 seconds (→)"
        @click="$emit('seek-by', 10)"
      >
        <PlayerIcon name="forward-10" />
      </button>
    </div>

    <div class="bottom">
      <PlayerSeekBar
        :current-time="currentTime"
        :duration="duration"
        :buffered-end="bufferedEnd"
        :scrub-position="scrubPosition"
        :disabled="!duration"
        @scrub-start="$emit('scrub-start', $event)"
        @scrub="$emit('scrub', $event)"
        @scrub-end="$emit('scrub-end', $event)"
        @activity="$emit('activity')"
      />

      <div class="times">
        <span>{{ formatSeconds(displayTime) }}</span>
        <span class="remaining">{{ formatRemaining(displayTime, duration) }}</span>
      </div>

      <div class="controls">
        <button
          v-if="!showCentreTransport"
          type="button"
          class="icon-button"
          :aria-label="paused ? 'Play' : 'Pause'"
          :title="`${paused ? 'Play' : 'Pause'} (Space)`"
          @click="$emit('toggle-play')"
        >
          <PlayerIcon :name="paused ? 'play' : 'pause'" />
        </button>
        <button
          v-if="!showCentreTransport"
          type="button"
          class="icon-button"
          aria-label="Back 10 seconds"
          title="Back 10 seconds (←)"
          @click="$emit('seek-by', -10)"
        >
          <PlayerIcon name="replay-10" />
        </button>
        <button
          v-if="!showCentreTransport"
          type="button"
          class="icon-button"
          aria-label="Forward 10 seconds"
          title="Forward 10 seconds (→)"
          @click="$emit('seek-by', 10)"
        >
          <PlayerIcon name="forward-10" />
        </button>

        <PlayerVolume
          v-if="!compact"
          :volume="volume"
          :muted="muted"
          :supported="volumeSupported"
          @set-volume="$emit('set-volume', $event)"
          @toggle-mute="$emit('toggle-mute')"
        />

        <span class="spacer" />

        <button
          v-if="subtitlesAvailable"
          type="button"
          class="icon-button"
          :class="{ on: subtitlesOn }"
          :aria-label="subtitlesOn ? 'Turn subtitles off' : 'Turn subtitles on'"
          title="Subtitles (C)"
          :aria-pressed="subtitlesOn ? 'true' : 'false'"
          @click="$emit('toggle-subtitles')"
        >
          <PlayerIcon name="captions" />
        </button>

        <button
          v-if="!compact"
          type="button"
          class="icon-button rate"
          aria-label="Change playback speed"
          title="Playback speed ([ and ])"
          @click="$emit('cycle-rate')"
        >
          {{ playbackRate }}x
        </button>

        <div class="settings-anchor">
          <button
            ref="settingsButton"
            type="button"
            class="icon-button"
            aria-label="Playback settings"
            title="Settings (? for shortcuts)"
            :aria-expanded="settingsOpen ? 'true' : 'false'"
            @click="$emit('toggle-settings')"
          >
            <PlayerIcon name="settings" />
          </button>
          <slot name="settings" />
        </div>

        <button
          v-if="pipSupported && !compact"
          type="button"
          class="icon-button"
          aria-label="Picture in picture"
          @click="$emit('pip')"
        >
          <PlayerIcon name="pip" />
        </button>

        <button
          v-if="fullscreenSupported"
          type="button"
          class="icon-button"
          :aria-label="isFullscreen ? 'Exit full screen' : 'Full screen'"
          :title="`${isFullscreen ? 'Exit full screen' : 'Full screen'} (F)`"
          :aria-pressed="isFullscreen ? 'true' : 'false'"
          @click="$emit('toggle-fullscreen')"
        >
          <PlayerIcon :name="isFullscreen ? 'compress' : 'expand'" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PlayerIcon from './PlayerIcon.vue'
import PlayerSeekBar from './PlayerSeekBar.vue'
import PlayerVolume from './PlayerVolume.vue'
import { formatRemaining, formatSeconds } from '@/utils/time'

const props = defineProps({
  visible: { type: Boolean, default: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  canViewShow: { type: Boolean, default: false },
  paused: { type: Boolean, default: true },
  currentTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  bufferedEnd: { type: Number, default: 0 },
  scrubPosition: { type: Number, default: null },
  volume: { type: Number, default: 1 },
  muted: { type: Boolean, default: false },
  volumeSupported: { type: Boolean, default: true },
  playbackRate: { type: Number, default: 1 },
  subtitlesOn: { type: Boolean, default: false },
  // The file has subtitle tracks; without any, the captions button would only
  // ever toggle nothing.
  subtitlesAvailable: { type: Boolean, default: true },
  settingsOpen: { type: Boolean, default: false },
  pipSupported: { type: Boolean, default: false },
  fullscreenSupported: { type: Boolean, default: false },
  isFullscreen: { type: Boolean, default: false },
  // Phone layout: transport moves to the centre of the stage so it is
  // thumb-reachable, and the bottom row keeps only the essentials instead of
  // wrapping into a pile.
  compact: { type: Boolean, default: false }
})

defineEmits([
  'activity', 'minimize', 'pip', 'stop', 'view-show', 'toggle-play', 'seek-by',
  'scrub-start', 'scrub', 'scrub-end', 'set-volume', 'toggle-mute',
  'toggle-subtitles', 'cycle-rate', 'toggle-settings', 'toggle-fullscreen'
])

const showCentreTransport = computed(() => props.compact)
const displayTime = computed(() => props.scrubPosition ?? props.currentTime)
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.overlay
  position: absolute
  inset: 0
  display: flex
  flex-direction: column
  justify-content: space-between
  opacity: 1
  transition: opacity 0.2s ease
  // Only the chrome itself is interactive; gaps fall through to the gesture
  // layer underneath so a tap between controls still toggles the overlay.
  pointer-events: none

  > *
    pointer-events: auto

.overlay.hidden
  opacity: 0
  pointer-events: none

  > *
    pointer-events: none

.icon-button
  +p.player-button

.top
  display: flex
  align-items: flex-start
  gap: 12px
  padding: calc(12px + var(--safe-top)) calc(16px + var(--safe-right)) 48px calc(16px + var(--safe-left))
  background: var(--player-scrim-top)

.titles
  flex: 1
  min-width: 0
  padding-top: 4px

.title
  margin: 0
  font-size: 1.05rem
  font-weight: 700
  letter-spacing: -0.01em
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.subtitle
  display: block
  max-width: 100%
  margin: 0 0 2px
  padding: 0
  border: 0
  background: transparent
  color: var(--color-brand-turquoise)
  font-size: 0.8rem
  text-align: left
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

button.subtitle
  // Padded out so the inline link is still a comfortable tap target.
  padding: 4px 0
  margin-bottom: -2px
  cursor: pointer
  &:hover
    text-decoration: underline

.centre
  display: flex
  align-items: center
  justify-content: center
  gap: 28px
  pointer-events: none

  > *
    pointer-events: auto

.centre-side
  font-size: 30px
  min-width: 56px
  min-height: 56px

.centre-play
  display: inline-flex
  align-items: center
  justify-content: center
  width: var(--control-size-lg)
  height: var(--control-size-lg)
  border: 0
  border-radius: 50%
  background: var(--color-brand-coral)
  color: #141414
  font-size: 30px
  cursor: pointer
  touch-action: manipulation
  transition: transform 0.15s ease, background-color 0.15s ease
  &:hover
    background: var(--color-brand-orange)
  &:active
    transform: scale(0.94)
  &:focus-visible
    outline: 2px solid var(--color-text)
    outline-offset: 3px

.bottom
  padding: 64px calc(16px + var(--safe-right)) calc(14px + var(--safe-bottom)) calc(16px + var(--safe-left))
  background: var(--player-scrim)

.times
  display: flex
  justify-content: space-between
  margin: -4px 0 6px
  color: var(--color-text-muted)
  font-size: 0.78rem
  font-variant-numeric: tabular-nums

.controls
  display: flex
  align-items: center
  gap: 4px
  // A control row must never become a second line on a phone. `nowrap` alone
  // does that - clipping with `overflow: hidden` would also eat the settings
  // popover, which rises out of this row.
  flex-wrap: nowrap
  min-width: 0

.spacer
  flex: 1

.rate
  font-size: 0.8rem
  font-weight: 700
  font-variant-numeric: tabular-nums

.icon-button.on
  color: var(--color-accent-strong)

.settings-anchor
  position: relative
  display: inline-flex



@media (min-width: 761px)
  .top
    padding-left: calc(clamp(24px, 4vw, 56px) + var(--safe-left))
    padding-right: calc(clamp(24px, 4vw, 56px) + var(--safe-right))
  .bottom
    padding-left: calc(clamp(24px, 4vw, 56px) + var(--safe-left))
    padding-right: calc(clamp(24px, 4vw, 56px) + var(--safe-right))
    padding-bottom: calc(20px + var(--safe-bottom))
  .controls
    gap: 6px

// Landscape on a phone: the top bar eats the stage, so shrink it.
@media (orientation: landscape) and (max-height: 500px)
  .top
    padding-bottom: 24px
  .subtitle
    display: none
  .bottom
    padding-top: 40px
  .centre
    gap: 40px
</style>
