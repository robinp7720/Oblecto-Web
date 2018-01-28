import * as types from '../mutation-types'
import Vue from 'vue'

const state = {

}

const getters = {

}

const actions = {
  async getMovies ({commit, state}, {sort, order}) {
    let { data: movies } = await Vue.axios.get(`/movies/list/${sort}/${order}`)

    commit(types.RECEIVE_MOVIES, {movies, sort})
  }
}

const mutations = {
  [types.RECEIVE_MOVIES] (state, {movies, sort}) {
    console.log(movies, sort)
    state[sort] = movies
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
