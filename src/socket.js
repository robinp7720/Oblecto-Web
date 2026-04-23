import io from 'socket.io-client'
import oblectoClient from '@/oblectoClient'

let socket = null
let connectionFailedCount = 0

export function initSocket ({ app, store, notify }, host = oblectoClient.axios.defaults.baseURL) {
  if (socket) {
    socket.close()
  }

  socket = io(host)
  app.config.globalProperties.$socket = socket

  connectionFailedCount = 0

  socket.on('connect_error', () => {
    connectionFailedCount++
    if (connectionFailedCount === 1) {
      notify({
        title: 'Connection failed',
        text: 'Failed to connect to the Oblecto web socket server. Is the server online?',
        type: 'error'
      })
    }
  })

  socket.on('connect', () => {
    connectionFailedCount = 0

    notify({
      title: 'Connection to Oblecto succeeded',
      text: 'Client has successfully connected to the Oblecto websocket interface!',
      type: 'success'
    })

    if (oblectoClient.accessToken) {
      socket.emit('authenticate', { token: oblectoClient.accessToken })

      notify({
        title: 'Authentication success',
        text: 'Socket interface has been authenticated',
        type: 'success'
      })

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

  socket.on('seedbox', (msg) => {
    store.dispatch('seedbox/processSocketEvent', msg)

    if (msg.event === 'import_start') {
      notify({
        title: 'Import Started',
        text: `Importing ${msg.origin} from ${msg.seedbox}`,
        type: 'info'
      })
    } else if (msg.event === 'import_success') {
      notify({
        title: 'Import Finished',
        text: `Successfully imported ${msg.origin}`,
        type: 'success'
      })
    } else if (msg.event === 'import_error') {
      notify({
        title: 'Import Failed',
        text: `Failed to import ${msg.origin}: ${msg.error}`,
        type: 'error'
      })
    }
  })

  return socket
}

export function reconnectSocket ({ app, store, notify }, host) {
  return initSocket({ app, store, notify }, host)
}

export function getSocket () {
  return socket
}

export default socket
