import { defineStore } from 'pinia'

export const useSeedboxStore = defineStore('seedbox', {
  state: () => ({ imports: {}, history: [] }),
  getters: {
    activeImports: state => Object.values(state.imports),
    importHistory: state => state.history
  },
  actions: {
    processSocketEvent (payload) {
      if (payload.event === 'import_success' || payload.event === 'import_error') {
        delete this.imports[payload.origin]
        this.history = [{ ...payload, finishedAt: Date.now() }, ...this.history].slice(0, 20)
      } else this.imports[payload.origin] = payload
    },
    clearImport (origin) { delete this.imports[origin] },
    clearImportHistory () { this.history = [] }
  }
})
