<template>
  <div class="container">
    <MovieList
      title="Recently Added"
      :movies="movies.createdAt"
    />
    <MovieList
      title="Popular movies"
      :movies="movies.popularity"
    />
    <MovieList
      title="Recently released movies"
      :movies="movies.releaseDate"
    />

    <MovieList
      v-for="(set, index) in sets"
      :key="set.id"
      :title="set.setName"
      :movies="set.movies"
    />
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
    computed: mapState('movies', {
      movies: state => state.lists,
      sets: state => state.sets
    }),
    data () {
      return {

      }
    },
    created: function () {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
