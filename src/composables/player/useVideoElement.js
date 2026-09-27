import { onBeforeUnmount, ref } from 'vue'

/**
 * Presentation-side view of the <video> element.
 *
 * Event ownership is split deliberately. PlaybackController binds
 * `loadedmetadata`, `waiting`, `playing`, `pause`, `seeked`, `ended` and
 * `error`, and is the ONLY source of `loading`, `paused`, `error` and
 * `session`. This composable binds a disjoint, presentation-only set so the two
 * never fight. The single overlap is `ended`: the controller reports progress
 * with it, the UI refreshes the "continue watching" lists with it. Two
 * listeners for two unrelated purposes is fine.
 *
 * `paused` is deliberately NOT owned here. The old component held it as a data
 * flag with a watcher that called play()/pause(), while the controller also
 * wrote into the same flag — controller emit -> watcher -> video.pause() ->
 * controller pause handler -> emit. Transport actions call the element
 * directly instead, and the controller's callback stays the one writer.
 */
// Volume, mute and speed carry over to the next video and the next visit, on
// this device only. Storage can be unavailable (private windows), so it is
// best-effort both ways.
const STORAGE_KEY = 'oblecto.player'

function loadSaved () {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

    return {
      volume: Number.isFinite(saved.volume) ? Math.min(1, Math.max(0, saved.volume)) : 1,
      muted: saved.muted === true,
      rate: Number.isFinite(saved.rate) && saved.rate >= 0.25 && saved.rate <= 4 ? saved.rate : 1
    }
  } catch {
    return { volume: 1, muted: false, rate: 1 }
  }
}

export function useVideoElement (videoRef, { onEnded, onPipEnter, onPipLeave, onTimeUpdate, onLoadedData } = {}) {
  const saved = loadSaved()
  const currentTime = ref(0)
  const duration = ref(0)
  const bufferedEnd = ref(0)
  const volume = ref(saved.volume)
  const muted = ref(saved.muted)
  const playbackRate = ref(saved.rate)

  let previousVolume = saved.volume > 0 ? saved.volume : 1
  let bound = null

  function save () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: volume.value, muted: muted.value, rate: playbackRate.value }))
    } catch {
      // Not remembered this time; playback is unaffected.
    }
  }

  function el () {
    return videoRef.value || null
  }

  // `buffered` can hold several disjoint ranges once the user has seeked
  // around. The old code read only the last one, which reports a range the
  // playhead has already left after seeking backwards.
  function readBuffered (video) {
    const ranges = video.buffered
    if (!ranges || ranges.length === 0) return 0

    const at = video.currentTime

    for (let index = 0; index < ranges.length; index += 1) {
      if (at >= ranges.start(index) - 0.5 && at <= ranges.end(index)) {
        return ranges.end(index)
      }
    }

    return ranges.end(ranges.length - 1)
  }

  function syncDuration (video) {
    duration.value = Number.isFinite(video.duration) ? video.duration : 0
  }

  const handlers = {
    timeupdate: video => {
      currentTime.value = video.currentTime || 0
      bufferedEnd.value = readBuffered(video)
      onTimeUpdate?.(video.currentTime || 0)
    },
    progress: video => { bufferedEnd.value = readBuffered(video) },
    durationchange: syncDuration,
    loadeddata: video => {
      syncDuration(video)
      onLoadedData?.(video)
    },
    ratechange: video => {
      playbackRate.value = video.playbackRate
      save()
    },
    volumechange: video => {
      volume.value = video.volume
      muted.value = video.muted
      if (video.volume > 0 && !video.muted) previousVolume = video.volume
      save()
    },
    ended: () => { onEnded?.() },
    enterpictureinpicture: () => { onPipEnter?.() },
    leavepictureinpicture: () => { onPipLeave?.() }
  }

  function bind () {
    const video = el()
    if (!video || bound === video) return

    unbind()
    bound = video

    for (const [name, handler] of Object.entries(handlers)) {
      const listener = () => handler(video)
      handlers[name].listener = listener
      video.addEventListener(name, listener)
    }

    // A new element starts at the browser defaults; the user's own settings
    // win, so they go onto it rather than the other way round.
    applyState()
    syncDuration(video)
  }

  function unbind () {
    if (!bound) return

    for (const [name, handler] of Object.entries(handlers)) {
      if (handler.listener) bound.removeEventListener(name, handler.listener)
    }

    bound = null
  }

  function clamp (value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function seekTo (position, limit = duration.value) {
    const video = el()
    if (!video || !limit) return

    video.currentTime = clamp(position, 0, limit)
    currentTime.value = video.currentTime
  }

  function seekBy (seconds, limit = duration.value) {
    seekTo((el()?.currentTime || 0) + seconds, limit)
  }

  // Returns the DOMException name when the browser refuses, so a caller that
  // needs to know - a remote device being told to resume, say - can tell a
  // refusal from a successful start. Local callers ignore it, because
  // autoplay rejection is already reported through the controller's state.
  async function play () {
    const video = el()
    if (!video) return 'NotFoundError'

    try {
      await video.play()
      return null
    } catch (error) {
      return error?.name || 'NotAllowedError'
    }
  }

  function pause () {
    el()?.pause()
  }

  function togglePlay (isPaused) {
    if (isPaused) void play()
    else pause()
  }

  function setVolume (value) {
    const video = el()
    if (!video) return

    const next = clamp(value, 0, 1)

    if (next > 0) {
      previousVolume = next
      video.muted = false
    } else {
      video.muted = true
    }

    video.volume = next
    volume.value = next
    muted.value = video.muted
    save()
  }

  function toggleMute () {
    const video = el()
    if (!video) return

    if (video.muted || video.volume === 0) {
      video.muted = false
      setVolume(previousVolume || 1)
      return
    }

    if (video.volume > 0) previousVolume = video.volume

    video.muted = true
    muted.value = true
    save()
  }

  function setRate (rate) {
    const video = el()
    if (!video) return

    video.playbackRate = rate
    playbackRate.value = rate
    save()
  }

  // Re-applied after every re-attach, since the controller replaces the source.
  function applyState () {
    const video = el()
    if (!video) return

    video.volume = volume.value
    video.muted = muted.value
    video.playbackRate = playbackRate.value
  }

  onBeforeUnmount(unbind)

  return {
    currentTime,
    duration,
    bufferedEnd,
    volume,
    muted,
    playbackRate,
    bind,
    unbind,
    seekTo,
    seekBy,
    play,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    setRate,
    applyState
  }
}
