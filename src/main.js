// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import { Tabs, Tab } from 'vue-tabs-component'
import VModal from 'vue-js-modal'
import Notifications from 'vue-notification'

Vue.use(VModal)

Vue.use(Notifications)

Vue.use(VueAxios, axios)

if (OBLECTO_HOST) {
  store.dispatch('updateHost', OBLECTO_HOST)
} else {
  let port = window.location.port || '80'
  store.dispatch('updateHost', window.location.protocol + '//' + window.location.hostname + ':' + port)
}

// Initiate Vue authenticate
Vue.use(VueAuthenticate)

Vue.component('tabs', Tabs)
Vue.component('tab', Tab)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  sockets: {
    connect_error: function () {
      this.$notify({
        group: 'system',
        title: 'Connection failed',
        text: 'Failed to connect to the Oblecto web socket server. Is the server online?',
        type: 'error'
      })
    },
    connect: function () {
      this.$notify({
        group: 'system',
        title: 'Connection to Oblecto succeeded',
        text: 'Client has successfully connected to the Oblecto websocket interface!',
        type: 'success'
      })

      // Authenticate socket if auth token exits
      if (this.$auth.isAuthenticated()) {
        if (this.$auth.getToken()) {
          this.$socket.emit('authenticate', { token: this.$auth.getToken() })

          this.$notify({
            group: 'system',
            title: 'Authentication success',
            text: 'Socket interface has been authenticated',
            type: 'success'
          })

          this.$store.dispatch('updateAll')
        }
      }
    },
    indexer: function (val) {
      if (val.event === 'added') {
        this.$store.dispatch('updateAll')
      }
    }
  },
  router,
  template: '<App/>',
  components: { App }
})
