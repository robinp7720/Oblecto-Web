<template>
  <!-- Slides up from the bottom edge, where it docks. -->
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="remote-bar"
      role="region"
      :aria-label="`Remote control for ${device.name}`"
    >
      <div class="remote-head">
        <div
          v-if="artwork"
          class="art"
        >
          <img
            v-if="!artFailed"
            :src="artwork"
            alt=""
            @error="artFailed = true"
          >
        </div>

        <div class="copy">
          <p class="title">
            {{ title }}
          </p>
          <p class="target">
            {{ statusLine }}
          </p>
        </div>

        <PlayerVolume
          v-if="state.canSetVolume"
          class="volume"
          :volume="state.volume"
          :muted="state.muted"
          :supported="state.canSetVolume"
          @set-volume="setVolume"
          @toggle-mute="toggleMute"
        />

        <button
          type="button"
          class="icon-button"
          :aria-label="paused ? 'Play' : 'Pause'"
          @click="togglePlay"
        >
          <PlayerIcon :name="paused ? 'play' : 'pause'" />
        </button>

        <button
          v-if="state.hasNext"
          type="button"
          class="icon-button"
          aria-label="Next episode"
          @click="send({ type: 'next' })"
        >
          <PlayerIcon name="next" />
        </button>

        <button
          type="button"
          class="icon-button"
          aria-label="Stop playback"
          @click="send({ type: 'stop' })"
        >
          <PlayerIcon name="close" />
        </button>
      </div>

      <PlayerSeekBar
        :current-time="position"
        :duration="state.duration"
        :buffered-end="0"
        :scrub-position="scrubPosition"
        :disabled="!state.canSeek"
        @scrub-start="onScrubStart"
        @scrub="onScrub"
        @scrub-end="onScrubEnd"
      />

      <p
        v-if="notice"
        class="notice"
      >
        {{ notice }}
      </p>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'

import PlayerIcon from '@/components/player/PlayerIcon.vue'
import PlayerSeekBar from '@/components/player/PlayerSeekBar.vue'
import PlayerVolume from '@/components/player/PlayerVolume.vue'
import { storeToRefs } from 'pinia'
import { useRemoteStore } from '@/remote/state'
import { sendCommand } from '@/remote/transport'
import { useRemotePosition } from '@/composables/useRemotePosition'

// This is a remote control, not a second player: it renders the state the
// target reports and emits commands. It borrows the local player's seek bar,
// volume control and icons so the two surfaces look and behave alike.

const store = useAppStore()
const remote = useRemoteStore()
const { activeDevice, activeState } = storeToRefs(remote)
const mediaStore = useMediaStore()
const artFailed = ref(false)
const scrubPosition = ref(null)

const device = computed(() => activeDevice.value || { name: '' })
const state = computed(() => activeState.value)

const visible = computed(() => Boolean(
  activeDevice.value && state.value && state.value.status !== 'idle' && state.value.media
))

const paused = computed(() => state.value?.status !== 'playing')

// Position arrives about once a second. Advancing it locally in between is the
// difference between a seek bar that moves and one that ticks.
const position = useRemotePosition(state)

const title = computed(() => state.value?.media?.title || 'Playing')

const statusLine = computed(() => {
  const status = state.value?.status

  if (status === 'blocked') return `${device.value.name} needs to be started by hand`
  if (status === 'buffering') return `Buffering on ${device.value.name}`
  if (status === 'error') return state.value.error || `Playback failed on ${device.value.name}`

  return `${paused.value ? 'Paused' : 'Playing'} on ${device.value.name}`
})

const notice = computed(() => remote.lastError)

const artwork = computed(() => {
  const media = state.value?.media

  if (!media || !store.host) return ''

  return media.kind === 'episode'
    ? mediaStore.artworkUrl(store.host, 'episode', media.id, 'banner')
    : mediaStore.artworkUrl(store.host, 'movie', media.id, 'poster')
})

// A new item deserves a fresh attempt at its artwork; without this a single
// failure would blank the thumbnail for the rest of the session.
watch(artwork, () => { artFailed.value = false })

function send (command) {
  return sendCommand(remote.targetDeviceId, command)
}

function togglePlay () {
  send({ type: paused.value ? 'resume' : 'pause' })
}

function setVolume (volume) {
  send({ type: 'setVolume', volume })
}

function toggleMute () {
  send({ type: 'setMuted', muted: !state.value.muted })
}

function onScrubStart () {
  scrubPosition.value = position.value
}

function onScrub (value) {
  scrubPosition.value = value
}

function onScrubEnd (value) {
  scrubPosition.value = null

  if (value === null || value === undefined) return

  send({ type: 'seek', position: value })
}
</script>

<style scoped lang="sass">
.remote-bar
  position: fixed
  left: max(12px, var(--safe-left))
  right: max(12px, var(--safe-right))
  bottom: calc(12px + var(--safe-bottom))
  z-index: var(--z-header)
  margin-inline: auto
  max-width: 720px
  padding: 10px 14px 6px
  border: 1px solid #333
  border-radius: var(--radius-md, 6px)
  background: rgba(20, 20, 20, 0.97)
  box-shadow: var(--shadow-strong)

.remote-head
  display: flex
  align-items: center
  gap: 10px

.art
  flex: none
  width: 52px
  height: 34px
  border-radius: var(--radius-sm, 3px)
  background: #000
  overflow: hidden

  img
    width: 100%
    height: 100%
    object-fit: cover

.copy
  flex: 1
  min-width: 0

.title
  margin: 0
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  font-size: 0.875rem
  font-weight: 600

.target
  margin: 0
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  color: var(--color-brand-turquoise)
  font-size: 0.72rem

.volume
  flex: none

.icon-button
  flex: none
  display: grid
  place-items: center
  width: 34px
  height: 34px
  padding: 0
  border: 0
  border-radius: var(--radius-sm, 3px)
  background: transparent
  color: white
  cursor: pointer

  &:hover
    background: #333

.notice
  margin: 4px 0 0
  color: var(--color-text-faint)
  font-size: 0.72rem

@media (max-width: 560px)
  .art
    display: none
</style>
