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
    },
    searchResults: {
      episodes: [],
      movies: [],
      shows: []
    }
  },
  modules: {
    movies,
    tvshows,
    episodes
  },
  mutations: {
    search: function (state, results) {
      Vue.set(state, 'searchResults', results)
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
    updateAll: ({ dispatch }) => {
      // Update all movies in vuex storage
      dispatch('getMovies', { sort: 'createdAt', order: 'DESC' })
      dispatch('getMovies', { sort: 'popularity', order: 'DESC' })
      dispatch('getMovies', { sort: 'releaseDate', order: 'DESC' })

      // Update all tv shows in vuex storage
      dispatch('getTVShows', { sort: 'createdAt', order: 'DESC' })
      dispatch('getTVShows', { sort: 'siteRating', order: 'DESC' })
      dispatch('getTVShows', { sort: 'siteRatingCount', order: 'DESC' })

      // Update all episodes in vuex storage
      dispatch('getEpisodes', { sort: 'firstAired', order: 'DESC' })
      dispatch('getEpisodes', { sort: 'createdAt', order: 'DESC' })
    },
    logout: function (state) {
      state.commit('saveWatching', [])
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
    clearPlaying: function (state) {
      state.commit('setPlaying', {})
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
    },
    search: async function (state, query) {
      // Clear the list first
      let { data: episodes } = await Vue.axios.get(`/episodes/search/` + query)
      let { data: movies } = await Vue.axios.get(`/movies/search/` + query)
      let { data: shows } = await Vue.axios.get(`/shows/search/` + query)

      state.commit('search', {
        movies,
        episodes,
        shows
      })
    }
  }
})
