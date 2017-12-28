// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import {Tabs, Tab} from 'vue-tabs-component'
import VModal from 'vue-js-modal'
import Notifications from 'vue-notification'

Vue.use(VModal)

Vue.use(Notifications)

Vue.use(VueAxios, axios)

store.dispatch('updateHost', require('./config').server.host)

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
    reconnect_error: function () {
      this.$notify({
        group: 'system',
        title: 'Connection failed',
        text: 'Failed to connect to the Oblecto web socket server. Is the server online?',
        type: 'error'
      })
    }
  },
  router,
  template: '<App/>',
  components: {App}
})
