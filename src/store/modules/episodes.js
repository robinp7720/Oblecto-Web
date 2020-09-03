import * as types from '../mutation-types'
import oblectoClient from '@/oblectoClient'

const state = {
  lists: {}
}

const getters = {

}

const actions = {
  async getEpisodes ({ commit, state }, { sort, order }) {
    let episodes = await oblectoClient.episodeLibrary.getList(sort, order, 100, 0)

    commit(types.RECEIVE_EPISODES, { episodes, sort })
  }
}

const mutations = {
  [types.RECEIVE_EPISODES] (state, { episodes, sort }) {
    state.lists[sort] = episodes
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
