import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import legacyStore from './store'
import oblectoClient from '@/oblectoClient'
import { initSocket, reconnectSocket } from '@/socket'
import { createNotificationsPlugin } from '@/plugins/notifications'
import { createLegacyModalPlugin } from '@/plugins/legacyModal'
import Tabs from '@/components/system/Tabs.vue'
import Tab from '@/components/system/Tab.vue'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

const notifications = createNotificationsPlugin()
const legacyModal = createLegacyModalPlugin()

legacyStore.dispatch('updateHost', oblectoClient.axios.defaults.baseURL)

app.use(pinia)
app.use(legacyStore)
app.use(router)
app.use(notifications)
app.use(legacyModal)
app.component('Tabs', Tabs)
app.component('Tab', Tab)

const authStore = useAuthStore(pinia)
authStore.hydrate()

initSocket({
  app,
  store: legacyStore,
  notify: notifications.notify
})

app.config.globalProperties.$reconnectSocket = (host) => reconnectSocket({
  app,
  store: legacyStore,
  notify: notifications.notify
}, host)

app.mount('#app')
