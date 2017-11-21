import Vue from 'vue'
import Router from 'vue-router'

import Main from '@/components/pages/Main'
import SeriesView from '@/components/pages/SeriesView'
import play from '@/components/pages/play'
import Login from '@/components/pages/Login'

import { VueAuthenticate } from 'vue-authenticate'
import VueAxios from 'vue-axios'
import axios from 'axios'

Vue.use(VueAxios, axios)

const vueAuth = new VueAuthenticate(Vue.prototype.$http, {
  baseUrl: 'http://localhost:8080'
})

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main,
      meta: { requiresAuth: true }
    },
    {
      path: '/series/:seriesId',
      name: 'SeriesView',
      component: SeriesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/episode/:episodeId/play',
      name: 'play',
      component: play,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    axios.get(require('../config.json').server.host + '/auth/isAuthenticated')
      .then(response => {
        console.log(response.data)
        if (response.data[0] === false) {
          vueAuth.logout()
        }
      })
      .catch(e => {})

    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!vueAuth.isAuthenticated()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})

export default router
