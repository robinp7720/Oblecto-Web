<template>
  <div class="container">
    <EpisodeList title="Recently aired"
                 v-bind:episodes="tv.episodesRecentlyAired"
    ></EpisodeList>
    <ShowList title="Recently added shows"
              v-bind:shows="tv.recent"
    ></ShowList>
    <EpisodeList title="Recently added episodes"
                 v-bind:episodes="tv.episodesRecentlyAdded"
    ></EpisodeList>
    <MovieList title="Recently added movies"
               v-bind:movies="movies.recent"
    ></MovieList>
    <ShowList title="Shows watched by others"
              v-bind:shows="tv.others"
    ></ShowList>
    <MovieList title="Popular movies"
               v-bind:movies="movies.popular"
    ></MovieList>
    <ShowList title="Best rated shows"
              v-bind:shows="tv.rating"
    ></ShowList>
    <MovieList title="Recently released movies"
               v-bind:movies="movies.releaseDate"
    ></MovieList>
  </div>
</template>

<script>
  import WatchPanel from '@/components/WatchPanel'
  import ShowList from '@/components/itemLists/ShowList'
  import SearchResults from '@/components/SearchResults'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import MovieList from '@/components/itemLists/MovieList'

  export default {
    name: 'Main',
    components: {
      WatchPanel: WatchPanel,
      'search-results': SearchResults,
      ShowList: ShowList,
      EpisodeList: EpisodeList,
      MovieList: MovieList
    },
    data () {
      return {
        tv: {
          recent: [],
          rating: [],
          others: [],
          episodesRecentlyAired: [],
          episodesRecentlyAdded: []
        },
        movies: {
          recent: [],
          popular: [],
          releaseDate: []
        }
      }
    },
    created () {
      this.axios.get('/shows/list/createdAt/DESC')
        .then(response => {
          this.tv.recent = response.data
        })
        .catch(e => {})
      this.axios.get('/shows/list/siteRating/DESC')
        .then(response => {
          this.tv.rating = response.data
        })
        .catch(e => {})
      this.axios.get('/shows/list/siteRatingCount/DESC')
        .then(response => {
          this.tv.others = response.data
        })
        .catch(e => {})
      this.axios.get('/episodes/list/firstAired/DESC')
        .then(response => {
          this.tv.episodesRecentlyAired = response.data
        })
        .catch(e => {})
      this.axios.get('/episodes/list/createdAt/DESC')
        .then(response => {
          this.tv.episodesRecentlyAdded = response.data
        })
        .catch(e => {})

      this.axios.get('/movies/list/createdAt/DESC')
        .then(response => {
          this.movies.recent = response.data
        })
        .catch(e => {})
      this.axios.get('/movies/list/popularity/DESC')
        .then(response => {
          this.movies.popular = response.data
        })
        .catch(e => {})
      this.axios.get('/movies/list/releaseDate/DESC')
        .then(response => {
          this.movies.releaseDate = response.data
        })
        .catch(e => {})
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
