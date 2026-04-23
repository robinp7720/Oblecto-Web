import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'

export const useSearchStore = defineStore('search', {
  state: () => ({
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
      const normalized = String(query || '').trim()
      this.query = normalized

      if (!normalized) {
        this.results = { movies: [], series: [], episodes: [] }
        this.error = null
        return
      }

      this.loading = true
      this.error = null

      try {
        const [episodes, movies, series] = await Promise.all([
          oblectoClient.episodeLibrary.search(normalized),
          oblectoClient.movieLibrary.search(normalized),
          oblectoClient.seriesLibrary.search(normalized)
        ])

        this.results = {
          movies: movies || [],
          series: series || [],
          episodes: episodes || []
        }
      } catch (error) {
        this.error = error.message || 'Search failed'
      } finally {
        this.loading = false
      }
    }
  }
})
