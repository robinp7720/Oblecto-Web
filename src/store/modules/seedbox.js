import * as types from '../mutation-types'
import Vue from 'vue'

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
    Vue.set(state.imports, payload.origin, payload)
  },
  [types.REMOVE_SEEDBOX_IMPORT] (state, origin) {
    Vue.delete(state.imports, origin)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
