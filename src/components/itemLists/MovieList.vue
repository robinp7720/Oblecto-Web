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
      :subtitle="'Released: ' + movie.releaseDate"
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
    props: { 'movies': Array, 'title': String, 'badge': String }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
