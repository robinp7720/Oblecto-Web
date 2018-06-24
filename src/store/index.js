import Vue from 'vue'
import Vuex from 'vuex'
import movies from './modules/movies'
import tvshows from './modules/tvshows'
import episodes from './modules/episodes'
import VueSocketio from 'vue-socket.io'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    host: null,
    shows: {},
    watching: [],
    playing: {
      title: ''
    }
  },
  modules: {
    movies,
    tvshows,
    episodes
  },
  mutations: {
    storeShows: function (state, search) {
      Vue.set(state, 'shows', search)
    },
    saveWatching: function (state, watching) {
      Vue.set(state, 'watching', watching)
    },
    setPlaying: function (state, watching) {
      Vue.set(state, 'playing', watching)
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
    updateAll: ({dispatch}) => {
      // Update all movies in vuex storage
      dispatch('getMovies', {sort: 'createdAt', order: 'DESC'})
      dispatch('getMovies', {sort: 'popularity', order: 'DESC'})
      dispatch('getMovies', {sort: 'releaseDate', order: 'DESC'})

      // Update all tv shows in vuex storage
      dispatch('getTVShows', {sort: 'createdAt', order: 'DESC'})
      dispatch('getTVShows', {sort: 'siteRating', order: 'DESC'})
      dispatch('getTVShows', {sort: 'siteRatingCount', order: 'DESC'})

      // Update all episodes in vuex storage
      dispatch('getEpisodes', {sort: 'firstAired', order: 'DESC'})
      dispatch('getEpisodes', {sort: 'createdAt', order: 'DESC'})
    },
    updateWatching: function (state) {
      Vue.axios.get(`/watching`)
        .then(response => {
          // JSON responses are automatically parsed.
          state.commit('saveWatching', response.data)
        })
        .catch(e => {})
    },
    updateHost: function (state, host) {
      state.commit('updateHost', host)
    },
    playEpisode: function (state, episode) {
      state.commit('setPlaying', {
        title: episode.episodeName,
        type: 'episode',
        entity: episode
      })
    },
    playMovie: function (state, movie) {
      state.commit('setPlaying', {
        title: movie.movieName,
        type: 'movie',
        entity: movie
      })
    }
  }
})
