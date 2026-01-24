import io from 'socket.io-client'
import Vue from 'vue'
import oblectoClient from '@/oblectoClient'

let socket = null
let connectionFailedCount = 0

export function initSocket (vm, host = oblectoClient.axios.defaults.baseURL) {
  if (socket) {
    socket.close()
  }

  socket = io(host)
  Vue.prototype.$socket = socket

  connectionFailedCount = 0

  socket.on('connect_error', () => {
    connectionFailedCount++
    if (connectionFailedCount === 1) {
      vm.$notify({
        group: 'system',
        title: 'Connection failed',
        text: 'Failed to connect to the Oblecto web socket server. Is the server online?',
        type: 'error'
      })
    }
  })

  socket.on('connect', () => {
    connectionFailedCount = 0

    vm.$notify({
      group: 'system',
      title: 'Connection to Oblecto succeeded',
      text: 'Client has successfully connected to the Oblecto websocket interface!',
      type: 'success'
    })

    if (oblectoClient.accessToken) {
      socket.emit('authenticate', { token: oblectoClient.accessToken })

      vm.$notify({
        group: 'system',
        title: 'Authentication success',
        text: 'Socket interface has been authenticated',
        type: 'success'
      })

      vm.$store.dispatch('updateAll')
    }
  })

  socket.on('indexer', (val) => {
    if (val.event === 'added') {
      vm.$store.dispatch('updateAll')
    }
  })

  socket.on('play', (msg) => {
    if (msg.episodeId) {
      vm.$store.dispatch('playEpisodeLocal', msg.episodeId)
    }

    if (msg.movieId) {
      vm.$store.dispatch('playMovieLocal', msg.movieId)
    }
  })

  socket.on('seedbox', (msg) => {
    vm.$store.dispatch('seedbox/processSocketEvent', msg)

    if (msg.event === 'import_start') {
      vm.$notify({
        group: 'system',
        title: 'Import Started',
        text: `Importing ${msg.origin} from ${msg.seedbox}`,
        type: 'info'
      })
    } else if (msg.event === 'import_success') {
      vm.$notify({
        group: 'system',
        title: 'Import Finished',
        text: `Successfully imported ${msg.origin}`,
        type: 'success'
      })
    } else if (msg.event === 'import_error') {
      vm.$notify({
        group: 'system',
        title: 'Import Failed',
        text: `Failed to import ${msg.origin}: ${msg.error}`,
        type: 'error'
      })
    }
  })

  return socket
}

export function reconnectSocket (vm, host) {
  return initSocket(vm, host)
}

export function getSocket () {
  return socket
}

export default socket
