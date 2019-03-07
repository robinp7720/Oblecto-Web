<template>
  <div class="container">
    <MovieList title="Movie Results"
               v-bind:movies="searchResults.movies"/>
    <EpisodeList title="Episode Results"
                 v-bind:episodes="searchResults.episodes"/>
    <ShowList title="TV Show Results"
                 v-bind:shows="searchResults.shows"/>
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
<style scoped>

</style>
