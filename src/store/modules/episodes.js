/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import oblectoClient from '@/oblectoClient';
import * as types from '../mutation-types';

const state = {
  lists: {},
};

const getters = {

};

const actions = {
  async getEpisodes({ commit }, { sort, order }) {
    const episodes = await oblectoClient.episodeLibrary.getList(sort, order, 100, 0);

    commit(types.RECEIVE_EPISODES, { episodes, sort });
  },
};

const mutations = {
  [types.RECEIVE_EPISODES](state, { episodes, sort }) {
    state.lists[sort] = episodes;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
