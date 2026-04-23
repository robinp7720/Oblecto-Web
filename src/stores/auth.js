import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'
import legacyStore from '@/store'

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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ready: false,
    loggingIn: false,
    username: null
  }),
  getters: {
    isAuthenticated: () => Boolean(oblectoClient.accessToken)
  },
  actions: {
    hydrate () {
      const storedHost = getStoredHost()
      if (storedHost) {
        legacyStore.dispatch('updateHost', storedHost)
      }

      const token = getStoredToken()
      if (token) {
        oblectoClient.accessToken = token
        oblectoClient.axios.defaults.headers.common.Authorization = `bearer ${token}`
      }

      this.ready = true
    },
    async login ({ username, password }) {
      this.loggingIn = true

      try {
        await oblectoClient.authenticate(username, password)
        this.username = username

        window.localStorage.setItem(TOKEN_KEY, oblectoClient.accessToken)
        window.localStorage.setItem(HOST_KEY, legacyStore.state.host || oblectoClient.axios.defaults.baseURL || '')

        await legacyStore.dispatch('updateAll')
      } finally {
        this.loggingIn = false
      }
    },
    async logout () {
      window.localStorage.removeItem(TOKEN_KEY)
      this.username = null
      await legacyStore.dispatch('logout')
    }
  }
})
