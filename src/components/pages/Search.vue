<template>
  <div class="container">
    <MovieList v-bind:title="'Movie Results <span class=badge>' + searchResults.movies.length + '</span>' "
               v-bind:movies="searchResults.movies" v-if="searchResults.movies.length > 0"/>
    <EpisodeList v-bind:title="'Episode Results <span class=badge>' + searchResults.episodes.length+ '</span>' "
                 v-bind:episodes="searchResults.episodes" v-if="searchResults.episodes.length > 0"/>
    <SeriesList v-bind:title="'TV Show Results <span class=badge>' + searchResults.series.length  + '</span>' "
                 v-bind:series="searchResults.series" v-if="searchResults.series.length > 0"/>
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

    methods: {
      async search (query) {
        let { data: episodes } = await this.axios.get(`/episodes/search/${query}`)
        let { data: movies } = await this.axios.get(`/movies/search/${query}`)
        let { data: series } = await this.axios.get(`/shows/search/${query}`)

        this.searchResults = {
          episodes, movies, series
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
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">



</style>
