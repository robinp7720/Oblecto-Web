import * as types from '../mutation-types'
import Vue from 'vue'

const state = {
  lists: {},
  sets: {}
}

const getters = {

}

const actions = {
  async getMovies ({ commit, state }, { sort, order }) {
    let { data: movies } = await Vue.axios.get(`/movies/list/${sort}/${order}`)

    commit(types.RECEIVE_MOVIES, { movies, sort })
  },
  async getMovieSets ({ commit, state }) {
    let { data: sets } = await Vue.axios.get(`/movies/sets`)

    commit(types.RECEIVE_MOVIES_SETS, sets)
  }
}

const mutations = {
  [types.RECEIVE_MOVIES] (state, { movies, sort }) {
    state.lists[sort] = movies
  },
  [types.RECEIVE_MOVIES_SETS] (state, sets) {
    state.sets = sets
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
