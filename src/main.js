import { createApp } from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { Tabs, Tab } from 'vue-tabs-component'
import VModal from 'vue-js-modal'
import Notifications from 'vue-notification'
import VueSocketio from 'vue-socket.io'
import oblectoClient from '@/oblectoClient'

const app = createApp(App)

app.use(VModal)
app.use(Notifications)
app.use(VueAxios, axios)

store.dispatch('updateHost', oblectoClient.axios.defaults.baseURL)
app.use(VueSocketio, oblectoClient.axios.defaults.baseURL)

app.component('tabs', Tabs)
app.component('tab', Tab)

app.config.productionTip = false

let connectionFailedCount = 0

app.use(store)
app.use(router)

app.config.globalProperties.$options = app.config.globalProperties.$options || {}
app.config.globalProperties.$options.sockets = {
  connect_error: function () {
    connectionFailedCount++

    if (connectionFailedCount === 1) {
      this.$notify({
        group: 'system',
        title: 'Connection failed',
        text: 'Failed to connect to the Oblecto web socket server. Is the server online?',
        type: 'error'
      })
    }
  },
  connect: function () {
    connectionFailedCount = 0

    this.$notify({
      group: 'system',
      title: 'Connection to Oblecto succeeded',
      text: 'Client has successfully connected to the Oblecto websocket interface!',
      type: 'success'
    })

    if (oblectoClient.accessToken) {
      this.$socket.emit('authenticate', { token: oblectoClient.accessToken })

      this.$notify({
        group: 'system',
        title: 'Authentication success',
        text: 'Socket interface has been authenticated',
        type: 'success'
      })

      this.$store.dispatch('updateAll')
    }
  },
  indexer: function (val) {
    if (val.event === 'added') {
      this.$store.dispatch('updateAll')
    }
  },
  play: function (msg) {
    if (msg.episodeId) {
      store.dispatch('playEpisodeLocal', msg.episodeId)
    }

    if (msg.movieId) {
      store.dispatch('playMovieLocal', msg.movieId)
    }
  }
}

app.mount('#app')

export const instance = app
