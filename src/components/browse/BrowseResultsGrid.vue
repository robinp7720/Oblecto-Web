<template>
  <div class="browse-grid-wrapper">
    <ul class="browse-grid">
      <template v-if="type === 'movies'">
        <Movie
          v-for="movie in normalizedItems"
          :key="`movie-${movie.id}`"
          :title="movie.movieName"
          :movie-id="movie.id"
          :movie="movie"
          :subtitle="movieSubtitle(movie)"
        />
      </template>

      <template v-else>
        <Series
          v-for="show in normalizedItems"
          :key="`series-${show.id}`"
          :title="show.seriesName"
          :series="show"
          :subtitle="seriesSubtitle(show)"
        />
      </template>
    </ul>
  </div>
</template>

<script>
import Movie from '@/components/itemTypes/Movie'
import Series from '@/components/itemTypes/Series'

export default {
  name: 'BrowseResultsGrid',
  components: {
    Movie,
    Series
  },
  props: {
    items: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      required: true
    }
  },
  computed: {
    normalizedItems () {
      return Array.isArray(this.items) ? this.items : []
    }
  },
  methods: {
    movieSubtitle (movie) {
      if (!movie) return null

      const parts = []
      const year = this.formatYear(movie.releaseDate)
      if (year) parts.push(year)

      const runtime = this.formatRuntime(movie.runtime)
      if (runtime) parts.push(runtime)

      const genres = this.formatGenres(movie.genres, 2)
      if (genres) parts.push(genres)

      return parts.join(' | ') || null
    },
    seriesSubtitle (show) {
      if (!show) return null

      const parts = []
      const year = this.formatYear(show.firstAired)
      if (year) parts.push(year)

      const runtime = this.formatRuntime(show.runtime)
      if (runtime) parts.push(runtime)

      const rating = this.formatRating(show.siteRating)
      if (rating) parts.push(rating)

      const genres = this.formatGenres(show.genre, 2)
      if (genres) parts.push(genres)

      return parts.join(' | ') || null
    },
    formatYear (value) {
      if (!value) return null
      const match = String(value).match(/^\d{4}/)
      return match ? match[0] : null
    },
    formatRuntime (value) {
      const minutes = Number(value)
      if (!Number.isFinite(minutes) || minutes <= 0) return null
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
      if (hours > 0) return `${hours}h`
      return `${mins}m`
    },
    formatRating (score) {
      const ratingValue = Number(score)
      if (!Number.isFinite(ratingValue) || ratingValue <= 0) return null
      return `Rating ${Math.round(ratingValue * 10) / 10}`
    },
    formatGenres (raw, limit = 2) {
      const genres = this.normalizeGenres(raw)
      if (!genres.length) return null
      return genres.slice(0, limit).join(', ')
    },
    normalizeGenres (raw) {
      if (!raw) return []
      if (Array.isArray(raw)) {
        return raw.map(entry => String(entry).trim()).filter(Boolean)
      }
      if (typeof raw === 'string') {
        const trimmed = raw.trim()
        if (!trimmed) return []
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            return parsed.map(entry => String(entry).trim()).filter(Boolean)
          }
        } catch (e) {
          // Fall back to comma-separated list.
        }
        return trimmed.split(',').map(entry => entry.trim()).filter(Boolean)
      }
      return []
    }
  }
}
</script>

<style scoped lang="sass">
.browse-grid
  display: flex
  flex-wrap: wrap
  margin: 0
  padding: 0
  list-style: none

.browse-grid-wrapper
  border-top: 1px solid rgba(255, 255, 255, 0.06)
  padding-top: 8px
</style>
