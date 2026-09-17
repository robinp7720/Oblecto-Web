import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { clearHandlers, registerHandlers } from '@/remote/receiver'
import { reportState, startHeartbeat, stopHeartbeat } from '@/remote/transport'

/**
 * Makes this player controllable from, and visible to, the user's other
 * devices.
 *
 * It adds no playback logic of its own: it publishes what the player already
 * knows and maps inbound commands onto the controls it already has.
 *
 * @param {object} sources - Reactive player state and control functions.
 * @returns {{blocked: import('vue').Ref<boolean>}} Whether the browser is refusing to start.
 */
export function useRemoteBroadcast (sources) {
  const {
    playing,
    paused,
    loading,
    playbackError,
    currentTime,
    duration,
    volume,
    muted,
    volumeSupported,
    nextEpisode,
    canSeek,
    autoplayBlocked,
    controls
  } = sources

  // The browser refused to start playback and wants a gesture. Locally that is
  // obvious - you are looking at the screen. From another room it is invisible
  // unless we say so, which is why it is a first-class status.
  //
  // It has two sources: the controller reports a refused autoplay when a remote
  // `play` lands, and a refused `resume` is caught here.
  const resumeBlocked = ref(false)
  const blocked = computed(() => resumeBlocked.value || Boolean(autoplayBlocked?.value))

  function currentStatus () {
    if (!playing.value?.entity) return 'idle'
    if (playbackError.value) return 'error'
    if (blocked.value) return 'blocked'
    if (loading.value) return 'buffering'

    return paused.value ? 'paused' : 'playing'
  }

  function currentMedia () {
    const item = playing.value

    if (!item?.entity) return null

    return {
      kind: item.type === 'movie' ? 'movie' : 'episode',
      id: String(item.entity.id),
      title: item.title || '',
      subtitle: item.type === 'episode' ? item.entity.Series?.seriesName || '' : ''
    }
  }

  function snapshot () {
    const status = currentStatus()

    return {
      status,
      media: status === 'idle' ? null : currentMedia(),
      position: currentTime.value || 0,
      duration: duration.value || 0,
      volume: volume.value ?? 1,
      muted: Boolean(muted.value),
      canSeek: Boolean(canSeek.value),
      canSetVolume: Boolean(volumeSupported.value),
      hasNext: Boolean(nextEpisode.value?.id),
      error: playbackError.value || undefined
    }
  }

  async function resume () {
    const refusal = await controls.play()

    resumeBlocked.value = refusal === 'NotAllowedError'

    // Report at once: the controlling device pressed play and is waiting to
    // find out whether anything happened.
    reportState(snapshot())
  }

  registerHandlers({
    pause: () => {
      resumeBlocked.value = false
      controls.pause()
    },
    resume,
    stop: () => {
      resumeBlocked.value = false
      controls.stop()
    },
    seek: command => controls.seek(command.position),
    setVolume: command => controls.setVolume(command.volume),
    setMuted: command => controls.setMuted(command.muted),
    next: () => controls.next()
  })

  // Anything the controller needs to see promptly is a watched value; position
  // alone is left to the throttle in the transport.
  watch(
    () => [currentStatus(), playing.value?.entity?.id, volume.value, muted.value, duration.value],
    () => reportState(snapshot()),
    { immediate: true }
  )

  watch(() => playing.value?.entity?.id, () => { resumeBlocked.value = false })

  startHeartbeat(snapshot)

  onBeforeUnmount(() => {
    stopHeartbeat()
    clearHandlers()
    reportState({
      status: 'idle',
      media: null,
      position: 0,
      duration: 0,
      volume: 1,
      muted: false,
      canSeek: false,
      canSetVolume: false,
      hasNext: false
    })
  })

  return {
    blocked,
    reportProgress: () => reportState(snapshot())
  }
}
