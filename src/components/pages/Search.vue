<template>
  <div class="container">
    <MovieList v-bind:title="'Movie Results <span class=badge>' + searchResults.movies.length + '</span>' "
               v-bind:movies="searchResults.movies" v-if="searchResults.movies.length > 0"/>
    <EpisodeList v-bind:title="'Episode Results <span class=badge>' + searchResults.episodes.length+ '</span>' "
                 v-bind:episodes="searchResults.episodes" v-if="searchResults.episodes.length > 0"/>
    <ShowList v-bind:title="'TV Show Results <span class=badge>' + searchResults.shows.length  + '</span>' "
                 v-bind:shows="searchResults.shows" v-if="searchResults.shows.length > 0"/>
  </div>
</template>

<script>
  import MovieList from '@/components/itemLists/MovieList'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import ShowList from '@/components/itemLists/ShowList'

  import { mapState } from 'vuex'

  export default {
    name: 'Search',
    components: {
      MovieList,
      EpisodeList,
      ShowList
    },
    computed: mapState([
      'searchResults'
    ])
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">



</style>
