<template>
  <div class="container">
    <MovieList title="Recently Added"
                 v-bind:movies="recent"
    ></MovieList>
    <MovieList title="Popular movies"
              v-bind:movies="popular"
    ></MovieList>
    <MovieList title="Recently released movies"
                 v-bind:movies="releaseDate"
    ></MovieList>
  </div>
</template>

<script>
  import MovieList from '@/components/itemLists/MovieList'

  export default {
    name: 'Movies',
    components: {
      MovieList: MovieList
    },
    data () {
      return {
        recent: [],
        popular: [],
        releaseDate: []
      }
    },
    created () {
      this.axios.get('/movies/list/createdAt/DESC')
        .then(response => {
          this.recent = response.data
        })
        .catch(e => {})
      this.axios.get('/movies/list/popularity/DESC')
        .then(response => {
          this.popular = response.data
        })
        .catch(e => {})
      this.axios.get('/movies/list/releaseDate/DESC')
        .then(response => {
          this.releaseDate = response.data
        })
        .catch(e => {})
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
