import { onBeforeUnmount, ref } from 'vue'

const MOVE_SLOP = 10
const TAP_MAX_MS = 250
const DOUBLE_TAP_MS = 280
const DOUBLE_TAP_SLOP = 40
const VOLUME_SLOP = 16
const CHAIN_WINDOW_MS = 900
// Horizontal drag maps to a fixed 120s window rather than the whole duration:
// on a three-hour film a 1:1 mapping makes every pixel worth ~10 seconds and
// fine seeking impossible.
const SCRUB_WINDOW_S = 120

/**
 * Pointer-event gesture recognizer for the video surface.
 *
 * Pointer events (not touch events) so mouse, touch and pen share one path,
 * and so setPointerCapture keeps a drag alive when the finger leaves the
 * element. `pointerType` is what separates desktop from touch behaviour —
 * double-tap-to-seek would otherwise add a visible delay to every mouse click.
 */
export function usePlayerGestures (targetRef, options) {
  const {
    enabled,
    volumeSupported,
    getDuration,
    getPosition,
    liveScrub,
    onTap,
    onDoubleTapSeek,
    onScrubStart,
    onScrub,
    onScrubEnd,
    onVolumeDelta,
    onActivity,
    onToggleFullscreen
  } = options

  const scrubbing = ref(false)
  const scrubPosition = ref(0)
  const ripple = ref(null)
  const volumeHud = ref(null)

  let mode = 'idle'
  let start = null
  let pendingTap = null
  let tapTimer = null
  let chain = null
  let hudTimer = null
  let rippleTimer = null
  let frame = null

  function clamp (value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function rect () {
    return targetRef.value?.getBoundingClientRect() || { width: 1, height: 1, left: 0, top: 0 }
  }

  function reset () {
    mode = 'idle'
    start = null
    scrubbing.value = false

    if (frame) {
      cancelAnimationFrame(frame)
      frame = null
    }
  }

  function showRipple (direction, amount) {
    ripple.value = { direction, amount, key: Date.now() }
    clearTimeout(rippleTimer)
    // Driven from JS rather than a pure CSS animation so that it stays visible
    // for reduced-motion users, whose animation durations are globally zeroed.
    rippleTimer = setTimeout(() => { ripple.value = null }, 600)
  }

  function showVolumeHud (value) {
    volumeHud.value = value
    clearTimeout(hudTimer)
    hudTimer = setTimeout(() => { volumeHud.value = null }, 700)
  }

  // Shows a seek of `seconds` as a ripple. Repeated seeks the same way
  // accumulate, the way YouTube chains skips. Also used for keyboard seeks.
  function flashSeek (seconds) {
    const direction = Math.sign(seconds)
    const amount = Math.abs(seconds)
    const now = Date.now()

    if (chain && chain.direction === direction && now - chain.at < CHAIN_WINDOW_MS) {
      chain = { direction, at: now, amount: chain.amount + amount }
    } else {
      chain = { direction, at: now, amount }
    }

    showRipple(direction, chain.amount)
  }

  function handleDoubleTap (x, bounds) {
    const direction = x - bounds.left < bounds.width / 2 ? -1 : 1

    flashSeek(direction * 10)
    onDoubleTapSeek?.(direction * 10)
  }

  function onPointerDown (event) {
    if (enabled && !enabled.value) return
    if (!event.isPrimary) return
    if (event.target.closest?.('button, [role="slider"], a, input, select')) return

    // Only a mouse reports activity here. On touch the tap itself owns
    // visibility: revealing on pointerdown and then toggling on pointerup
    // cancels out, which is what made the chrome unrecoverable before.
    if (event.pointerType === 'mouse') onActivity?.()

    start = {
      x: event.clientX,
      y: event.clientY,
      t: Date.now(),
      position: getPosition?.() || 0,
      type: event.pointerType
    }
    mode = 'undecided'

    try {
      targetRef.value?.setPointerCapture(event.pointerId)
    } catch (error) {
      // Capture is best-effort; the gesture still works without it.
    }
  }

  function onPointerMove (event) {
    if (!start || !event.isPrimary) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const bounds = rect()

    if (mode === 'undecided') {
      if (Math.hypot(dx, dy) < MOVE_SLOP) return

      if (Math.abs(dx) > Math.abs(dy)) {
        mode = 'scrub'
        scrubbing.value = true
        scrubPosition.value = start.position
        onScrubStart?.(start.position)
      } else if (
        volumeSupported?.value &&
        start.type !== 'mouse' &&
        start.x - bounds.left > bounds.width / 2 &&
        Math.abs(dy) > VOLUME_SLOP
      ) {
        mode = 'volume'
      } else {
        mode = 'cancelled'
      }

      if (mode !== 'cancelled') event.preventDefault()
      if (mode !== 'scrub') return
    }

    if (mode === 'scrub') {
      event.preventDefault()

      const duration = getDuration?.() || 0
      if (!duration) return

      const span = Math.min(duration, SCRUB_WINDOW_S)
      const next = clamp(start.position + (dx / bounds.width) * span, 0, duration)

      scrubPosition.value = next

      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null
        onScrub?.(scrubPosition.value, liveScrub?.value === true)
      })
      return
    }

    if (mode === 'volume') {
      event.preventDefault()
      // Incremental against the last point so the HUD tracks the finger rather
      // than drifting from the origin.
      const delta = -(event.clientY - start.y) / (bounds.height * 0.6)
      start.y = event.clientY
      const level = onVolumeDelta?.(delta)
      if (typeof level === 'number') showVolumeHud(level)
    }
  }

  function onPointerUp (event) {
    if (!start || !event.isPrimary) return

    const bounds = rect()
    const elapsed = Date.now() - start.t
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    const pointerType = start.type
    const finished = mode

    try {
      targetRef.value?.releasePointerCapture(event.pointerId)
    } catch (error) {
      // Ignore: the capture may already have been released.
    }

    if (finished === 'scrub') {
      onScrubEnd?.(scrubPosition.value)
      reset()
      return
    }

    if (finished === 'volume' || finished === 'cancelled') {
      reset()
      return
    }

    if (elapsed >= TAP_MAX_MS || moved >= MOVE_SLOP) {
      reset()
      return
    }

    // Desktop keeps the conventional click/dblclick mapping; a 280ms wait on
    // every click to disambiguate a gesture touch users only have would be a
    // regression for mouse users.
    if (pointerType === 'mouse') {
      onTap?.('mouse')
      reset()
      return
    }

    const now = Date.now()
    const isSecondTap = pendingTap &&
      now - pendingTap.t < DOUBLE_TAP_MS &&
      Math.hypot(event.clientX - pendingTap.x, event.clientY - pendingTap.y) < DOUBLE_TAP_SLOP

    if (isSecondTap) {
      clearTimeout(tapTimer)
      pendingTap = null
      handleDoubleTap(event.clientX, bounds)
    } else {
      pendingTap = { x: event.clientX, y: event.clientY, t: now }
      const x = event.clientX
      tapTimer = setTimeout(() => {
        // A tap that lands inside an active chain continues the skip rather
        // than collapsing the chrome mid-seek.
        if (chain && Date.now() - chain.at < CHAIN_WINDOW_MS) {
          handleDoubleTap(x, rect())
        } else {
          onTap?.('touch')
        }
        pendingTap = null
      }, DOUBLE_TAP_MS)
    }

    reset()
  }

  function onPointerCancel () {
    if (mode === 'scrub') onScrubEnd?.(null)
    reset()
  }

  function onDoubleClick (event) {
    if (enabled && !enabled.value) return
    if (event.target.closest?.('button, [role="slider"], a, input, select')) return
    onToggleFullscreen?.()
  }

  onBeforeUnmount(() => {
    clearTimeout(tapTimer)
    clearTimeout(hudTimer)
    clearTimeout(rippleTimer)
    if (frame) cancelAnimationFrame(frame)
  })

  return {
    scrubbing,
    scrubPosition,
    ripple,
    volumeHud,
    flashSeek,
    showVolumeHud,
    handlers: {
      onPointerdown: onPointerDown,
      onPointermove: onPointerMove,
      onPointerup: onPointerUp,
      onPointercancel: onPointerCancel,
      onDblclick: onDoubleClick
    }
  }
}
