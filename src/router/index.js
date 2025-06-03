import { createRouter, createWebHistory } from 'vue-router'

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
import IndexerSettings from '@/components/settings/IndexerSettings'

import oblectoClient from '@/oblectoClient'
import Series from '@/components/pages/Series'

const routes = [
    {
      path: '/',
      name: 'Main',
      component: Main,
      meta: { requiresAuth: true }
    },
    {
      path: '/series',
      name: 'Series',
      component: Series,
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
        },
        {
          name: 'IndexerSettings',
          path: 'indexer',
          component: IndexerSettings
        }
      ]
    }
]

const router = createRouter({
  history: createWebHistory(BASE_PATH),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!oblectoClient.accessToken) {
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
