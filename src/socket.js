import io from 'socket.io-client'
import oblectoClient from '@/oblectoClient'
import { markConnected, markConnecting, markConnectionFailure } from '@/stores/connection'

let socket = null

export function initSocket ({ app, store }, host = oblectoClient.axios.defaults.baseURL) {
  if (socket) {
    socket.close()
  }

  socket = io(host)
  app.config.globalProperties.$socket = socket

  markConnecting()

  // Connection health is reported by the pill in the header rather than by
  // toasts: it stays visible for as long as it is true, and says nothing at all
  // while the socket is healthy.
  socket.on('connect_error', (error) => {
    markConnectionFailure(error?.message || '')
  })

  socket.on('disconnect', () => {
    markConnecting()
  })

  socket.on('connect', () => {
    markConnected()

    if (oblectoClient.accessToken) {
      socket.emit('authenticate', { token: oblectoClient.accessToken })
      store.dispatch('updateAll')
    }
  })

  socket.on('indexer', (val) => {
    if (val.event === 'added') {
      store.dispatch('updateAll')
    }
  })

  socket.on('play', (msg) => {
    if (msg.episodeId) {
      store.dispatch('playEpisodeLocal', msg.episodeId)
    }

    if (msg.movieId) {
      store.dispatch('playMovieLocal', msg.movieId)
    }
  })

  // Import progress lands in the seedbox store, which Settings → Seedboxes
  // renders as a live transfer list. That page is where someone watching an
  // import already is; a toast on every event just interrupted everyone else.
  socket.on('seedbox', (msg) => {
    store.dispatch('seedbox/processSocketEvent', msg)
  })

  return socket
}

export function reconnectSocket ({ app, store }, host) {
  return initSocket({ app, store }, host)
}

export function getSocket () {
  return socket
}

export default socket
