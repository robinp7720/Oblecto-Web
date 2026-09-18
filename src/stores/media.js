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
    requestId: 0,
    moreError: null,
    librariesLoaded: false,
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
      sections: {},
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
    async loadHome (onlyId = null) {
      const definitions = [
        ['continue-movies', 'Continue Watching Movies', 'movie', () => oblectoClient.movieLibrary.getWatching()],
        ['continue-episodes', 'Continue Watching Episodes', 'episode', () => oblectoClient.episodeLibrary.getWatching()],
        ['next-episodes', 'Next Up', 'episode', () => oblectoClient.episodeLibrary.getNextUp()],
        ['recent-movies', 'Recently Added Movies', 'movie', () => oblectoClient.movieLibrary.getList('createdAt', 'DESC', 16, 0)],
        ['recent-series', 'Recently Added Series', 'series', () => oblectoClient.seriesLibrary.getList('createdAt', 'DESC', 16, 0)],
        ['recent-episodes', 'Fresh Episodes', 'episode', () => oblectoClient.episodeLibrary.getList('createdAt', 'DESC', 16, 0)],
        ['popular-movies', 'Popular Movies', 'movie', () => oblectoClient.movieLibrary.getList('popularity', 'DESC', 16, 0)],
        ['top-series', 'Top Rated Series', 'series', () => oblectoClient.seriesLibrary.getList('siteRating', 'DESC', 16, 0)],
        ['sets', 'Collections', 'movie', () => oblectoClient.movieLibrary.getSets()]
      ]
      const refresh = () => {
        const sections = this.home.sections
        this.home.loading = Object.values(sections).some(section => section.loading)
        this.home.error = Object.values(sections).some(section => section.error) ? 'Some sections could not be loaded.' : null
        this.home.rails = definitions.flatMap(([id, title, type]) => {
          const items = sections[id]?.items || []
          if (id === 'sets') return items.slice(0, 2).map(set => ({ id: `set-${set.id}`, title: set.setName, type, items: set.movies || set.Movies || [] }))
          return [{ id, title, type, items }]
        }).filter(section => section.items.length)
        const movie = sections['recent-movies']?.items?.[0]
        const series = sections['recent-series']?.items?.[0]
        this.home.spotlight = movie ? { type: 'movie', item: movie } : series ? { type: 'series', item: series } : null
      }
      const jobs = definitions.filter(([id]) => !onlyId || id === onlyId).filter(([id]) => !this.home.sections[id]?.loading)
      for (const [id, title] of jobs) {
        this.home.sections[id] = { ...this.home.sections[id], title, loading: true, error: null }
      }
      refresh()
      await Promise.all(jobs.map(async ([id, , , fetch]) => {
        const section = this.home.sections[id]
        try {
          const items = await fetch()
          section.items = Array.isArray(items) ? items : []
        } catch {
          section.error = `Could not load ${section.title.toLowerCase()}.`
        } finally {
          section.loading = false
          refresh()
        }
      }))
    },
    async ensureLibraries (type) {
      const state = this.library[type]
      if (state.librariesLoaded && state.libraries.length) return

      state.libraries = await oblectoClient.libraries.getLibraryPaths(type === 'movies' ? 'movies' : 'tvshows')
      state.librariesLoaded = true
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

      if (append && (state.loading || state.loadingMore)) return
      const requestId = ++state.requestId
      const params = createBrowseParams(state.filters, append ? state.pageInfo?.nextCursor || null : null)
      state.moreError = null
      if (!append) state.error = null
      state.loading = !append
      state.loadingMore = append

      try {
        await this.ensureLibraries(type)

        const response = await client.browse(params)
        if (requestId !== state.requestId) return

        const nextItems = Array.isArray(response?.items) ? response.items : []

        state.items = append ? [...state.items, ...nextItems] : nextItems
        state.facets = response?.facets || { genres: [] }
        state.pageInfo = response?.pageInfo || null
      } catch (error) {
        if (requestId !== state.requestId) return
        state[append ? 'moreError' : 'error'] = error.message || `Failed to load ${type}`
      } finally {
        if (requestId === state.requestId) {
          state.loading = false
          state.loadingMore = false
        }
      }
    }
  }
})
