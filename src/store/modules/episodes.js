import * as types from '../mutation-types'
import Vue from 'vue'

const state = {

}

const getters = {

}

const actions = {
  async getEpisodes ({ commit, state }, { sort, order }) {
    let { data: episodes } = await Vue.axios.get(`/episodes/list/${sort}/${order}`)

    commit(types.RECEIVE_EPISODES, { episodes, sort })
  }
}

const mutations = {
  [types.RECEIVE_EPISODES] (state, { episodes, sort }) {
    state[sort] = episodes
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
