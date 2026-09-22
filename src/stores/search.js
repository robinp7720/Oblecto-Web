import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'

export const useSearchStore = defineStore('search', {
  state: () => ({
    requestId: 0,
    query: '',
    loading: false,
    error: null,
    results: {
      movies: [],
      series: [],
      episodes: [],
      people: []
    }
  }),
  actions: {
    reset () {
      const requestId = this.requestId + 1
      this.$reset()
      this.requestId = requestId
    },
    async runSearch (query, { silent = false } = {}) {
      const requestId = ++this.requestId
      const normalized = String(query || '').trim()
      this.query = normalized

      if (!normalized) {
        this.results = { movies: [], series: [], episodes: [], people: [] }
        this.error = null
        this.loading = false
        return
      }

      if (!silent) this.results = { movies: [], series: [], episodes: [], people: [] }
      this.loading = !silent
      this.error = null

      try {
        const [episodes, movies, series, people] = await Promise.all([
          oblectoClient.episodeLibrary.search(normalized),
          oblectoClient.movieLibrary.search(normalized),
          oblectoClient.seriesLibrary.search(normalized),
          oblectoClient.people.search(normalized)
        ])

        if (requestId !== this.requestId) return
        this.results = {
          movies: movies || [],
          series: series || [],
          episodes: episodes || [],
          people: people || []
        }
      } catch (error) {
        if (requestId !== this.requestId) return
        this.error = error.message || 'Search failed'
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    }
  }
})
