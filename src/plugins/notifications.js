import { reactive } from 'vue'

const state = reactive({
  items: []
})

let nextId = 1

export function createNotificationsPlugin () {
  function notify (payload) {
    const item = {
      id: nextId++,
      type: payload.type || 'info',
      title: payload.title || '',
      text: payload.text || ''
    }

    state.items.push(item)

    window.setTimeout(() => {
      const index = state.items.findIndex(entry => entry.id === item.id)
      if (index !== -1) {
        state.items.splice(index, 1)
      }
    }, 4200)
  }

  return {
    install (app) {
      app.config.globalProperties.$notify = notify
      app.provide('notify', notify)
      app.provide('notificationsState', state)
    },
    notify,
    state
  }
}
