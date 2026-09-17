import { onBeforeUnmount, ref } from 'vue'

function mediaQuery (query) {
  const matches = ref(false)

  if (typeof window === 'undefined' || !window.matchMedia) return matches

  const list = window.matchMedia(query)
  const sync = () => { matches.value = list.matches }
  sync()

  // Safari below 14 only has the deprecated listener API.
  if (list.addEventListener) list.addEventListener('change', sync)
  else list.addListener(sync)

  onBeforeUnmount(() => {
    if (list.removeEventListener) list.removeEventListener('change', sync)
    else list.removeListener(sync)
  })

  return matches
}

export function usePlayerEnvironment () {
  const coarsePointer = mediaQuery('(pointer: coarse)')
  const finePointer = mediaQuery('(pointer: fine)')
  const reducedMotion = mediaQuery('(prefers-reduced-motion: reduce)')
  const narrow = mediaQuery('(max-width: 760px)')

  const volumeSupported = ref(true)
  const pipSupported = ref(Boolean(typeof document !== 'undefined' && document.pictureInPictureEnabled))
  const fullscreenSupported = ref(Boolean(typeof document !== 'undefined' && document.fullscreenEnabled))

  let probed = false

  // iOS Safari silently ignores writes to video.volume and keeps reporting the
  // old value, so a slider there is a control that does nothing. Probe once the
  // element has data, then restore whatever the user had.
  function probeVolumeSupport (video) {
    if (probed || !video) return
    probed = true

    const original = video.volume
    const candidate = original === 0.5 ? 0.4 : 0.5

    try {
      video.volume = candidate
      volumeSupported.value = Math.abs(video.volume - candidate) < 0.01
      video.volume = original
    } catch (error) {
      volumeSupported.value = false
    }
  }

  return {
    coarsePointer,
    finePointer,
    reducedMotion,
    narrow,
    volumeSupported,
    pipSupported,
    fullscreenSupported,
    probeVolumeSupport
  }
}
