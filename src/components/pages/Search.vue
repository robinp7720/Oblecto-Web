<template>
  <div class="container">
    <MovieList
      v-if="searchResults.movies.length > 0"
      title="Movie Results"
      :badge="`${searchResults.movies.length}`"
      :movies="searchResults.movies"
    />
    <EpisodeList
      v-if="searchResults.episodes.length > 0"
      title="Episode Results"
      :badge="`${searchResults.episodes.length}`"
      :episodes="searchResults.episodes"
    />
    <SeriesList
      v-if="searchResults.series.length > 0"
      title="TV Show Results"
      :badge="`${searchResults.series.length}`"
      :series="searchResults.series"
    />
  </div>
</template>

<script>
  import MovieList from '@/components/itemLists/MovieList'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import SeriesList from '@/components/itemLists/SeriesList'

  export default {
    name: 'Search',
    components: {
      MovieList,
      EpisodeList,
      SeriesList
    },
    data () {
      return {
        searchResults: {
          episodes: [],
          movies: [],
          shows: []
        }
      }
    },

    watch: {
      async '$route' (to, from) {
        this.search(to.params.search)
      }
    },

    async created () {
      this.search(this.$route.params.search)
    },

    methods: {
      async search (query) {
        let { data: episodes } = await this.axios.get(`/episodes/search/${query}`)
        let { data: movies } = await this.axios.get(`/movies/search/${query}`)
        let { data: series } = await this.axios.get(`/shows/search/${query}`)

        this.searchResults = {
          episodes, movies, series
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">



</style>
