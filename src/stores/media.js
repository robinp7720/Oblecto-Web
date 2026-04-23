import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'

function createLibraryState () {
  return {
    filters: {
      q: '',
      sort: 'createdAt',
      order: 'desc',
      watched: 'all',
      genre: [],
      libraryPath: '',
      yearFrom: '',
      yearTo: '',
      count: 30
    },
    facets: {
      genres: []
    },
    items: [],
    pageInfo: null,
    loading: false,
    loadingMore: false,
    error: null,
    libraries: []
  }
}

function createBrowseParams (filters, cursor = null) {
  const params = {
    sort: filters.sort,
    order: filters.order,
    count: filters.count,
    q: filters.q || undefined,
    genre: filters.genre && filters.genre.length ? filters.genre : undefined,
    yearFrom: filters.yearFrom ? Number(filters.yearFrom) : undefined,
    yearTo: filters.yearTo ? Number(filters.yearTo) : undefined,
    watched: filters.watched || 'all',
    libraryPath: filters.libraryPath || undefined
  }

  if (cursor) {
    params.cursor = cursor
  }

  return params
}

export const useMediaStore = defineStore('media', {
  state: () => ({
    home: {
      spotlight: null,
      rails: [],
      loading: false,
      error: null
    },
    library: {
      movies: createLibraryState(),
      series: createLibraryState()
    }
  }),
  actions: {
    async loadHome () {
      this.home.loading = true
      this.home.error = null

      try {
        const [
          watchingEpisodes,
          watchingMovies,
          nextEpisodes,
          recentMovies,
          popularMovies,
          recentSeries,
          topSeries,
          recentEpisodes,
          movieSets
        ] = await Promise.all([
          oblectoClient.episodeLibrary.getWatching(),
          oblectoClient.movieLibrary.getWatching(),
          oblectoClient.episodeLibrary.getNextUp(),
          oblectoClient.movieLibrary.getList('createdAt', 'DESC', 16, 0),
          oblectoClient.movieLibrary.getList('popularity', 'DESC', 16, 0),
          oblectoClient.seriesLibrary.getList('createdAt', 'DESC', 16, 0),
          oblectoClient.seriesLibrary.getList('siteRating', 'DESC', 16, 0),
          oblectoClient.episodeLibrary.getList('createdAt', 'DESC', 16, 0),
          oblectoClient.movieLibrary.getSets()
        ])

        const featuredMovie = recentMovies?.[0] || null
        const featuredSeries = recentSeries?.[0] || null

        this.home.spotlight = featuredMovie
          ? { type: 'movie', item: featuredMovie }
          : (featuredSeries ? { type: 'series', item: featuredSeries } : null)

        this.home.rails = [
          { id: 'continue-movies', title: 'Continue Watching Movies', type: 'movie', items: watchingMovies || [] },
          { id: 'next-episodes', title: 'Next Up', type: 'episode', items: nextEpisodes || [] },
          { id: 'recent-movies', title: 'Recently Added Movies', type: 'movie', items: recentMovies || [] },
          { id: 'recent-series', title: 'Recently Added Series', type: 'series', items: recentSeries || [] },
          { id: 'recent-episodes', title: 'Fresh Episodes', type: 'episode', items: recentEpisodes || [] },
          { id: 'popular-movies', title: 'Popular Movies', type: 'movie', items: popularMovies || [] },
          { id: 'top-series', title: 'Top Rated Series', type: 'series', items: topSeries || [] },
          ...(movieSets || []).slice(0, 2).map(set => ({
            id: `set-${set.id}`,
            title: set.setName,
            type: 'movie',
            items: set.movies || set.Movies || []
          })),
          { id: 'continue-episodes', title: 'Continue Watching Episodes', type: 'episode', items: watchingEpisodes || [] }
        ].filter(section => Array.isArray(section.items) && section.items.length > 0)
      } catch (error) {
        this.home.error = error.message || 'Failed to load the home dashboard'
      } finally {
        this.home.loading = false
      }
    },
    async ensureLibraries (type) {
      const state = this.library[type]
      if (state.libraries.length > 0) return

      state.libraries = await oblectoClient.libraries.getLibraryPaths(type === 'movies' ? 'movies' : 'tvshows')
    },
    updateLibraryFilters (type, patch) {
      this.library[type].filters = {
        ...this.library[type].filters,
        ...patch
      }
    },
    resetLibraryFilters (type) {
      this.library[type] = {
        ...this.library[type],
        ...createLibraryState(),
        libraries: this.library[type].libraries
      }
    },
    async loadLibrary (type, { append = false } = {}) {
      const state = this.library[type]
      const client = type === 'movies' ? oblectoClient.movieLibrary : oblectoClient.seriesLibrary

      await this.ensureLibraries(type)

      state.error = null
      state.loading = !append
      state.loadingMore = append

      try {
        const response = await client.browse(createBrowseParams(
          state.filters,
          append ? state.pageInfo?.endCursor || null : null
        ))

        const nextItems = Array.isArray(response?.items) ? response.items : []

        state.items = append ? [...state.items, ...nextItems] : nextItems
        state.facets = response?.facets || { genres: [] }
        state.pageInfo = response?.pageInfo || null
      } catch (error) {
        state.error = error.message || `Failed to load ${type}`
      } finally {
        state.loading = false
        state.loadingMore = false
      }
    }
  }
})
