<template>
  <div class="container">
    <EpisodeList title="Recently aired"
                 v-bind:episodes="episodesRecentlyAired"
    ></EpisodeList>
    <ShowList title="Recently added shows"
              v-bind:shows="tvshows.createdAt"
    ></ShowList>
    <EpisodeList title="Recently added episodes"
                 v-bind:episodes="episodesRecentlyAdded"
    ></EpisodeList>
    <ShowList title="Watched by others"
              v-bind:shows="tvshows.siteRatingCount"
    ></ShowList>
    <ShowList title="Best rated"
              v-bind:shows="tvshows.siteRating"
    ></ShowList>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import WatchPanel from '@/components/WatchPanel'
  import ShowList from '@/components/itemLists/ShowList'
  import EpisodeList from '@/components/itemLists/EpisodeList'

  export default {
    name: 'TVShows',
    components: {
      WatchPanel: WatchPanel,
      ShowList: ShowList,
      EpisodeList: EpisodeList
    },
    computed: mapState([
      'tvshows'
    ]),
    data () {
      return {
        episodesRecentlyAired: [],
        episodesRecentlyAdded: []
      }
    },
    created () {
      this.$store.dispatch('getTVShows', {sort: 'createdAt', order: 'DESC'})
      this.$store.dispatch('getTVShows', {sort: 'siteRating', order: 'DESC'})
      this.$store.dispatch('getTVShows', {sort: 'siteRatingCount', order: 'DESC'})

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
