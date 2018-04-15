<template>
  <div class="container">
    <MovieList title="Recently Added"
               v-bind:movies="movies.createdAt"/>
    <MovieList title="Popular movies"
               v-bind:movies="movies.popularity"/>
    <MovieList title="Recently released movies"
               v-bind:movies="movies.releaseDate"/>
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

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
