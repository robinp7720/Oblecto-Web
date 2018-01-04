<template>
  <div class="container">
    <EpisodeList title="Recently aired"
                 v-bind:episodes="episodesRecentlyAired"
    ></EpisodeList>
    <ShowList title="Recently added shows"
              v-bind:shows="recent"
    ></ShowList>
    <EpisodeList title="Recently added episodes"
                 v-bind:episodes="episodesRecentlyAdded"
    ></EpisodeList>
    <ShowList title="Newly aired"
              v-bind:shows="recent"
    ></ShowList>
    <ShowList title="Watched by others"
              v-bind:shows="others"
    ></ShowList>
    <ShowList title="Best rated"
              v-bind:shows="rating"
    ></ShowList>
  </div>
</template>

<script>
  import WatchPanel from '@/components/WatchPanel'
  import ShowList from '@/components/itemLists/ShowList'
  import SearchResults from '@/components/SearchResults'
  import EpisodeList from '@/components/itemLists/EpisodeList'

  export default {
    name: 'TVShows',
    components: {
      WatchPanel: WatchPanel,
      'search-results': SearchResults,
      ShowList: ShowList,
      EpisodeList: EpisodeList
    },
    data () {
      return {
        recent: [],
        rating: [],
        others: [],
        episodesRecentlyAired: [],
        episodesRecentlyAdded: []
      }
    },
    created () {
      this.axios.get('/shows/list/createdAt/DESC')
        .then(response => {
          this.recent = response.data
        })
        .catch(e => {})
      this.axios.get('/shows/list/siteRating/DESC')
        .then(response => {
          this.rating = response.data
        })
        .catch(e => {})
      this.axios.get('/shows/list/siteRatingCount/DESC')
        .then(response => {
          this.others = response.data
        })
        .catch(e => {})
      this.axios.get('/episodes/list/firstAired/DESC')
        .then(response => {
          this.episodesRecentlyAired = response.data
        })
        .catch(e => {})
      this.axios.get('/episodes/list/createdAt/DESC')
        .then(response => {
          this.episodesRecentlyAdded = response.data
        })
        .catch(e => {})
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
