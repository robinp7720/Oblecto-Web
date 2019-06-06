<template>
  <div class="container">
    <EpisodeList title="Recently aired"
                 v-bind:episodes="episodes.firstAired"
    />
    <ShowList title="Recently added shows"
              v-bind:shows="tvshows.createdAt"
    />
    <EpisodeList title="Recently added episodes"
                 v-bind:episodes="episodes.createdAt"
    />
    <MovieList title="Recently added movies"
               v-bind:movies="movies.createdAt"
    />
    <ShowList title="Shows watched by others"
              v-bind:shows="tvshows.siteRatingCount"
    />
    <MovieList title="Popular movies"
               v-bind:movies="movies.popularity"
    />
    <ShowList title="Best rated shows"
              v-bind:shows="tvshows.siteRating"
    />
    <MovieList title="Recently released movies"
               v-bind:movies="movies.releaseDate"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import ShowList from '@/components/itemLists/ShowList'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import MovieList from '@/components/itemLists/MovieList'

  export default {
    name: 'Main',
    components: {
      ShowList: ShowList,
      EpisodeList: EpisodeList,
      MovieList: MovieList
    },
    computed: mapState({
      movies: state => state.movies.lists,
      tvshows: state => state.tvshows.lists,
      episodes: state => state.episodes.lists
    }),
    created () {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
