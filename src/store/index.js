import Vue from 'vue';
import Vuex from 'vuex';
import libraries from '@/store/modules/libraries';

import VueSocketio from 'vue-socket.io';
import oblectoClient from '@/oblectoClient';
import router from '@/router';
import { ScreenFormats } from '@/enums/ScreenFormats';
import episodes from './modules/episodes';
import series from './modules/series';
import movies from './modules/movies';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    host: null,
    initialLoaded: false,
    shows: {},
    watchingEpisodes: [],
    watchingMovies: [],
    nextEpisodes: [],
    playing: {
      title: '',
    },
    autoplay: true,
    playSizeFormat: ScreenFormats.SMALL,
    playbackRemote: 'local',
  },
  modules: {
    movies,
    series,
    episodes,
    libraries,
  },
  mutations: {
    saveWatchingEpisodes(state, watching) {
      Vue.set(state, 'watchingEpisodes', watching);
    },
    saveNextEpisodes(state, next) {
      Vue.set(state, 'nextEpisodes', next);
    },
    saveWatchingMovies(state, watching) {
      Vue.set(state, 'watchingMovies', watching);
    },
    setPlaying(state, playing) {
      Vue.set(state, 'playing', playing);
    },
    updateHost(state, host) {
      Vue.set(state, 'host', host);
    },
    initialLoaded(state, initialLoaded) {
      Vue.set(state, 'initialLoaded', initialLoaded);
    },
    setPlaybackRemote(state, remote) {
      Vue.set(state, 'playbackRemote', remote);
    },
    setPlaySizeFormat(state, size) {
      Vue.set(state, 'playSizeFormat', size);
    },
  },
  actions: {
    updateAll: async ({ commit, dispatch }) => {
      // Update all movies in vuex storage
      await dispatch('movies/getMovies', { sort: 'createdAt', order: 'DESC' });
      await dispatch('movies/getMovies', { sort: 'popularity', order: 'DESC' });
      await dispatch('movies/getMovies', { sort: 'releaseDate', order: 'DESC' });
      await dispatch('movies/getMovieSets');

      // Update all tv shows in vuex storage
      await dispatch('series/getSeries', { sort: 'createdAt', order: 'DESC' });
      await dispatch('series/getSeries', { sort: 'siteRating', order: 'DESC' });
      await dispatch('series/getSeries', { sort: 'siteRatingCount', order: 'DESC' });

      // Update all episodes in vuex storage
      await dispatch('episodes/getEpisodes', { sort: 'firstAired', order: 'DESC' });
      await dispatch('episodes/getEpisodes', { sort: 'createdAt', order: 'DESC' });

      await dispatch('updateWatching');

      commit('initialLoaded', true);
    },
    logout(state) {
      state.commit('saveWatchingEpisodes', []);
      state.dispatch('clearPlaying');
      state.commit('initialLoaded', false);

      oblectoClient.accessToken = '';

      router.push({ name: 'login' });
    },
    async updateWatching({ commit, dispatch }) {
      const { data: episodes } = await Vue.axios.get('/episodes/watching');
      const { data: movies } = await Vue.axios.get('/movies/watching');

      try {
        await dispatch('updateNext');
      } catch (e) {
        console.log(e);
      }

      commit('saveWatchingEpisodes', episodes);
      commit('saveWatchingMovies', movies);
    },
    async updateNext(state) {
      const { data: nextEpisodes } = await Vue.axios.get('/episodes/next');
      state.commit('saveNextEpisodes', nextEpisodes);
    },
    updateHost(state, host) {
      state.commit('updateHost', host);

      // Update sockets and axios http urls
      Vue.use(VueSocketio, host);
      Vue.axios.defaults.baseURL = host;
    },
    clearPlaying(state) {
      state.commit('setPlaying', {});
    },
    async playEpisodeLocal({ commit, dispatch }, id) {
      await dispatch('clearPlaying');

      const { data: episode } = await Vue.axios.get(`/episode/${id}/info`);

      commit('setPlaying', {
        title: episode.episodeName,
        type: 'episode',
        entity: episode,
      });
    },
    async playEpisode({ state, commit, dispatch }, id) {
      if (state.playbackRemote !== 'local') {
        await Vue.axios.post(`/client/${state.playbackRemote}/playback`, {
          id,
          clientId: state.playbackRemote,
          type: 'episode',
        });
        return;
      }

      await dispatch('playEpisodeLocal', id);
    },
    async playMovieLocal({ commit, dispatch }, id) {
      await dispatch('clearPlaying');

      const { data: movie } = await Vue.axios.get(`/movie/${id}/info`);

      commit('setPlaying', {
        title: movie.movieName,
        type: 'movie',
        entity: movie,
      });
    },
    async playMovie({ state, commit, dispatch }, id) {
      if (state.playbackRemote !== 'local') {
        await Vue.axios.post(`/client/${state.playbackRemote}/playback`, {
          id,
          clientId: state.playbackRemote,
          type: 'movie',
        });
        return;
      }

      await dispatch('playMovieLocal', id);
    },
  },
});
