import { defineStore } from 'pinia'

// After this many consecutive failures we stop calling it "connecting" and
// admit the server is not answering.
const OFFLINE_AFTER = 3

export const useConnectionStore = defineStore('connection', {
  state: () => ({ status: 'connecting', attempts: 0, detail: '' }),
  actions: {
    markConnecting () {
      this.status = 'connecting'
      this.detail = ''
    },
    markConnected () {
      this.status = 'connected'
      this.attempts = 0
      this.detail = ''
    },
    markConnectionFailure (detail = '') {
      this.attempts++
      this.status = this.attempts >= OFFLINE_AFTER ? 'offline' : 'connecting'
      this.detail = detail
    }
  }
})
