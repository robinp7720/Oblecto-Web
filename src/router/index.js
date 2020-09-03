import Vue from 'vue'
import Router from 'vue-router'

import TVShows from '@/components/pages/TVShows'
import SeriesView from '@/components/pages/SeriesView'
import MovieInfo from '@/components/pages/MovieInfo'
import Login from '@/components/pages/Login'
import Movies from '@/components/pages/Movies'
import Search from '@/components/pages/Search'
import Main from '@/components/pages/Main'

import Settings from '@/components/pages/Settings'
import Maintenance from '@/components/settings/Maintenance'
import UserManager from '@/components/settings/UserManager'
import Libraries from '@/components/settings/Libraries'
import Sets from '@/components/settings/Sets'

import VueAxios from 'vue-axios'
import axios from 'axios'
import oblectoClient from '@/oblectoClient'

Vue.use(VueAxios, axios)

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: BASE_PATH,
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
      path: '/movie/:movieId',
      name: 'MovieInfo',
      component: MovieInfo,
      meta: { requiresAuth: true }
    },
    {
      path: '/search/:search',
      name: 'Search',
      component: Search,
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
      meta: { requiresAuth: true },
      children: [
        {
          name: 'SettingsHome',
          path: '',
          component: Maintenance
        },
        {
          name: 'SettingsMaintenance',
          path: 'maintenance',
          component: Maintenance
        },
        {
          name: 'SettingsUsers',
          path: 'users',
          component: UserManager
        },
        {
          name: 'SettingsLibraries',
          path: 'libraries',
          component: Libraries
        },
        {
          name: 'SettingsSets',
          path: 'sets',
          component: Sets
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!oblectoClient.accessToken) {
      console.log('directing to login')
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
