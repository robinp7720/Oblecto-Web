import { computed, reactive } from 'vue'

// Plain reactive state rather than a Pinia store, for the same reason
// stores/connection.js is: socket.js writes device lists into it before any
// component — and therefore any Pinia instance — exists.
export const remote = reactive({
  /** @type {Array<object>} Snapshots pushed by the server, this device included. */
  devices: [],
  /** Device id currently selected as the playback target, or 'local'. */
  targetDeviceId: 'local',
  /** Last command failure, shown next to the picker. */
  lastError: ''
})

export const LOCAL = 'local'

/** Devices that can actually play something, excluding this one. */
export const playbackTargets = computed(() => remote.devices.filter(
  device => !device.isSelf && device.capabilities.includes('playback')
))

export const isRemote = computed(() => remote.targetDeviceId !== LOCAL)

/** The selected target, or null when playing locally or once it disconnects. */
export const activeDevice = computed(() => {
  if (!isRemote.value) return null

  return remote.devices.find(device => device.deviceId === remote.targetDeviceId) || null
})

export const activeState = computed(() => activeDevice.value?.state || null)

/**
 * Replaces the device list.
 *
 * If the selected target has gone away, selection falls back to local rather
 * than leaving the UI pointed at something that no longer exists — the failure
 * the old socket-id-keyed picker had on every reload.
 *
 * @param {Array<object>} devices - Snapshots from the server.
 */
export function applyDevices (devices) {
  remote.devices = Array.isArray(devices) ? devices : []

  if (isRemote.value && !remote.devices.some(device => device.deviceId === remote.targetDeviceId)) {
    remote.targetDeviceId = LOCAL
    remote.lastError = 'That device disconnected. New playback will start on this device.'
  }
}

export function setTarget (deviceId) {
  remote.targetDeviceId = deviceId || LOCAL
  remote.lastError = ''
}

export function setError (message) {
  remote.lastError = message || ''
}

export function reset () {
  remote.devices = []
  remote.targetDeviceId = LOCAL
  remote.lastError = ''
}
