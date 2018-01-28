<template>
  <div class="container">
    <EpisodeList title="Recently aired"
                 v-bind:episodes="episodes.firstAired"
    ></EpisodeList>
    <ShowList title="Recently added shows"
              v-bind:shows="tvshows.createdAt"
    ></ShowList>
    <EpisodeList title="Recently added episodes"
                 v-bind:episodes="episodes.createdAt"
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
  import ShowList from '@/components/itemLists/ShowList'
  import EpisodeList from '@/components/itemLists/EpisodeList'

  export default {
    name: 'TVShows',
    components: {
      ShowList: ShowList,
      EpisodeList: EpisodeList
    },
    computed: mapState([
      'tvshows',
      'episodes'
    ]),
    created () {
      this.$store.dispatch('getTVShows', {sort: 'createdAt', order: 'DESC'})
      this.$store.dispatch('getTVShows', {sort: 'siteRating', order: 'DESC'})
      this.$store.dispatch('getTVShows', {sort: 'siteRatingCount', order: 'DESC'})

      this.$store.dispatch('getEpisodes', {sort: 'firstAired', order: 'DESC'})
      this.$store.dispatch('getEpisodes', {sort: 'createdAt', order: 'DESC'})
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
