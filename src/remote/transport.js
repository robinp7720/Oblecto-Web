import { setError } from './state.js'

// The only module that knows the realtime event names for remote play.

let socket = null

/** Position-only updates are throttled; a status change goes out at once. */
const STATE_INTERVAL_MS = 1000
/** A heartbeat so a paused or idle device does not look stale to a controller. */
const HEARTBEAT_MS = 5000

let lastSent = null
let lastSentAt = 0
let pendingTimer = null

export function bindSocket (next) {
  socket = next
  lastSent = null
  lastSentAt = 0
  clearTimeout(pendingTimer)
  pendingTimer = null
}

/**
 * Sends a command to another device and resolves with what that device said.
 *
 * The ack comes from the target, relayed by the server, so a resolved promise
 * means playback actually started rather than merely that a message was sent.
 *
 * @param {string} targetDeviceId - Device to command.
 * @param {object} command - A RemoteCommand.
 * @returns {Promise<object>} The acknowledgement.
 */
export function sendCommand (targetDeviceId, command) {
  if (!socket || !socket.connected) {
    const ack = { ok: false, code: 'failed', error: 'Not connected to the server.' }
    setError(ack.error)
    return Promise.resolve(ack)
  }

  return new Promise(resolve => {
    let settled = false
    const finish = ack => {
      if (settled) return
      settled = true
      if (!ack.ok) setError(ack.error || 'The command failed.')
      resolve(ack)
    }

    // The server already bounds this, but a dead socket never calls back at
    // all and the UI must not wait forever on it.
    const timer = setTimeout(
      () => finish({ ok: false, code: 'timeout', error: 'The device did not respond.' }),
      8000
    )

    socket.emit('remote:command', { targetDeviceId, command }, ack => {
      clearTimeout(timer)
      finish(ack && typeof ack === 'object' ? ack : { ok: true })
    })
  })
}

function statusOf (state) {
  return state ? state.status : 'idle'
}

function isTransition (state) {
  if (!lastSent) return true
  if (statusOf(state) !== statusOf(lastSent)) return true
  if (state.media?.id !== lastSent.media?.id) return true
  if (state.media?.kind !== lastSent.media?.kind) return true

  return state.muted !== lastSent.muted || state.volume !== lastSent.volume
}

/**
 * Publishes this device's playback state.
 *
 * Transitions go immediately so a controller's play/pause button never lags;
 * position-only changes are held to one per second, which is what the server
 * rate limit expects.
 *
 * @param {object} state - A PlaybackState.
 */
export function reportState (state) {
  if (!socket || !socket.connected) return

  const now = Date.now()
  const elapsed = now - lastSentAt

  if (isTransition(state) || elapsed >= STATE_INTERVAL_MS) {
    clearTimeout(pendingTimer)
    pendingTimer = null
    lastSent = state
    lastSentAt = now
    socket.emit('playback:state', state)

    return
  }

  // Coalesce everything that arrives inside the window into one trailing send,
  // so the last position is never dropped.
  if (pendingTimer) return

  pendingTimer = setTimeout(() => {
    pendingTimer = null
    reportState(state)
  }, STATE_INTERVAL_MS - elapsed)
}

let heartbeat = null

/**
 * Keeps reporting while nothing changes, so a controller can tell a paused
 * device from one that silently died.
 *
 * @param {Function} getState - Returns the current PlaybackState.
 */
export function startHeartbeat (getState) {
  stopHeartbeat()

  heartbeat = setInterval(() => {
    const state = getState()

    if (state) reportState(state)
  }, HEARTBEAT_MS)
}

export function stopHeartbeat () {
  if (heartbeat) clearInterval(heartbeat)
  heartbeat = null
}
