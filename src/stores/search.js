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
      episodes: []
    }
  }),
  actions: {
    async runSearch (query) {
      const requestId = ++this.requestId
      const normalized = String(query || '').trim()
      this.query = normalized

      if (!normalized) {
        this.results = { movies: [], series: [], episodes: [] }
        this.error = null
        this.loading = false
        return
      }

      this.results = { movies: [], series: [], episodes: [] }
      this.loading = true
      this.error = null

      try {
        const [episodes, movies, series] = await Promise.all([
          oblectoClient.episodeLibrary.search(normalized),
          oblectoClient.movieLibrary.search(normalized),
          oblectoClient.seriesLibrary.search(normalized)
        ])

        if (requestId !== this.requestId) return
        this.results = {
          movies: movies || [],
          series: series || [],
          episodes: episodes || []
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
