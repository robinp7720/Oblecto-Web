import Vue from 'vue'
import Router from 'vue-router'

import TVShows from '@/components/pages/TVShows'
import SeriesView from '@/components/pages/SeriesView'
import Login from '@/components/pages/Login'
import Movies from '@/components/pages/Movies'
import Main from '@/components/pages/Main'
import Settings from '@/components/pages/Settings'

import { VueAuthenticate } from 'vue-authenticate'
import VueAxios from 'vue-axios'
import axios from 'axios'

Vue.use(VueAxios, axios)

const vueAuth = new VueAuthenticate(Vue.prototype.$http)

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
      path: '/tvshows',
      name: 'TVShows',
      component: TVShows,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies',
      name: 'Movies',
      component: Movies,
      meta: { requiresAuth: true }
    },
    {
      path: '/series/:seriesId',
      name: 'SeriesView',
      component: SeriesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    axios.get(require('../config.json').server.host + '/auth/isAuthenticated')
      .then(response => {
        if (response.data[0] === false) {
          vueAuth.logout()
        }
      })
      .catch(e => {
        vueAuth.logout()
      })

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
