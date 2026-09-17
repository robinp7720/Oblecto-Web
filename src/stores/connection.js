import { reactive } from 'vue'

// Plain reactive state rather than a Pinia store, because socket.js writes to
// it before any component (and therefore any Pinia instance) exists.
export const connection = reactive({
  // connecting | connected | offline
  status: 'connecting',
  attempts: 0,
  detail: ''
})

// After this many consecutive failures we stop calling it "connecting" and
// admit the server is not answering.
const OFFLINE_AFTER = 3

export function markConnecting () {
  connection.status = 'connecting'
  connection.detail = ''
}

export function markConnected () {
  connection.status = 'connected'
  connection.attempts = 0
  connection.detail = ''
}

export function markConnectionFailure (detail = '') {
  connection.attempts += 1
  connection.status = connection.attempts >= OFFLINE_AFTER ? 'offline' : 'connecting'
  connection.detail = detail
}
