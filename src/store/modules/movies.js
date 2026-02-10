import * as types from '../mutation-types'
import oblectoClient from '@/oblectoClient'
import Vue from 'vue'
import {
  createDefaultBrowseState,
  createBrowseActions,
  createBrowseMutations
} from './browseState'

const createMoviesBrowseState = () => createDefaultBrowseState()

const state = {
  lists: {},
  sets: {},
  browse: createMoviesBrowseState()
}

const getters = {

}

const browseMutationTypes = {
  SET_FILTERS: types.SET_MOVIES_BROWSE_FILTERS,
  SET_LOADING: types.SET_MOVIES_BROWSE_LOADING,
  SET_ERROR: types.SET_MOVIES_BROWSE_ERROR,
  RECEIVE: types.RECEIVE_MOVIES_BROWSE,
  RESET: types.RESET_MOVIES_BROWSE
}

const actions = {
  async getMovies ({ commit }, { sort, order }) {
    let movies = await oblectoClient.movieLibrary.getList(sort, order, 100, 0)

    commit(types.RECEIVE_MOVIES, { movies, sort })
  },
  async getMovieSets ({ commit }) {
    let sets = await oblectoClient.movieLibrary.getSets()

    commit(types.RECEIVE_MOVIES_SETS, sets)
  },
  ...createBrowseActions({
    types: browseMutationTypes,
    browseRequest: (params) => oblectoClient.movieLibrary.browse(params),
    fallbackErrorMessage: 'Failed to load movies'
  })
}

const mutations = {
  [types.RECEIVE_MOVIES] (state, { movies, sort }) {
    Vue.set(state.lists, sort, movies)
  },
  [types.RECEIVE_MOVIES_SETS] (state, sets) {
    state.sets = sets
  },
  ...createBrowseMutations({
    types: browseMutationTypes,
    createState: createMoviesBrowseState
  })
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
