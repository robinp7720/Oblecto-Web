// This device's identity, as presented to the realtime server.
//
// The id lives in localStorage rather than being the socket id: a socket id
// changes on every reload, which is what made a selected playback target go
// stale the moment the target refreshed.

const DEVICE_ID_KEY = 'oblecto.deviceId'
const DEVICE_NAME_KEY = 'oblecto.deviceName'

// localStorage throws outright in a few privacy configurations, so every
// access is guarded and falls back to a working (if forgetful) session.
function read (key) {
  try {
    return window.localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

function write (key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch (e) {
    // A device that cannot persist its id simply looks like a new device on
    // every load. That degrades gracefully; failing to connect would not.
  }
}

function randomId () {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()

  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

let cachedId = null

export function getDeviceId () {
  if (cachedId) return cachedId

  cachedId = read(DEVICE_ID_KEY)

  if (!cachedId) {
    cachedId = randomId()
    write(DEVICE_ID_KEY, cachedId)
  }

  return cachedId
}

const BROWSERS = [
  ['Edg/', 'Edge'],
  ['OPR/', 'Opera'],
  ['Firefox/', 'Firefox'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari']
]

const PLATFORMS = [
  ['Android', 'Android'],
  ['iPhone', 'iPhone'],
  ['iPad', 'iPad'],
  ['Windows', 'Windows'],
  ['Mac OS X', 'macOS'],
  ['CrOS', 'ChromeOS'],
  ['Linux', 'Linux']
]

function match (userAgent, table, fallback) {
  const hit = table.find(([needle]) => userAgent.includes(needle))

  return hit ? hit[1] : fallback
}

/**
 * Builds the name a device gets before anyone renames it. Anything beats the
 * old hardcoded "default", which made every entry in the picker identical.
 *
 * @param {string} userAgent - Navigator user agent string.
 * @returns {string} A human-meaningful name, e.g. "Firefox on Linux".
 */
export function deriveDeviceName (userAgent = window.navigator.userAgent || '') {
  const browser = match(userAgent, BROWSERS, 'Browser')
  const platform = match(userAgent, PLATFORMS, null)

  return platform ? `${browser} on ${platform}` : browser
}

export function getDeviceName () {
  return read(DEVICE_NAME_KEY) || deriveDeviceName()
}

/**
 * Stores a name chosen by the user. This is how a rename survives a reload
 * without the server needing a devices table: the name belongs to the device,
 * and the device re-asserts it on every connect.
 *
 * @param {string} name - The new device name.
 * @returns {string} The stored name.
 */
export function setDeviceName (name) {
  const trimmed = String(name || '').trim().slice(0, 64)

  if (!trimmed) return getDeviceName()

  write(DEVICE_NAME_KEY, trimmed)

  return trimmed
}

/**
 * The handshake payload. A browser can both play and control; something
 * headless would omit 'playback' and stay out of the picker entirely.
 *
 * @returns {{id: string, name: string, capabilities: string[]}} Device identity.
 */
export function getDeviceIdentity () {
  return {
    id: getDeviceId(),
    name: getDeviceName(),
    capabilities: ['control', 'playback']
  }
}
