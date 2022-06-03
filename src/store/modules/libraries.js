/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { Axios } from 'axios';
import * as types from '../mutation-types';

const state = {
  shows: [],
  movies: [],
};

const getters = {

};

const actions = {
  async updateAll({ dispatch }) {
    dispatch('updateMovies');
    dispatch('updateTVShows');
  },
  async updateMovies({ commit }) {
    const { data: movies } = await Axios.get('/sources/movies');

    commit(types.RECIEVE_LIBRARIES_MOVIES, movies);
  },
  async updateTVShows({ commit }) {
    const { data: shows } = await Axios.get('/sources/tvshows');

    commit(types.RECIEVE_LIBRARIES_SHOWS, shows);
  },
  async deleteMovieLibrary({ dispatch }, path) {
    await Axios.delete('/sources/movies', {
      data: {
        path,
      },
    });

    dispatch('updateAll');
  },
  async deleteSeriesLibrary({ dispatch }, path) {
    await Axios.delete('/sources/tvshows', {
      data: {
        path,
      },
    });

    dispatch('updateAll');
  },
};

const mutations = {
  [types.RECIEVE_LIBRARIES_MOVIES](state, movies) {
    state.movies = movies;
  },
  [types.RECIEVE_LIBRARIES_SHOWS](state, shows) {
    state.shows = shows;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
