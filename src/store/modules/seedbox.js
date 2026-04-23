import * as types from '../mutation-types'

const state = {
  imports: {}
}

const getters = {
  activeImports: state => Object.values(state.imports)
}

const actions = {
  processSocketEvent ({ commit }, payload) {
    if (payload.event === 'import_success') {
      commit(types.REMOVE_SEEDBOX_IMPORT, payload.origin)
    } else {
      commit(types.UPDATE_SEEDBOX_IMPORT, payload)
    }
  },
  clearImport ({ commit }, origin) {
    commit(types.REMOVE_SEEDBOX_IMPORT, origin)
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
