/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import oblectoClient from '@/oblectoClient';
import * as types from '../mutation-types';

const state = {
  lists: {},
};

const getters = {

};

const actions = {
  async getSeries({ commit }, { sort, order }) {
    const shows = await oblectoClient.seriesLibrary.getList(sort, order, 100, 0);

    commit(types.RECEIVE_SHOWS, { shows, sort });
  },
};

const mutations = {
  [types.RECEIVE_SHOWS](state, { shows, sort }) {
    state.lists[sort] = shows;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
