import { createRouter, createWebHistory } from 'vue-router'
import oblectoClient from '@/oblectoClient'

import HomeView from '@/views/HomeView.vue'
import DiscoverView from '@/views/DiscoverView.vue'
import LibraryView from '@/views/LibraryView.vue'
import SearchView from '@/views/SearchView.vue'
import LoginView from '@/views/LoginView.vue'
import SettingsView from '@/views/SettingsView.vue'

import MovieInfo from '@/components/pages/MovieInfo'
import EpisodeInfo from '@/components/pages/EpisodeInfo'
import SeriesView from '@/components/pages/SeriesView'

import Maintenance from '@/components/settings/Maintenance'
import UserManager from '@/components/settings/UserManager'
import Libraries from '@/components/settings/Libraries'
import Sets from '@/components/settings/Sets'
import IndexerSettings from '@/components/settings/IndexerSettings'
import ArtworkSettings from '@/components/settings/ArtworkSettings'
import FederationSettings from '@/components/settings/FederationSettings'
import SeedboxSettings from '@/components/settings/SeedboxSettings'
import ProblematicFiles from '@/components/settings/ProblematicFiles'
import ServerStatus from '@/components/settings/ServerStatus'

const router = createRouter({
  history: createWebHistory(BASE_PATH),
  routes: [
    {
      path: '/',
      name: 'Main',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/discover',
      name: 'Discover',
      component: DiscoverView,
      meta: { requiresAuth: true }
    },
    {
      path: '/library/:mediaType(movies|series)',
      name: 'Library',
      component: LibraryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies',
      redirect: {
        name: 'Library',
        params: { mediaType: 'movies' }
      }
    },
    {
      path: '/series',
      redirect: {
        name: 'Library',
        params: { mediaType: 'series' }
      }
    },
    {
      path: '/movie/:movieId',
      name: 'MovieInfo',
      component: MovieInfo,
      meta: { requiresAuth: true }
    },
    {
      path: '/series/:seriesId',
      name: 'SeriesView',
      component: SeriesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/episode/:episodeId',
      name: 'EpisodeInfo',
      component: EpisodeInfo,
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'Search',
      component: SearchView,
      meta: { requiresAuth: true }
    },
    {
      path: '/search/:search',
      redirect: to => ({
        name: 'Search',
        query: {
          q: to.params.search
        }
      })
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        layout: 'auth'
      }
    },
    {
      path: '/settings',
      component: SettingsView,
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
        },
        {
          name: 'ArtworkSettings',
          path: 'artwork',
          component: ArtworkSettings
        },
        {
          name: 'FederationSettings',
          path: 'federation',
          component: FederationSettings
        },
        {
          name: 'SeedboxSettings',
          path: 'seedboxes',
          component: SeedboxSettings
        },
        {
          name: 'ProblematicFiles',
          path: 'problematic',
          component: ProblematicFiles
        },
        {
          name: 'ServerStatus',
          path: 'status',
          component: ServerStatus
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  const hasToken = Boolean(oblectoClient.accessToken || window.localStorage.getItem('oblecto.accessToken'))

  if (to.matched.some(record => record.meta.requiresAuth) && !hasToken) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.name === 'login' && hasToken) {
    return { name: 'Main' }
  }

  return true
})

export default router
