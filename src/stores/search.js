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
    async runSearch (query) {
      const requestId = ++this.requestId
      const normalized = String(query || '').trim()
      this.query = normalized

      if (!normalized) {
        this.results = { movies: [], series: [], episodes: [], people: [] }
        this.error = null
        this.loading = false
        return
      }

      this.results = { movies: [], series: [], episodes: [], people: [] }
      this.loading = true
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
