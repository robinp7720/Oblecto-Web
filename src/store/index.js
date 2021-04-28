import Vue from 'vue'
import Vuex from 'vuex'
import movies from './modules/movies'
import series from './modules/series'
import episodes from './modules/episodes'
import libraries from '@/store/modules/libraries'

import VueSocketio from 'vue-socket.io'
import oblectoClient from '@/oblectoClient'
import router from '@/router'
import { ScreenFormats } from '@/enums/ScreenFormats'

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
    },
    autoplay: true,
    playSizeFormat: ScreenFormats.SMALL,
    playbackRemote: 'local'
  },
  modules: {
    movies,
    series,
    episodes,
    libraries
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
    setPlaying: function (state, playing) {
      Vue.set(state, 'playing', playing)
    },
    updateHost: function (state, host) {
      Vue.set(state, 'host', host)
    },
    initialLoaded: function (state, initialLoaded) {
      Vue.set(state, 'initialLoaded', initialLoaded)
    },
    setPlaybackRemote: function (state, remote) {
      Vue.set(state, 'playbackRemote', remote)
    },
    setPlaySizeFormat: function (state, size) {
      Vue.set(state, 'playSizeFormat', size)
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
      await dispatch('series/getSeries', { sort: 'createdAt', order: 'DESC' })
      await dispatch('series/getSeries', { sort: 'siteRating', order: 'DESC' })
      await dispatch('series/getSeries', { sort: 'siteRatingCount', order: 'DESC' })

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

      oblectoClient.accessToken = ''

      router.push({ name: 'login' })
    },
    updateWatching: async function ({ commit, dispatch }) {
      let { data: episodes } = await Vue.axios.get(`/episodes/watching`)
      let { data: movies } = await Vue.axios.get(`/movies/watching`)

      try {
        await dispatch('updateNext')
      } catch (e) {
        console.log(e)
      }

      commit('saveWatchingEpisodes', episodes)
      commit('saveWatchingMovies', movies)
    },
    updateNext: async function (state) {
      let { data: nextEpisodes } = await Vue.axios.get(`/episodes/next`)
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
    playEpisodeLocal: async function ({ commit, dispatch }, id) {
      await dispatch('clearPlaying')

      let { data: episode } = await Vue.axios.get(`/episode/${id}/info`)

      commit('setPlaying', {
        title: episode.episodeName,
        type: 'episode',
        entity: episode
      })
    },
    playEpisode: async function ({ state, commit, dispatch }, id) {
      if (state.playbackRemote !== 'local') {
        await Vue.axios.post(`/client/${state.playbackRemote}/playback`, {
          id,
          clientId: state.playbackRemote,
          type: 'episode'
        })
        return
      }

      await dispatch('playEpisodeLocal', id)
    },
    playMovieLocal: async function ({ commit, dispatch }, id) {
      await dispatch('clearPlaying')

      let { data: movie } = await Vue.axios.get(`/movie/${id}/info`)

      commit('setPlaying', {
        title: movie.movieName,
        type: 'movie',
        entity: movie
      })
    },
    playMovie: async function ({ state, commit, dispatch }, id) {
      if (state.playbackRemote !== 'local') {
        await Vue.axios.post(`/client/${state.playbackRemote}/playback`, {
          id,
          clientId: state.playbackRemote,
          type: 'movie'
        })
        return
      }

      await dispatch('playMovieLocal', id)
    }
  }
})
