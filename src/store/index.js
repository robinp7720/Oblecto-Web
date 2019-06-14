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
    initialLoaded: false,
    shows: {},
    watchingEpisodes: [],
    watchingMovies: [],
    nextEpisodes: [],
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
    saveWatchingEpisodes: function (state, watching) {
      Vue.set(state, 'watchingEpisodes', watching)
    },
    saveNextEpisodes: function (state, next) {
      Vue.set(state, 'nextEpisodes', next)
    },
    saveWatchingMovies: function (state, watching) {
      Vue.set(state, 'watchingMovies', watching)
    },
    setPlaying: function (state, watching) {
      Vue.set(state, 'playing', watching)
    },
    updateHost: function (state, host) {
      Vue.set(state, 'host', host)
    },
    initialLoaded: function (state, initialLoaded) {
      Vue.set(state, 'initialLoaded', initialLoaded)
    }
  },
  actions: {
    updateAll: async ({ commit, dispatch }) => {
      // Update all movies in vuex storage
      await dispatch('movies/getMovies', { sort: 'createdAt', order: 'DESC' })
      await dispatch('movies/getMovies', { sort: 'popularity', order: 'DESC' })
      await dispatch('movies/getMovies', { sort: 'releaseDate', order: 'DESC' })
      await dispatch('movies/getMovieSets')

      // Update all tv shows in vuex storage
      await dispatch('tvshows/getTVShows', { sort: 'createdAt', order: 'DESC' })
      await dispatch('tvshows/getTVShows', { sort: 'siteRating', order: 'DESC' })
      await dispatch('tvshows/getTVShows', { sort: 'siteRatingCount', order: 'DESC' })

      // Update all episodes in vuex storage
      await dispatch('episodes/getEpisodes', { sort: 'firstAired', order: 'DESC' })
      await dispatch('episodes/getEpisodes', { sort: 'createdAt', order: 'DESC' })

      await dispatch('updateWatching')

      commit('initialLoaded', true)
    },
    logout: function (state) {
      state.commit('saveWatchingEpisodes', [])
      state.dispatch('clearPlaying')
      state.commit('initialLoaded', false)
    },
    updateWatching: async function (state) {
      let { data: episodes } = await Vue.axios.get(`/episodes/watching`)
      let { data: movies } = await Vue.axios.get(`/movies/watching`)
      let { data: nextEpisodes } = await Vue.axios.get(`/episodes/next`)

      state.commit('saveWatchingEpisodes', episodes)
      state.commit('saveWatchingMovies', movies)
      state.commit('saveNextEpisodes', nextEpisodes)
    },
    updateHost: function (state, host) {
      state.commit('updateHost', host)

      // Update sockets and axios http urls
      Vue.use(VueSocketio, host)
      Vue.axios.defaults.baseURL = host
    },
    clearPlaying: function (state) {
      state.commit('setPlaying', {})
    },
    playEpisode: async function (state, id) {
      let { data: episode } = await Vue.axios.get(`/episode/${id}/info`)

      state.commit('setPlaying', {
        title: episode.episodeName,
        type: 'episode',
        entity: episode
      })
    },
    playMovie: async function (state, id) {
      let { data: movie } = await Vue.axios.get(`/movie/${id}/info`)

      state.commit('setPlaying', {
        title: movie.movieName,
        type: 'movie',
        entity: movie
      })
    }
  }
})
