const StatisticsView = () => import('@/views/StatisticsView.vue')
import { createRouter, createWebHistory } from 'vue-router'
import oblectoClient from '@/oblectoClient'

const HomeView = () => import('@/views/HomeView.vue')
const DiscoverView = () => import('@/views/DiscoverView.vue')
const LibraryView = () => import('@/views/LibraryView.vue')
const SearchView = () => import('@/views/SearchView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const SettingsOverview = () => import('@/components/settings/SettingsOverview.vue')
const MetadataSettings = () => import('@/components/settings/MetadataSettings.vue')

const MovieInfo = () => import('@/components/pages/MovieInfo')
const EpisodeInfo = () => import('@/components/pages/EpisodeInfo')
const SeriesView = () => import('@/components/pages/SeriesView')
const PersonInfo = () => import('@/components/pages/PersonInfo.vue')

const Maintenance = () => import('@/components/settings/Maintenance')
const UserManager = () => import('@/components/settings/UserManager')
const SignInSettings = () => import('@/components/settings/SignInSettings.vue')
const Libraries = () => import('@/components/settings/Libraries')
const Sets = () => import('@/components/settings/Sets')
const IndexerSettings = () => import('@/components/settings/IndexerSettings')
const ArtworkSettings = () => import('@/components/settings/ArtworkSettings')
const FederationSettings = () => import('@/components/settings/FederationSettings')
const JellyfinSettings = () => import('@/components/settings/JellyfinSettings.vue')
const SeedboxSettings = () => import('@/components/settings/SeedboxSettings')
const ProblematicFiles = () => import('@/components/settings/ProblematicFiles')
const ServerStatus = () => import('@/components/settings/ServerStatus')
const GroupsSettings = () => import('@/components/settings/GroupsSettings.vue')
const AccountProfile = () => import('@/components/settings/account/AccountProfile.vue')
const AccountPassword = () => import('@/components/settings/account/AccountPassword.vue')
const AccountPreferences = () => import('@/components/settings/account/AccountPreferences.vue')
import { pagePermission, visibleGroups } from '@/components/settings/registry'
import { useAuthStore } from '@/stores/auth'
import { installCardTransitions, pageKey, pageLeave, scrollHandled } from '@/router/transition'
import { formatTitle, rememberTitle, routeTitle } from '@/composables/usePageTitle'
import { installInPageLinks } from '@/router/inPageLinks'

const router = createRouter({
  history: createWebHistory(BASE_PATH),
  async scrollBehavior (to, from, savedPosition) {
    // Query and hash changes stay on the same page: filters, search terms and
    // settings anchors, which focusSetting scrolls to itself.
    if (to.path === from.path || scrollHandled(to)) return false

    await pageLeave()

    if (savedPosition) return savedPosition
    // A link into a page (#more-like-this) lands there if the target is already
    // rendered; content that arrives later reveals itself (RelatedTitles).
    if (to.hash && document.getElementById(to.hash.slice(1))) return { el: to.hash }

    return { top: 0 }
  },
  routes: [
    { path: '/statistics', name: 'Statistics', component: StatisticsView, meta: { requiresAuth: true, title: 'Statistics' } },
    {
      path: '/',
      name: 'Main',
      component: HomeView,
      meta: { requiresAuth: true, title: 'Home' }
    },
    {
      path: '/discover',
      name: 'Discover',
      component: DiscoverView,
      meta: { requiresAuth: true, title: 'Discover' }
    },
    {
      path: '/library/:mediaType(movies|series)',
      name: 'Library',
      component: LibraryView,
      meta: { requiresAuth: true, title: to => to.params.mediaType === 'series' ? 'TV Shows' : 'Movies' }
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
      path: '/person/:personId',
      name: 'PersonInfo',
      component: PersonInfo,
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'Search',
      component: SearchView,
      meta: { requiresAuth: true, title: to => to.query.q ? `${to.query.q} · Search` : 'Search' }
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
        layout: 'auth',
        title: 'Sign in'
      }
    },
    {
      path: '/settings',
      component: SettingsView,
      meta: { requiresAuth: true },
      children: [
        { path: 'statistics', name: 'ServerStatistics', component: StatisticsView, props: { admin: true } },
        {
          path: '',
          name: 'SettingsOverview',
          component: SettingsOverview
        },
        {
          name: 'AccountProfile',
          path: 'account',
          component: AccountProfile
        },
        {
          name: 'AccountPassword',
          path: 'account/password',
          component: AccountPassword
        },
        {
          name: 'AccountPreferences',
          path: 'account/preferences',
          component: AccountPreferences
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
          name: 'SettingsGroups',
          path: 'groups',
          component: GroupsSettings
        },
        {
          name: 'SignInSettings',
          path: 'sign-in',
          component: SignInSettings
        },
        {
          name: 'SeriesLibrary',
          path: 'libraries/series/:seriesId',
          component: () => import('@/components/settings/SeriesLibrary.vue'),
          meta: { permission: 'libraries.manage' }
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
          name: 'MetadataSettings',
          path: 'metadata',
          component: MetadataSettings
        },
        {
          name: 'ArtworkSettings',
          path: 'artwork',
          component: ArtworkSettings
        },
        {
          name: 'JellyfinSettings',
          path: 'jellyfin',
          component: JellyfinSettings
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

installCardTransitions(router)
installInPageLinks(router)

router.beforeEach(async (to) => {
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

  // Settings pages the user's group does not allow lead to the first page it
  // does, which is always one of their own account pages.
  const permission = to.meta.permission || pagePermission(to.name)

  if (permission && hasToken) {
    const authStore = useAuthStore()

    await authStore.loadMe()

    if (!authStore.can(permission)) {
      return { name: visibleGroups(authStore.can)[0]?.items[0]?.name || 'AccountProfile', replace: true }
    }
  }

  return true
})

// A route with its own title always sets it (a new search names its query).
// Otherwise the title is only reset when the page itself changes, so a query
// change inside a detail page keeps the name that page gave its tab.
router.afterEach((to, from) => {
  const title = routeTitle(to)

  if (title || pageKey(to) !== pageKey(from)) document.title = formatTitle(title)
  rememberTitle(to.fullPath, title)
})

export default router
