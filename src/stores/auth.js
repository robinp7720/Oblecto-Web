import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import { useSearchStore } from '@/stores/search'
import { useLibrariesStore } from '@/stores/libraries'
import { useSeedboxStore } from '@/stores/seedbox'
import { disconnectSocket } from '@/socket'
import { applyLocale } from '@/i18n'

const TOKEN_KEY = 'oblecto.accessToken'
const HOST_KEY = 'oblecto.host'

export function getStoredToken () {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(TOKEN_KEY) || ''
}

export function getStoredHost () {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(HOST_KEY) || ''
}

// Used when the server predates /api/v1/me.
const DEFAULT_PREFERENCES = {
  language: null,
  audioLanguage: null,
  subtitleLanguage: null,
  subtitleMode: 'auto',
  quality: 'original',
  autoplayNext: true
}

let loadingMe = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ready: false,
    authenticated: false,
    loggingIn: false,
    username: null,
    // The signed-in account from /api/v1/me: profile, group, permissions and
    // preferences. null until loaded.
    me: null,
    // The server has no /api/v1/me (older than groups), so nothing is gated.
    legacyServer: false
  }),
  getters: {
    isAuthenticated: state => state.authenticated,
    displayName: state => state.me?.name || state.me?.username || state.username,
    preferences: state => ({ ...DEFAULT_PREFERENCES, ...state.me?.preferences }),
    // Whether the signed-in user may do what `permission` guards. The server
    // enforces it too; this only decides what to show.
    can: state => permission => state.legacyServer || Boolean(state.me?.permissions?.includes(permission)),
    canAny: state => permissions => state.legacyServer || permissions.some(permission => state.me?.permissions?.includes(permission))
  },
  actions: {
    hydrate () {
      const storedHost = getStoredHost()
      if (storedHost) {
        useAppStore().updateHost(storedHost)
      }

      const token = getStoredToken()
      this.authenticated = Boolean(token)
      if (token) {
        oblectoClient.accessToken = token
        oblectoClient.axios.defaults.headers.common.Authorization = `bearer ${token}`
        void this.loadMe()
      }

      this.ready = true
    },
    /**
     * Fetches the signed-in account, once; later calls share the request.
     * Pass `force` to refetch after something changed server-side.
     */
    loadMe (force = false) {
      if (!oblectoClient.accessToken) return Promise.resolve(null)
      if (this.me && !force) return Promise.resolve(this.me)
      if (loadingMe && !force) return loadingMe

      const token = oblectoClient.accessToken
      const request = oblectoClient.account.get()
        .then(me => {
          if (token !== oblectoClient.accessToken) return null
          // Anything but an account means a server without this endpoint.
          if (!me || typeof me !== 'object' || Array.isArray(me)) {
            this.legacyServer = true
            return null
          }

          this.setMe(me)
          return me
        })
        .catch(error => {
          if (token !== oblectoClient.accessToken) return null
          if (error?.response?.status === 404) this.legacyServer = true

          return null
        })
        .finally(() => {
          if (loadingMe === request) loadingMe = null
        })

      loadingMe = request

      return request
    },
    setMe (me) {
      this.me = me
      this.legacyServer = false
      if (me?.username) this.username = me.username
      applyLocale(me?.preferences?.language)
    },
    // `credentials` is `{ username, password }`, or `{ userId, password? }`
    // from the profile picker, where the password may be skipped on the
    // local network.
    async login (credentials, displayName = credentials.username) {
      this.loggingIn = true

      try {
        await oblectoClient.authenticate(credentials)
        this.authenticated = Boolean(oblectoClient.accessToken)
        this.username = displayName || null

        window.localStorage.setItem(TOKEN_KEY, oblectoClient.accessToken)
        window.localStorage.setItem(HOST_KEY, useAppStore().host || oblectoClient.axios.defaults.baseURL || '')

        this.me = null
        await this.loadMe(true)
      } finally {
        this.loggingIn = false
      }
    },
    async logout () {
      disconnectSocket()
      this.authenticated = false
      window.localStorage.removeItem(TOKEN_KEY)
      this.username = null
      this.me = null
      this.legacyServer = false
      loadingMe = null
      oblectoClient.accessToken = ''
      delete oblectoClient.axios.defaults.headers.common.Authorization
      useAppStore().clearPlaying()
      useMediaStore().reset()
      useSearchStore().reset()
      useLibrariesStore().reset()
      useSeedboxStore().$reset()
    }
  }
})
