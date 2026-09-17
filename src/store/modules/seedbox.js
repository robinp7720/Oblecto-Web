import * as types from '../mutation-types'

// Finished imports used to be dropped on the floor and announced with a toast.
// With the toasts gone they are kept here instead, so Settings → Seedboxes can
// show what completed (or failed) during this session.
const HISTORY_LIMIT = 20

const state = {
  imports: {},
  history: []
}

const getters = {
  activeImports: state => Object.values(state.imports),
  importHistory: state => state.history
}

const actions = {
  processSocketEvent ({ commit }, payload) {
    if (payload.event === 'import_success' || payload.event === 'import_error') {
      commit(types.FINISH_SEEDBOX_IMPORT, payload)
      return
    }

    commit(types.UPDATE_SEEDBOX_IMPORT, payload)
  },
  clearImport ({ commit }, origin) {
    commit(types.REMOVE_SEEDBOX_IMPORT, origin)
  },
  clearImportHistory ({ commit }) {
    commit(types.CLEAR_SEEDBOX_HISTORY)
  }
}

const mutations = {
  [types.UPDATE_SEEDBOX_IMPORT] (state, payload) {
    state.imports = {
      ...state.imports,
      [payload.origin]: payload
    }
  },
  [types.REMOVE_SEEDBOX_IMPORT] (state, origin) {
    const nextImports = { ...state.imports }
    delete nextImports[origin]
    state.imports = nextImports
  },
  [types.FINISH_SEEDBOX_IMPORT] (state, payload) {
    const nextImports = { ...state.imports }
    delete nextImports[payload.origin]
    state.imports = nextImports

    state.history = [
      { ...payload, finishedAt: Date.now() },
      ...state.history
    ].slice(0, HISTORY_LIMIT)
  },
  [types.CLEAR_SEEDBOX_HISTORY] (state) {
    state.history = []
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
