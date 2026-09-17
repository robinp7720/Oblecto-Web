import { createStore } from 'vuex'
import movies from './modules/movies'
import series from './modules/series'
import episodes from './modules/episodes'
import libraries from '@/store/modules/libraries'
import seedbox from '@/store/modules/seedbox'

import oblectoClient from '@/oblectoClient'
import { ScreenFormats } from '@/enums/ScreenFormats'
import { remote, isRemote } from '@/remote/state'
import { sendCommand } from '@/remote/transport'

/**
 * Sends playback to the selected device, if there is one.
 *
 * A failed command falls back to playing here rather than doing nothing, which
 * is what the old implementation did whenever the remote hop broke.
 *
 * @param {string} kind - 'episode' or 'movie'.
 * @param {string|number} id - Media id.
 * @returns {Promise<boolean>} Whether the remote device took it.
 */
async function dispatchRemotePlay (kind, id) {
  if (!isRemote.value) return false

  const ack = await sendCommand(remote.targetDeviceId, {
    type: 'play',
    media: { kind, id: String(id) }
  })

  return ack.ok
}
export default createStore({
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
    playSizeFormat: ScreenFormats.SMALL
  },
  modules: {
    movies,
    series,
    episodes,
    libraries,
    seedbox
  },
  mutations: {
    saveWatchingEpisodes: function (state, watching) {
      state.watchingEpisodes = watching
    },
    saveNextEpisodes: function (state, next) {
      state.nextEpisodes = next
    },
    saveWatchingMovies: function (state, watching) {
      state.watchingMovies = watching
    },
    setPlaying: function (state, playing) {
      state.playing = playing
    },
    updateHost: function (state, host) {
      state.host = host
    },
    initialLoaded: function (state, initialLoaded) {
      state.initialLoaded = initialLoaded
    },
    setPlaySizeFormat: function (state, size) {
      state.playSizeFormat = size
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
      await dispatch('libraries/updateAll')

      await dispatch('updateWatching')

      commit('initialLoaded', true)
    },
    logout: function ({ commit, dispatch }) {
      commit('saveWatchingEpisodes', [])
      dispatch('clearPlaying')
      commit('initialLoaded', false)

      oblectoClient.accessToken = ''
      delete oblectoClient.axios.defaults.headers.common.Authorization
    },
    updateWatching: async function ({ commit, dispatch }) {
      let episodes = await oblectoClient.episodeLibrary.getWatching()
      let movies = await oblectoClient.movieLibrary.getWatching()

      try {
        await dispatch('updateNext')
      } catch (e) {
        console.log(e)
      }

      commit('saveWatchingEpisodes', episodes)
      commit('saveWatchingMovies', movies)
    },
    updateNext: async function (state) {
      let nextEpisodes = await oblectoClient.episodeLibrary.getNextUp()
      state.commit('saveNextEpisodes', nextEpisodes)
    },
    updateHost: function (state, host) {
      state.commit('updateHost', host)

      // Update axios http urls
      oblectoClient.axios.defaults.baseURL = host
    },
    clearPlaying: function (state) {
      state.commit('setPlaying', {})
    },
    playEpisodeLocal: async function ({ commit, dispatch }, id) {
      await dispatch('clearPlaying')

      let episode = await oblectoClient.episodeLibrary.getInfo(id)

      commit('setPlaying', {
        title: episode.episodeName,
        type: 'episode',
        entity: episode
      })
    },
    playEpisode: async function ({ dispatch }, id) {
      if (await dispatchRemotePlay('episode', id)) return

      await dispatch('playEpisodeLocal', id)
    },
    playMovieLocal: async function ({ commit, dispatch }, id) {
      await dispatch('clearPlaying')

      let movie = await oblectoClient.movieLibrary.getInfo(id)

      commit('setPlaying', {
        title: movie.movieName,
        type: 'movie',
        entity: movie
      })
    },
    playMovie: async function ({ dispatch }, id) {
      if (await dispatchRemotePlay('movie', id)) return

      await dispatch('playMovieLocal', id)
    }
  }
})
