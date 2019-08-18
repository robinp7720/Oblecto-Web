import * as types from '../mutation-types'
import Vue from 'vue'

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
    let { data: movies } = await Vue.axios.get(`/sources/movies`)

    commit(types.RECIEVE_LIBRARIES_MOVIES, movies)
  },
  async updateTVShows ({ commit }) {
    let { data: shows } = await Vue.axios.get(`/sources/tvshows`)

    commit(types.RECIEVE_LIBRARIES_SHOWS, shows)
  },
  async deleteMovieLibrary ({ dispatch }, path) {
    await Vue.axios.delete(`/sources/movies`, {
      data: {
        path
      }
    })

    dispatch('updateAll')
  },
  async deleteSeriesLibrary ({ dispatch }, path) {
    await Vue.axios.delete(`/sources/tvshows`, {
      data: {
        path
      }
    })

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
