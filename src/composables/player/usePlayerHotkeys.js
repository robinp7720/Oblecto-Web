import { onBeforeUnmount, onMounted } from 'vue'

// A player button holding focus must not swallow Space. The old guard listed
// BUTTON wholesale, which was harmless when every control was a <span> but
// becomes a constant annoyance now that they are real buttons: the native
// activation should win for the focused button, and Space should still reach
// the player from anywhere else.
function isTypingContext (event, rootEl) {
  const target = event?.target
  if (!target) return false
  if (target.isContentEditable) return true
  if (!target.tagName) return false

  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return true

  const button = target.closest?.('button')
  if (button && !(rootEl && rootEl.contains(button))) return true

  return false
}

// `scoped`: only keys pressed inside the player count. Docked as a mini
// player, it shares the screen with a page whose own keys (arrows scroll,
// Space pages down) must keep working.
export function usePlayerHotkeys (handlers, { enabled, rootRef, scoped } = {}) {
  function onKeydown (event) {
    if (enabled && !enabled.value) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (isTypingContext(event, rootRef?.value)) return
    if (scoped?.value && !rootRef?.value?.contains(event.target)) return

    const run = handler => {
      if (!handler) return
      event.preventDefault()
      handler()
    }

    // By character rather than key position: "?" is Shift+/ on most layouts.
    if (event.key === '?') {
      run(handlers.showShortcuts)
      return
    }

    switch (event.code) {
      case 'Space':
      case 'KeyK':
        // Let a focused player button handle its own activation.
        if (event.code === 'Space' && event.target?.closest?.('button')) return
        run(handlers.togglePlay)
        break
      case 'ArrowLeft':
      case 'KeyJ':
        run(() => handlers.seekBy?.(-10))
        break
      case 'ArrowRight':
      case 'KeyL':
        run(() => handlers.seekBy?.(10))
        break
      case 'ArrowUp':
        run(() => handlers.nudgeVolume?.(0.05))
        break
      case 'ArrowDown':
        run(() => handlers.nudgeVolume?.(-0.05))
        break
      case 'KeyM':
        run(handlers.toggleMute)
        break
      case 'KeyF':
        run(handlers.toggleFullscreen)
        break
      case 'KeyC':
        run(handlers.toggleSubtitles)
        break
      case 'BracketLeft':
        run(() => handlers.adjustRate?.(-1))
        break
      case 'BracketRight':
        run(() => handlers.adjustRate?.(1))
        break
      case 'Escape':
        run(handlers.escape)
        break
      default:
        break
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
