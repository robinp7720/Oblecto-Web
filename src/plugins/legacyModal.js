import { computed, h, reactive, Teleport } from 'vue'

const modalState = reactive({
  activeName: null,
  params: {}
})

const modalRegistry = new Map()

export function createLegacyModalPlugin () {
  const modalApi = {
    show (name, params = {}) {
      modalState.activeName = name
      modalState.params = params
      const handlers = modalRegistry.get(name)
      if (handlers && typeof handlers.beforeOpen === 'function') {
        handlers.beforeOpen({ params })
      }
      if (handlers && typeof handlers.opened === 'function') {
        queueMicrotask(() => handlers.opened({ params }))
      }
    },
    hide (name) {
      if (!name || modalState.activeName === name) {
        modalState.activeName = null
        modalState.params = {}
      }
    }
  }

  const LegacyModal = {
    name: 'LegacyModal',
    inheritAttrs: false,
    props: {
      name: {
        type: String,
        required: true
      }
    },
    emits: ['before-open', 'opened'],
    setup (props, { attrs, emit, slots }) {
      modalRegistry.set(props.name, {
        beforeOpen: payload => emit('before-open', payload),
        opened: payload => emit('opened', payload)
      })

      const isVisible = computed(() => modalState.activeName === props.name)

      return () => {
        if (!isVisible.value) {
          return null
        }

        return h(Teleport, { to: 'body' }, [
          h('div', {
            class: 'legacy-modal-overlay',
            onClick: () => modalApi.hide(props.name)
          }),
          h('div', {
            class: 'legacy-modal-shell'
          }, [
            h('div', {
              class: 'legacy-modal-box',
              style: attrs.width ? { width: attrs.width } : undefined,
              onClick: event => event.stopPropagation()
            }, slots.default ? slots.default({ params: modalState.params }) : [])
          ])
        ])
      }
    }
  }

  return {
    install (app) {
      app.component('modal', LegacyModal)
      app.config.globalProperties.$modal = modalApi
      app.provide('legacyModal', modalApi)
    }
  }
}
