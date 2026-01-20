<template>
  <ListContainer
    :title="title"
    :badge="badge"
  >
    <Movie
      v-for="(movie, index) in movies"
      :key="movie.id"
      :title="movie.movieName"
      :movie-id="movie.id"
      :subtitle="movieSubtitle(movie)"
      :movie="movie"
    />
  </ListContainer>
</template>

<script>
  import Movie from '@/components/itemTypes/Movie'
  import ListContainer from '@/components/ListContainer'

  export default {
    name: 'MovieList',
    components: { Movie, ListContainer },
    props: { 'movies': Array, 'title': String, 'badge': String },
    methods: {
      movieSubtitle (movie) {
        if (!movie) return null

        const parts = []
        const year = this.formatYear(movie.releaseDate)
        if (year) parts.push(year)

        const runtime = this.formatRuntime(movie.runtime)
        if (runtime) parts.push(runtime)

        const genres = this.formatGenres(movie.genres || movie.genre, 2)
        if (genres) parts.push(genres)

        if (parts.length > 0) {
          return parts.join(' | ')
        }

        if (movie.releaseDate) {
          return 'Released: ' + movie.releaseDate
        }

        return null
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
