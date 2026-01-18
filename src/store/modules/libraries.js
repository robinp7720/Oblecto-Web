import * as types from '../mutation-types'
import oblectoClient from '@/oblectoClient'

const state = {
  shows: [],
  movies: []
}

const getters = {

}

const actions = {
  async updateAll ({ dispatch }) {
    dispatch('updateMovies')
    dispatch('updateTVShows')
  },
  async updateMovies ({ commit }) {
    let movies = await oblectoClient.libraries.getLibraryPaths('movies')

    commit(types.RECIEVE_LIBRARIES_MOVIES, movies)
  },
  async updateTVShows ({ commit }) {
    let shows = await oblectoClient.libraries.getLibraryPaths('tvshows')

    commit(types.RECIEVE_LIBRARIES_SHOWS, shows)
  },
  async deleteMovieLibrary ({ dispatch }, path) {
    await oblectoClient.libraries.removePath('movies', path)

    dispatch('updateAll')
  },
  async deleteSeriesLibrary ({ dispatch }, path) {
    await oblectoClient.libraries.removePath('tvshows', path)

    dispatch('updateAll')
  }
}

const mutations = {
  [types.RECIEVE_LIBRARIES_MOVIES] (state, movies) {
    state.movies = movies
  },
  [types.RECIEVE_LIBRARIES_SHOWS] (state, shows) {
    state.shows = shows
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
