<template>
  <ListContainer
    :title="title"
    :badge="badge"
  >
    <Series
      v-for="(show, index) in series"
      :key="show.id"
      :title="show.seriesName"
      :series-id="show.id"
      :subtitle="seriesSubtitle(show)"
      :series="show"
      :watching="show.watching"
    />
  </ListContainer>
</template>

<script>
  import Series from '@/components/itemTypes/Series'
  import ListContainer from '@/components/ListContainer'

  export default {
    name: 'SeriesList',
    components: { Series, ListContainer },
    props: { 'series': Array, 'title': String, 'badge': String },
    methods: {
      seriesSubtitle (show) {
        if (!show) return null

        const parts = []
        const year = this.formatYear(show.firstAired)
        if (year) parts.push(year)

        const network = this.normalizeText(show.network)
        if (network) parts.push(network)

        const runtime = this.formatRuntime(show.runtime)
        if (runtime) parts.push(runtime)

        const rating = this.formatRating(show.siteRating, show.siteRatingCount, show.rating)
        if (rating) parts.push(rating)

        const genres = this.formatGenres(show.genre, 2)
        if (genres) parts.push(genres)

        if (parts.length === 0) return null

        return parts.join(' | ')
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
      formatRating (score, count, contentRating) {
        const ratingValue = Number(score)
        if (Number.isFinite(ratingValue) && ratingValue > 0) {
          const rounded = Math.round(ratingValue * 10) / 10
          const countValue = Number(count)
          if (Number.isFinite(countValue) && countValue > 0) {
            return `Rating ${rounded} (${this.formatCount(countValue)})`
          }
          return `Rating ${rounded}`
        }
        const ratingText = this.normalizeText(contentRating)
        return ratingText || null
      },
      formatCount (value) {
        if (!Number.isFinite(value)) return null
        if (value >= 1000000) {
          return `${Math.round(value / 100000) / 10}m`
        }
        if (value >= 1000) {
          return `${Math.round(value / 100) / 10}k`
        }
        return `${Math.round(value)}`
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
      },
      normalizeText (value) {
        if (value === null || value === undefined) return null
        const text = String(value).trim()
        return text.length > 0 ? text : null
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
