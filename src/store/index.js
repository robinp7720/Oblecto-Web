import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

let host = 'http://localhost:8080'

export default new Vuex.Store({
  state: {
    shows: {},
    watching: []
  },
  mutations: {
    storeShows: function (state, search) {
      Vue.set(state, 'shows', search)
    },
    saveWatching: function (state, watching) {
      Vue.set(state, 'watching', watching)
    }
  },
  actions: {
    search: function (state, query) {
      // Clear the list first
      axios.get(host + `/search/` + query)
        .then(response => {
          // JSON responses are automatically parsed.
          state.commit('storeShows', response.data)
        })
        .catch(e => {})
    },
    updateWatching: function (state) {
      axios.get(host + `/shows/recent`)
        .then(response => {
          // JSON responses are automatically parsed.
          state.commit('saveWatching', response.data)
        })
        .catch(e => {})
    }
  }
})
