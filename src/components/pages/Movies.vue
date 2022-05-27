<template>
  <div class="container">
    <MovieList title="Recently Added"
               v-bind:movies="movies.createdAt"/>
    <MovieList title="Popular movies"
               v-bind:movies="movies.popularity"/>
    <MovieList title="Recently released movies"
               v-bind:movies="movies.releaseDate"/>

    <MovieList v-for="set in sets"
             v-bind:title="set.setName"
             v-bind:key="set.id"
             v-bind:movies="set.movies"
    ></MovieList>
  </div>
</template>

<script>
import MovieList from '@/components/itemLists/MovieList.vue';
import { mapState } from 'vuex';

export default {
  name: 'movies-view',
  components: {
    MovieList,
  },
  computed: mapState('movies', {
    movies: (state) => state.lists,
    sets: (state) => state.sets,
  }),
  data() {
    return {

    };
  },
  created() {

  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
