import Vue from 'vue'
import Vuex from 'vuex'
import VueSocketio from 'vue-socket.io'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    host: null,
    shows: {},
    watching: []
  },
  mutations: {
    storeShows: function (state, search) {
      Vue.set(state, 'shows', search)
    },
    saveWatching: function (state, watching) {
      Vue.set(state, 'watching', watching)
    },
    updateHost: function (state, host) {
      Vue.set(state, 'host', host)

      // Update sockets and axios http urls
      Vue.use(VueSocketio, host)
      Vue.axios.defaults.baseURL = host
    }
  },
  actions: {
    search: function (state, query) {
      // Clear the list first
      Vue.axios.get(`/search/` + query)
        .then(response => {
          // JSON responses are automatically parsed.
          state.commit('storeShows', response.data)
        })
        .catch(e => {})
    },
    updateWatching: function (state) {
      Vue.axios.get(`/shows/recent`)
        .then(response => {
          // JSON responses are automatically parsed.
          state.commit('saveWatching', response.data)
        })
        .catch(e => {})
    },
    updateHost: function (state, host) {
      state.commit('updateHost', host)
    }
  }
})
