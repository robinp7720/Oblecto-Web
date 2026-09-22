import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'

export const useLibrariesStore = defineStore('libraries', {
  state: () => ({ movies: [], shows: [], requestId: 0 }),
  actions: {
    async updateAll () {
      const request = ++this.requestId
      const [movies, shows] = await Promise.all([
        oblectoClient.libraries.getLibraryPaths('movies'),
        oblectoClient.libraries.getLibraryPaths('tvshows')
      ])
      if (request !== this.requestId) return
      this.movies = movies
      this.shows = shows
    },
    async deleteMovieLibrary (path) {
      await oblectoClient.libraries.removePath('movies', path)
      await this.updateAll()
    },
    async deleteSeriesLibrary (path) {
      await oblectoClient.libraries.removePath('tvshows', path)
      await this.updateAll()
    },
    reset () { this.requestId++; this.movies = []; this.shows = [] }
  }
})
