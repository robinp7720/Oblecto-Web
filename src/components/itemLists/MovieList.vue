<template>
  <ListContainer :title="title" :badge="badge">
    <Movie v-for="movie in movies"
           :title="movie.movieName"
           :movieId="movie.id"
           :subtitle="'Released: ' + movie.releaseDate"
           :movie="movie"
           :key="movie.id" />
  </ListContainer>
</template>

<script>
import Movie from '@/components/itemTypes/Movie.vue';
import ListContainer from '@/components/ListContainer.vue';

export default {
  name: 'MovieList',
  components: { Movie, ListContainer },
  props: { movies: Array, title: String, badge: String },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
