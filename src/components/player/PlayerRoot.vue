<template>
  <div
    v-if="hasPlayback"
    ref="root"
    class="player-root"
    :data-mode="modeName"
  >
    <div
      ref="stage"
      class="stage"
    >
      <video
        ref="videoEl"
        crossorigin="anonymous"
        playsinline
      />

      <template v-if="!isMini">
        <PlayerGestureLayer
          ref="gestureLayer"
          :handlers="gestures.handlers"
          :ripple="gestures.ripple.value"
          :volume-hud="gestures.volumeHud.value"
          :announcement="announcement"
        />

        <PlayerBuffering
          :active="loading && !playbackError"
          :reduced-motion="env.reducedMotion.value"
        />

        <PlayerError
          v-if="playbackError"
          :message="playbackError"
          :can-choose-source="files.length > 1"
          @retry="retry"
          @choose-source="openSettings"
        />

        <PlayerOverlay
          :visible="chromeVisible"
          :title="title"
          :subtitle="subtitle"
          :can-view-show="playing.type === 'episode'"
          :paused="paused"
          :current-time="video.currentTime.value"
          :duration="duration"
          :buffered-end="video.bufferedEnd.value"
          :scrub-position="scrubPreview"
          :volume="video.volume.value"
          :muted="video.muted.value"
          :volume-supported="env.volumeSupported.value"
          :playback-rate="video.playbackRate.value"
          :subtitles-on="subtitleMode !== 'off'"
          :next-episode="showNextEpisode"
          :settings-open="settingsOpen"
          :pip-supported="env.pipSupported.value"
          :fullscreen-supported="env.fullscreenSupported.value"
          :is-fullscreen="isFullscreenMode"
          :compact="env.narrow.value || env.coarsePointer.value"
          @activity="visibility.notifyActivity"
          @minimize="setMode(ScreenFormats.SMALL)"
          @stop="stopPlaying"
          @view-show="viewShow"
          @toggle-play="togglePlay"
          @seek-by="seekBy"
          @scrub-start="onScrubStart"
          @scrub="onScrub"
          @scrub-end="onScrubEnd"
          @set-volume="video.setVolume"
          @toggle-mute="video.toggleMute"
          @toggle-subtitles="toggleSubtitles"
          @cycle-rate="cycleRate"
          @toggle-settings="settingsOpen = !settingsOpen"
          @toggle-fullscreen="toggleFullscreen"
          @play-next="playNext"
        >
          <template #settings>
            <PlayerSettingsSurface
              :open="settingsOpen"
              :sheet="useSheet"
              @close="settingsOpen = false"
            >
              <PlayerSettingsPanel
                :files="files"
                :file-index="playingFileId"
                :quality="selectedQuality"
                :quality-options="qualityOptions"
                :audio-streams="audioStreams"
                :audio-index="selectedAudioStreamIndex"
                :subtitle-streams="subtitleStreams"
                :subtitle-index="selectedSubtitleStreamIndex"
                :subtitle-mode="subtitleMode"
                :playback-rate="video.playbackRate.value"
                :speed-options="speedOptions"
                @select-quality="selectQuality"
                @select-file="changeFileId"
                @select-audio="selectAudioStream"
                @select-subtitle="selectSubtitleTrack"
                @set-subtitle-mode="setSubtitleMode"
                @set-rate="video.setRate"
              />
            </PlayerSettingsSurface>
          </template>
        </PlayerOverlay>
      </template>

      <PlayerMini
        v-else
        :title="title"
        :subtitle="subtitle"
        :artwork="artwork"
        :show-art="env.narrow.value"
        :paused="paused"
        :progress="progress"
        @expand="setMode(ScreenFormats.LARGE)"
        @toggle-play="togglePlay"
        @stop="stopPlaying"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, markRaw, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PlayerBuffering from './PlayerBuffering.vue'
import PlayerError from './PlayerError.vue'
import PlayerGestureLayer from './PlayerGestureLayer.vue'
import PlayerMini from './PlayerMini.vue'
import PlayerOverlay from './PlayerOverlay.vue'
import PlayerSettingsPanel from './PlayerSettingsPanel.vue'
import PlayerSettingsSurface from './PlayerSettingsSurface.vue'

import PlaybackController, { browserCapabilities } from '@/playback/PlaybackController'
import { ScreenFormats } from '@/enums/ScreenFormats'
import oblectoClient from '@/oblectoClient'
import { imageUrl, subtitleForItem } from '@/utils/media'
import { describeSeconds } from '@/utils/time'

import { useControlsVisibility } from '@/composables/player/useControlsVisibility'
import { useFullscreen } from '@/composables/player/useFullscreen'
import { useMediaSessionBridge } from '@/composables/player/useMediaSessionBridge'
import { usePlayerEnvironment } from '@/composables/player/usePlayerEnvironment'
import { usePlayerGestures } from '@/composables/player/usePlayerGestures'
import { usePlayerHotkeys } from '@/composables/player/usePlayerHotkeys'
import { useRemoteBroadcast } from '@/composables/player/useRemoteBroadcast'
import { useVideoElement } from '@/composables/player/useVideoElement'

const AUTOPLAY_TIME_LEFT_THRESHOLD = 5
const IGNORE_RESTORE_PROGRESS_THRESHOLD = 0.9
const NEXT_EPISODE_PROGRESS_THRESHOLD = 0.9

const store = useStore()
const router = useRouter()

const root = ref(null)
const stage = ref(null)
const videoEl = ref(null)
const gestureLayer = ref(null)

const playing = computed(() => store.state.playing || {})
const autoplay = computed(() => store.state.autoplay)
const host = computed(() => store.state.host)
const playSizeFormat = computed(() => store.state.playSizeFormat)

const playingFileId = ref(0)
const selectedQuality = ref('original')
const selectedAudioStreamIndex = ref(null)
const selectedSubtitleStreamIndex = ref(null)
const subtitleMode = ref('auto')
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]
const qualityOptions = [
  { value: 'original', label: 'Original' },
  { value: 'auto', label: 'Auto' },
  ...[360, 480, 720, 1080].map(height => ({ value: height, label: `${height}p` }))
]

const playbackSession = ref({})
const playbackError = ref('')
const loading = ref(false)
const paused = ref(true)
const settingsOpen = ref(false)
const scrubPreview = ref(null)
const announcement = ref('')
const nextEpisode = ref(null)
const initialProgress = ref(0)
const resumeAfterStreamChange = ref(true)
const autoplaying = ref(false)
// The browser refused to start playback and wants a gesture on this device.
const autoplayBlocked = ref(false)

let controller = null
let resumeAfterScrub = false

const env = usePlayerEnvironment()
const mediaSession = useMediaSessionBridge()
const fullscreen = useFullscreen(stage)

const hasPlayback = computed(() => Boolean(
  playing.value?.entity && Array.isArray(playing.value.entity.Files) && playing.value.entity.Files.length > 0
))
const files = computed(() => playing.value?.entity?.Files || [])
const currentFile = computed(() => files.value[playingFileId.value] || null)
const duration = computed(() => playbackSession.value?.duration || currentFile.value?.duration || 0)
const isMini = computed(() => playSizeFormat.value === ScreenFormats.SMALL)
const isFullscreenMode = computed(() => playSizeFormat.value === ScreenFormats.FULLSCREEN)
const modeName = computed(() => {
  if (isMini.value) return 'small'
  return isFullscreenMode.value ? 'fullscreen' : 'large'
})

const video = useVideoElement(videoEl, {
  onEnded: () => store.dispatch('updateWatching'),
  onLoadedData: element => {
    env.probeVolumeSupport(element)
    // A new source resets rate and volume on the element, so the user's
    // choices have to be re-applied after every re-attach.
    video.applyState()
  },
  onTimeUpdate: onTimeUpdate,
  onPipEnter: () => {
    env.pipSupported.value = true
    setMode(ScreenFormats.SMALL)
  },
  onPipLeave: () => {
    if (playSizeFormat.value === ScreenFormats.SMALL) setMode(ScreenFormats.LARGE)
  }
})

const progress = computed(() => {
  if (!duration.value) return 0
  return Math.min(1, Math.max(0, video.currentTime.value / duration.value))
})

const title = computed(() => playing.value?.title || '')
const subtitle = computed(() => subtitleForItem(playing.value?.type, playing.value?.entity))
const artwork = computed(() => {
  const entity = playing.value?.entity
  if (!entity?.id || !host.value) return ''

  return playing.value.type === 'episode'
    ? imageUrl(host.value, 'episode', entity.id, 'banner')
    : imageUrl(host.value, 'movie', entity.id, 'poster')
})

const showNextEpisode = computed(() => Boolean(
  nextEpisode.value?.id && playing.value?.type === 'episode' && progress.value > NEXT_EPISODE_PROGRESS_THRESHOLD
))

function streamsOfType (type) {
  const streams = playbackSession.value?.tracks || currentFile.value?.Streams || []
  return streams
    .filter(stream => stream.codec_type === type && Number.isInteger(stream.index))
    .sort((a, b) => a.index - b.index)
}

const audioStreams = computed(() => streamsOfType('audio'))
const subtitleStreams = computed(() => streamsOfType('subtitle'))

const useSheet = computed(() => env.narrow.value || env.coarsePointer.value)

// The chrome stays up while the user is doing something with it, or while
// there is something to read.
const chromePinned = computed(() => Boolean(
  settingsOpen.value || playbackError.value || scrubPreview.value !== null
))

const visibility = useControlsVisibility({
  active: computed(() => hasPlayback.value && !isMini.value),
  paused,
  pinned: chromePinned
})

const chromeVisible = computed(() => visibility.visible.value)

const gestures = usePlayerGestures(computed(() => gestureLayer.value?.layer || null), {
  enabled: computed(() => hasPlayback.value && !isMini.value),
  volumeSupported: env.volumeSupported,
  getDuration: () => duration.value,
  getPosition: () => video.currentTime.value,
  liveScrub: computed(() => playbackSession.value?.method === 'direct'),
  onActivity: () => visibility.notifyActivity(),
  // A mouse click toggles playback, the way every desktop player does; the
  // chrome is already revealed by pointer movement there. A touch tap toggles
  // the chrome, which is the only way to get it back on a phone.
  onTap: pointerType => {
    if (pointerType === 'mouse') togglePlay()
    else visibility.toggle()
  },
  onDoubleTapSeek: seconds => {
    seekBy(seconds)
    announcement.value = `Seeking ${seconds < 0 ? 'back' : 'forward'} ${describeSeconds(Math.abs(seconds))}`
  },
  onScrubStart: onScrubStart,
  onScrub: (position, live) => {
    scrubPreview.value = position
    if (live) video.seekTo(position, duration.value)
  },
  onScrubEnd: onScrubEnd,
  onVolumeDelta: delta => {
    const next = Math.min(1, Math.max(0, video.volume.value + delta))
    video.setVolume(next)
    return next
  },
  onToggleFullscreen: toggleFullscreen
})

usePlayerHotkeys({
  togglePlay,
  seekBy,
  nudgeVolume: delta => video.setVolume(video.volume.value + delta),
  toggleMute: video.toggleMute,
  toggleFullscreen,
  toggleSubtitles,
  adjustRate,
  escape: () => {
    if (settingsOpen.value) {
      settingsOpen.value = false
      return
    }
    if (isFullscreenMode.value) setMode(ScreenFormats.LARGE)
  }
}, {
  enabled: hasPlayback,
  rootRef: root
})

// Publishes what this player is doing to the user's other devices, and lets
// them drive it. Everything it needs is already in scope, so it adds no
// playback logic of its own.
const { reportProgress } = useRemoteBroadcast({
  playing,
  paused,
  loading,
  playbackError,
  currentTime: video.currentTime,
  duration,
  volume: video.volume,
  muted: video.muted,
  volumeSupported: env.volumeSupported,
  nextEpisode,
  canSeek: computed(() => duration.value > 0),
  autoplayBlocked,
  controls: {
    play: () => video.play(),
    pause: () => video.pause(),
    stop: () => stopPlaying(),
    seek: position => video.seekTo(position, duration.value),
    setVolume: value => video.setVolume(value),
    setMuted: value => {
      if (video.muted.value !== value) video.toggleMute()
    },
    next: () => playNext()
  }
})

function setMode (mode) {
  store.commit('setPlaySizeFormat', mode)
}

function openSettings () {
  settingsOpen.value = true
}

function togglePlay () {
  if (!hasPlayback.value) return
  video.togglePlay(paused.value)
}

function seekBy (seconds) {
  video.seekBy(seconds, duration.value)
}

function onScrubStart () {
  visibility.notifyActivity()
  scrubPreview.value = video.currentTime.value

  // Scrubbing an adaptive stream issues a new segment request per seek, so
  // hold playback until the user commits rather than thrashing the backend.
  resumeAfterScrub = !paused.value && playbackSession.value?.method !== 'direct'
  if (resumeAfterScrub) video.pause()
}

function onScrub (position) {
  scrubPreview.value = position
}

function onScrubEnd (position) {
  if (position !== null && position !== undefined) {
    video.seekTo(position, duration.value)
  }

  scrubPreview.value = null

  if (resumeAfterScrub) {
    resumeAfterScrub = false
    void video.play()
  }

  visibility.notifyActivity()
}

function cycleRate () {
  const index = speedOptions.indexOf(video.playbackRate.value)
  video.setRate(speedOptions[(index + 1) % speedOptions.length])
}

function adjustRate (direction) {
  let index = speedOptions.indexOf(video.playbackRate.value)
  if (index === -1) index = speedOptions.indexOf(1)

  const next = Math.min(speedOptions.length - 1, Math.max(0, index + direction))
  video.setRate(speedOptions[next])
}

function toggleFullscreen () {
  if (!env.fullscreenSupported.value) return

  setMode(isFullscreenMode.value ? ScreenFormats.LARGE : ScreenFormats.FULLSCREEN)
}

function viewShow () {
  if (playing.value?.type !== 'episode') return

  router.push({ name: 'SeriesView', params: { seriesId: playing.value.entity.Series.id } })
  setMode(ScreenFormats.SMALL)
}

function getTracking () {
  if (!hasPlayback.value) return []
  return playing.value.entity.TrackMovies || playing.value.entity.TrackEpisodes || []
}

// Home and detail shelves read progress straight back out of the vuex entity
// through progressForItem(), so this stays a mutation in place.
function updateLocalTracker () {
  if (!hasPlayback.value) return

  const entity = playing.value.entity
  const key = playing.value.type === 'movie' ? 'TrackMovies' : 'TrackEpisodes'

  if (playing.value.type !== 'movie' && playing.value.type !== 'episode') return

  if (!entity[key]) entity[key] = []
  if (!entity[key][0]) entity[key][0] = {}

  entity[key][0].time = video.currentTime.value
}

function onTimeUpdate () {
  if (!hasPlayback.value) return

  updateLocalTracker()
  // Throttled inside the transport, so this is one call per second on the wire.
  reportProgress()

  if (autoplay.value && !autoplaying.value && duration.value > 0) {
    if (duration.value - video.currentTime.value <= AUTOPLAY_TIME_LEFT_THRESHOLD) {
      autoplaying.value = true
      playNext()
    }
  }
}

async function updateSession (offset = null) {
  const file = files.value[playingFileId.value]
  if (!file || !videoEl.value || !controller) return

  const session = await controller.open(file.id, {
    capabilities: browserCapabilities(videoEl.value),
    position: typeof offset === 'number' ? offset : video.currentTime.value,
    quality: selectedQuality.value,
    forceHls: false,
    audioStreamIndex: Number.isInteger(selectedAudioStreamIndex.value) ? selectedAudioStreamIndex.value : undefined,
    // `null` clears the track server-side while `undefined` leaves it to the
    // server's own choice. The distinction is part of the session contract.
    subtitleStreamIndex: subtitleMode.value === 'off'
      ? null
      : Number.isInteger(selectedSubtitleStreamIndex.value) ? selectedSubtitleStreamIndex.value : undefined,
    subtitleMode: subtitleMode.value
  })

  if (!session) return

  playbackSession.value = session
  initialProgress.value = 0
  selectedAudioStreamIndex.value = session.selectedTracks.audioStreamIndex
  selectedSubtitleStreamIndex.value = session.selectedTracks.subtitleStreamIndex
}

function attachStream () {
  if (!videoEl.value || !controller) {
    playbackError.value = 'The video player is not ready. Retry playback.'
    loading.value = false
    return
  }

  video.bind()
  controller.attach(videoEl.value, resumeAfterStreamChange.value)
  video.applyState()
}

async function reconfigurePlayback () {
  if (!hasPlayback.value) return

  updateLocalTracker()

  const absoluteTime = video.currentTime.value
  const tracking = getTracking()

  if (tracking[0]) tracking[0].time = absoluteTime

  loading.value = true
  resumeAfterStreamChange.value = !paused.value
  initialProgress.value = absoluteTime

  await updateSession(initialProgress.value)
  attachStream()
}

async function changeFileId (id) {
  resumeAfterStreamChange.value = !paused.value
  updateLocalTracker()

  const tracking = getTracking()

  playingFileId.value = id
  selectedAudioStreamIndex.value = null
  selectedSubtitleStreamIndex.value = null
  subtitleMode.value = 'auto'
  initialProgress.value = tracking[0]?.time || 0

  await updateSession(initialProgress.value)

  settingsOpen.value = false
  loading.value = true
  attachStream()
}

async function selectQuality (value) {
  selectedQuality.value = ['original', 'auto'].includes(value) ? value : Number(value)
  await reconfigurePlayback()
}

async function selectAudioStream (streamIndex) {
  if (selectedAudioStreamIndex.value === streamIndex) return

  selectedAudioStreamIndex.value = streamIndex
  await reconfigurePlayback()
}

async function setSubtitleMode (mode) {
  if (!['off', 'auto', 'forced'].includes(mode)) return
  if (subtitleMode.value === mode && mode !== 'off') return

  subtitleMode.value = mode
  selectedSubtitleStreamIndex.value = null

  await reconfigurePlayback()
}

async function toggleSubtitles () {
  await setSubtitleMode(subtitleMode.value === 'off' ? 'auto' : 'off')
}

async function selectSubtitleTrack (streamIndex) {
  if (subtitleMode.value === 'off') subtitleMode.value = 'auto'
  if (streamIndex === selectedSubtitleStreamIndex.value) return

  selectedSubtitleStreamIndex.value = streamIndex
  await reconfigurePlayback()
}

function retry () {
  void controller?.retry()
}

function playNext () {
  // Explicitly local: `playEpisode` would route to whatever remote target this
  // device has selected, so a device playing under remote control would fling
  // its own next episode at a third device.
  if (nextEpisode.value?.id) store.dispatch('playEpisodeLocal', nextEpisode.value.id)
}

function stopPlaying () {
  void controller?.stop()

  if (videoEl.value) videoEl.value.src = ''

  store.dispatch('clearPlaying')
  store.dispatch('updateWatching')

  settingsOpen.value = false
  paused.value = true
  loading.value = false
  autoplaying.value = false
  playbackError.value = ''
  playbackSession.value = {}
  selectedAudioStreamIndex.value = null
  selectedSubtitleStreamIndex.value = null
  subtitleMode.value = 'auto'

  setMode(ScreenFormats.SMALL)
}

function createController () {
  if (controller) return

  controller = markRaw(new PlaybackController(oblectoClient.sessions, state => {
    if (state.session) playbackSession.value = state.session
    if (state.error !== undefined) playbackError.value = state.error
    if (state.loading !== undefined) loading.value = state.loading
    // The controller is the single writer of `paused`; transport actions call
    // the element directly, so there is no watcher to feed back into it.
    if (state.paused !== undefined) paused.value = state.paused
    if (state.blocked !== undefined) autoplayBlocked.value = state.blocked
  }))
}

watch(paused, isPaused => {
  mediaSession.setPlaybackState(isPaused ? 'paused' : 'playing')
})

watch(playSizeFormat, async mode => {
  switch (mode) {
    case ScreenFormats.FULLSCREEN:
      await fullscreen.enter()
      break

    case ScreenFormats.LARGE:
      await fullscreen.exit()
      if (env.pipSupported.value && document.pictureInPictureElement) {
        await document.exitPictureInPicture().catch(() => {})
      }
      break

    case ScreenFormats.SMALL:
      await fullscreen.exit()
      if (env.pipSupported.value && videoEl.value && !document.pictureInPictureElement) {
        await videoEl.value.requestPictureInPicture().catch(() => {})
      }
      break
  }
})

// The browser's own fullscreen exit (Esc, the system button) must push the
// store back, or the UI keeps claiming it is fullscreen.
watch(fullscreen.isFullscreen, active => {
  if (!active && playSizeFormat.value === ScreenFormats.FULLSCREEN) {
    setMode(ScreenFormats.LARGE)
  }
})

watch(playing, async (newState, oldState) => {
  if (!oldState?.entity || !oldState.entity.title) setMode(ScreenFormats.LARGE)

  initialProgress.value = 0
  playingFileId.value = 0
  settingsOpen.value = false
  paused.value = true
  loading.value = false
  autoplaying.value = false
  playbackError.value = ''
  scrubPreview.value = null
  selectedAudioStreamIndex.value = null
  selectedSubtitleStreamIndex.value = null
  subtitleMode.value = 'auto'
  nextEpisode.value = null

  if (!newState?.entity) {
    void controller?.stop()
    mediaSession.setPlaybackState('none')
    return
  }

  loading.value = true
  createController()

  await nextTick()
  video.bind()

  const tracking = getTracking()
  const shouldPreSeek = tracking[0] ? tracking[0].progress < IGNORE_RESTORE_PROGRESS_THRESHOLD : false

  if (tracking[0] !== undefined && shouldPreSeek) initialProgress.value = tracking[0].time

  resumeAfterStreamChange.value = true

  await updateSession(initialProgress.value)
  attachStream()

  mediaSession.setMetadata({
    title: newState.title,
    album: newState.type === 'episode' ? newState.entity.Series?.seriesName : '',
    artwork: artwork.value
  })

  mediaSession.setHandlers({
    play: () => video.play(),
    pause: () => video.pause(),
    stop: stopPlaying,
    nexttrack: playNext,
    seekbackward: () => seekBy(-10),
    seekforward: () => seekBy(10),
    seekto: details => {
      if (typeof details?.seekTime === 'number') video.seekTo(details.seekTime, duration.value)
    }
  })

  if (newState.type === 'episode') {
    nextEpisode.value = await oblectoClient.episodeLibrary.getNext(newState.entity.id)
  }
})

// Pages reserve space for the docked mini-player only while it is on screen.
watch([hasPlayback, isMini, env.narrow], ([active, mini, narrow]) => {
  const reserve = active && mini && !document.pictureInPictureElement
    ? (narrow ? '84px' : '0px')
    : '0px'

  document.documentElement.style.setProperty('--mini-player-reserve', reserve)
}, { immediate: true })

onBeforeUnmount(() => {
  mediaSession.clear()
  document.documentElement.style.setProperty('--mini-player-reserve', '0px')
  void controller?.destroy()
})
</script>

<style scoped lang="sass">
.player-root
  position: fixed
  color: var(--color-text)

.stage
  position: relative
  width: 100%
  height: 100%
  background: #000
  overflow: hidden

video
  display: block
  width: 100%
  height: 100%
  object-fit: contain
  // Every pointer interaction belongs to the gesture layer above it.
  pointer-events: none

.player-root[data-mode='large'],
.player-root[data-mode='fullscreen']
  inset: 0
  z-index: var(--z-player)
  height: 100vh
  height: 100dvh

.player-root[data-mode='small']
  z-index: var(--z-player-mini)
  right: calc(20px + var(--safe-right))
  bottom: calc(20px + var(--safe-bottom))
  width: clamp(260px, 24vw, 340px)

  .stage
    display: grid
    grid-template-rows: auto 64px
    height: auto
    border: 1px solid var(--color-border)
    border-radius: var(--radius-md)
    box-shadow: var(--shadow-strong)
    background: var(--color-surface-card)

  video
    aspect-ratio: 16 / 9
    height: auto

// Phone: a docked bar rather than a floating card, so it cannot sit on top of
// whatever the page is showing. The video is docked into the thumbnail slot
// rather than hidden - `display: none` lets some browsers suspend decoding.
@media (max-width: 760px)
  .player-root[data-mode='small']
    left: calc(8px + var(--safe-left))
    right: calc(8px + var(--safe-right))
    bottom: calc(8px + var(--safe-bottom))
    width: auto

    .stage
      grid-template-rows: 64px
      height: 64px

    video
      position: absolute
      top: 50%
      left: 10px
      z-index: 1
      width: 52px
      height: 34px
      border-radius: var(--radius-sm)
      object-fit: cover
      transform: translateY(-50%)
</style>
