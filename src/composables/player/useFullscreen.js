import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Fullscreen plus, on phones, a landscape orientation lock.
 *
 * `enter()` calls requestFullscreen() synchronously as its first statement.
 * The old code awaited exitPictureInPicture() first, which spends the user
 * activation and makes Safari and Firefox reject the fullscreen request when
 * coming from PiP. Leaving PiP is fire-and-forget afterwards instead.
 */
export function useFullscreen (elementRef, { lockOrientation = true } = {}) {
  const supported = ref(Boolean(typeof document !== 'undefined' && document.fullscreenEnabled))
  const isFullscreen = ref(false)

  function sync () {
    isFullscreen.value = Boolean(document.fullscreenElement)
  }

  async function applyOrientationLock () {
    if (!lockOrientation) return
    if (!window.matchMedia?.('(pointer: coarse)').matches) return

    try {
      await screen.orientation?.lock?.('landscape')
    } catch (error) {
      // Desktop Chrome throws NotSupportedError and iOS Safari has no lock at
      // all. Neither is a playback problem, so it must not surface as one.
    }
  }

  function releaseOrientationLock () {
    try {
      screen.orientation?.unlock?.()
    } catch (error) {
      // Same as above.
    }
  }

  function enter () {
    const element = elementRef.value
    if (!element || !supported.value) return Promise.resolve()

    // First statement: keeps the user activation intact.
    const request = element.requestFullscreen()

    if (document.pictureInPictureElement) {
      void document.exitPictureInPicture().catch(() => {})
    }

    return Promise.resolve(request)
      .then(applyOrientationLock)
      .catch(() => {})
  }

  function exit () {
    releaseOrientationLock()

    if (!document.fullscreenElement) return Promise.resolve()

    return document.exitFullscreen().catch(() => {})
  }

  function toggle () {
    return isFullscreen.value ? exit() : enter()
  }

  onMounted(() => {
    sync()
    document.addEventListener('fullscreenchange', sync)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', sync)
  })

  return { supported, isFullscreen, enter, exit, toggle, sync }
}
