<template>
  <ListContainer :title="title">
    <Movie v-for="(movie, index) in movies"
           v-bind:title="movie.movieName"
           v-bind:movieId="movie.id"
           v-bind:subtitle="'Released: ' + movie.releaseDate"
           v-bind:movie="movie"
           v-bind:key="movie.id" />
  </ListContainer>
</template>

<script>
  import Movie from '@/components/itemTypes/Movie'
  import ListContainer from '@/components/ListContainer'

  export default {
    name: 'MovieList',
    components: { Movie, ListContainer },
    props: { 'movies': Array, 'title': String }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
