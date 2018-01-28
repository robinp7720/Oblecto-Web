<template>
  <div class="container">
    <MovieList title="Recently Added"
                 v-bind:movies="movies.createdAt"
    ></MovieList>
    <MovieList title="Popular movies"
              v-bind:movies="movies.popularity"
    ></MovieList>
    <MovieList title="Recently released movies"
                 v-bind:movies="movies.releaseDate"
    ></MovieList>
  </div>
</template>

<script>
  import MovieList from '@/components/itemLists/MovieList'
  import { mapState } from 'vuex'

  export default {
    name: 'Movies',
    components: {
      MovieList: MovieList
    },
    computed: mapState([
      'movies'
    ]),
    data () {
      return {
        recent: [],
        popular: [],
        releaseDate: []
      }
    },
    created: function () {
      this.$store.dispatch('getMovies', {sort: 'createdAt', order: 'DESC'})
      this.$store.dispatch('getMovies', {sort: 'popularity', order: 'DESC'})
      this.$store.dispatch('getMovies', {sort: 'releaseDate', order: 'DESC'})
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
