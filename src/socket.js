import io from 'socket.io-client'
import oblectoClient from '@/oblectoClient'
import { useConnectionStore } from '@/stores/connection'
import { getDeviceIdentity } from '@/remote/device'
import { applyDevices, reset as resetRemote } from '@/remote/state'
import { bindSocket } from '@/remote/transport'
import { bindStore, handleCommand } from '@/remote/receiver'
import { useMediaStore } from '@/stores/media'
import { useSeedboxStore } from '@/stores/seedbox'

let socket = null

export function disconnectSocket () {
  if (socket) {
    socket.removeAllListeners()
    socket.close()
    socket = null
  }
  bindSocket(null)
  bindStore(null)
  resetRemote()
  useConnectionStore().$reset()
}

export function initSocket ({ app, store, pinia }, host = oblectoClient.axios.defaults.baseURL) {
  disconnectSocket()
  bindStore(store)
  const media = useMediaStore(pinia)
  const connection = useConnectionStore(pinia)

  // The server now authenticates in the handshake, so connecting without a
  // token just loops on rejection. Sign-in calls back through
  // `reconnectSocket`, which is where an anonymous visitor picks the socket up.
  if (!oblectoClient.accessToken) {
    app.config.globalProperties.$socket = null
    bindSocket(null)

    return null
  }

  // Identity travels in the handshake rather than in a post-connect
  // `authenticate` event, so a socket is never connected-but-anonymous and the
  // server always knows which device it is talking to. `auth` is re-read by
  // socket.io on every reconnect, so a rename applies without a full reload.
  socket = io(host, {
    auth: cb => cb({
      token: oblectoClient.accessToken,
      device: getDeviceIdentity()
    })
  })

  app.config.globalProperties.$socket = socket
  bindSocket(socket)

  connection.markConnecting()

  // Connection health is reported by the pill in the header rather than by
  // toasts: it stays visible for as long as it is true, and says nothing at all
  // while the socket is healthy.
  socket.on('connect_error', (error) => {
    connection.markConnectionFailure(error?.message || '')
  })

  socket.on('disconnect', () => {
    connection.markConnecting()
    resetRemote()
  })

  socket.on('connect', () => {
    connection.markConnected()
    media.resync()
  })

  socket.on('indexer', (val) => {
    media.libraryEvent(val)
  })

  // The server pushes the whole list whenever anything about this user's
  // devices changes, so there is no polling and no subscription to resync.
  socket.on('devices', (devices) => {
    applyDevices(devices)
  })

  socket.on('media:progress', payload => media.applyProgress(payload, { persisted: true }))

  // Another device is driving this one. The ack goes back to it through the
  // server, so it learns whether playback actually started.
  socket.on('remote:command', (payload, ack) => {
    handleCommand(payload).then(result => {
      if (typeof ack === 'function') ack(result)
    })
  })

  // Import progress lands in the seedbox store, which Settings → Seedboxes
  // renders as a live transfer list. That page is where someone watching an
  // import already is; a toast on every event just interrupted everyone else.
  socket.on('seedbox', (msg) => {
    useSeedboxStore(pinia).processSocketEvent(msg)
  })

  return socket
}

export function reconnectSocket ({ app, store, pinia }, host) {
  return initSocket({ app, store, pinia }, host)
}

export function getSocket () {
  return socket
}

export default socket
