// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { Tabs, Tab } from 'vue-tabs-component'
import VModal from 'vue-js-modal'
import Notifications from 'vue-notification'
import { initSocket } from '@/socket'
import oblectoClient from '@/oblectoClient'

Vue.use(VModal)

Vue.use(Notifications)

Vue.use(VueAxios, axios)

store.dispatch('updateHost', oblectoClient.axios.defaults.baseURL)

Vue.component('tabs', Tabs)
Vue.component('tab', Tab)

Vue.config.productionTip = false

/* eslint-disable no-new */
export const instance = new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})

initSocket(instance)
