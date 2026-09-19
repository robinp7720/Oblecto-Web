import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import legacyStore from './store'
import oblectoClient from '@/oblectoClient'
import { initSocket, reconnectSocket } from '@/socket'
import Tabs from '@/components/system/Tabs.vue'
import Tab from '@/components/system/Tab.vue'
import { useAuthStore } from '@/stores/auth'
import { applyLocale, i18n } from '@/i18n'

// Loaded once for the whole app. Every settings component used to `@use` this
// from inside its own scoped block, which shipped a dozen copies of it.
import '@/assets/sass/settings.sass'
import '@/assets/sass/motion.sass'

const app = createApp(App)
const pinia = createPinia()

legacyStore.dispatch('updateHost', oblectoClient.axios.defaults.baseURL)

app.use(pinia)
app.use(legacyStore)
app.use(router)
app.use(i18n)
app.component('Tabs', Tabs)
app.component('Tab', Tab)

// The browser's language until the account's own preference arrives.
applyLocale(null)

const authStore = useAuthStore(pinia)
authStore.hydrate()

// The server rejects a token once it expires, the password changes or the
// account is removed. Sign out and ask again instead of leaving every page
// failing. Only while signed in: a wrong password at login is also a 401.
oblectoClient.axios.interceptors.response.use(undefined, async error => {
  if (error?.response?.status === 401 && oblectoClient.accessToken) {
    const current = router.currentRoute.value

    app.config.globalProperties.$socket?.disconnect()
    await authStore.logout()

    if (current.name !== 'login') {
      router.replace({ name: 'login', query: { redirect: current.fullPath, expired: '1' } })
    }
  }

  return Promise.reject(error)
})

initSocket({ app, store: legacyStore })

app.config.globalProperties.$reconnectSocket = (host) => reconnectSocket({
  app,
  store: legacyStore
}, host)

app.mount('#app')
