/**
 * navigator.mediaSession wiring. Handlers beyond nexttrack/stop are what make
 * the Android lock screen and desktop media keys actually work.
 */
export function useMediaSessionBridge () {
  const available = typeof navigator !== 'undefined' && 'mediaSession' in navigator

  const actions = ['play', 'pause', 'stop', 'nexttrack', 'seekbackward', 'seekforward', 'seekto']

  function setMetadata ({ title, album, artwork }) {
    if (!available) return

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: title || '',
        album: album || '',
        artwork: artwork ? [{ src: artwork }] : []
      })
    } catch (error) {
      // MediaMetadata is missing on some older browsers that still expose
      // mediaSession; the action handlers below are the useful part anyway.
    }
  }

  function setHandlers (handlers) {
    if (!available) return

    for (const action of actions) {
      try {
        navigator.mediaSession.setActionHandler(action, handlers[action] || null)
      } catch (error) {
        // Unsupported actions throw rather than no-op in some browsers.
      }
    }
  }

  function setPlaybackState (state) {
    if (!available) return
    navigator.mediaSession.playbackState = state
  }

  function clear () {
    if (!available) return

    setHandlers({})
    navigator.mediaSession.metadata = null
    navigator.mediaSession.playbackState = 'none'
  }

  return { available, setMetadata, setHandlers, setPlaybackState, clear }
}
