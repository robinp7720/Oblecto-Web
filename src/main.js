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

Vue.use(VueAxios, axios)

Vue.axios.defaults.baseURL = require('./config.json').server.host

// Initiate Vue authenticate
Vue.use(VueAuthenticate, {
  baseUrl: Vue.axios.defaults.baseURL
})

Vue.component('tabs', Tabs)
Vue.component('tab', Tab)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: {App}
})
