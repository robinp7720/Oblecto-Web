import { defineStore } from 'pinia'
import { useMediaStore } from '@/stores/media'

export const LOCAL = 'local'

export const useRemoteStore = defineStore('remote', {
  state: () => ({ devices: [], targetDeviceId: LOCAL, lastError: '' }),
  getters: {
    playbackTargets: state => state.devices.filter(device => !device.isSelf && device.capabilities.includes('playback')),
    isRemote: state => state.targetDeviceId !== LOCAL,
    activeDevice: state => state.devices.find(device => device.deviceId === state.targetDeviceId) || null,
    activeState () { return this.activeDevice?.state || null }
  },
  actions: {
    applyDevices (devices) {
      this.devices = Array.isArray(devices) ? devices : []
      useMediaStore().applyDevices(this.devices)
      if (this.isRemote && !this.activeDevice) {
        this.targetDeviceId = LOCAL
        this.lastError = 'That device disconnected. New playback will start on this device.'
      }
    },
    setTarget (deviceId) {
      this.targetDeviceId = deviceId || LOCAL
      this.lastError = ''
    },
    setError (message) { this.lastError = message || '' }
  }
})

// Transport helpers resolve the active Pinia instance only after app startup.
export const applyDevices = devices => useRemoteStore().applyDevices(devices)
export const setError = message => useRemoteStore().setError(message)
export const reset = () => useRemoteStore().$reset()
