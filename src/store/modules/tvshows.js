import * as types from '../mutation-types'
import Vue from 'vue'

const state = {

}

const getters = {

}

const actions = {
  async getTVShows ({commit, state}, {sort, order}) {
    let { data: shows } = await Vue.axios.get(`/shows/list/${sort}/${order}`)

    commit(types.RECEIVE_SHOWS, {shows, sort})
  }
}

const mutations = {
  [types.RECEIVE_SHOWS] (state, {shows, sort}) {
    console.log(shows, sort)
    state[sort] = shows
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
