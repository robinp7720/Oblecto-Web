import * as types from '../mutation-types'
import oblectoClient from '@/oblectoClient'

const state = {
  lists: {},
  sets: {}
}

const getters = {

}

const actions = {
  async getMovies ({ commit, state }, { sort, order }) {
    let movies = await oblectoClient.movieLibrary.getList(sort, order, 100, 0)

    commit(types.RECEIVE_MOVIES, { movies, sort })
  },
  async getMovieSets ({ commit, state }) {
    let { data: sets } = await oblectoClient.movieLibrary.getSets()

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
