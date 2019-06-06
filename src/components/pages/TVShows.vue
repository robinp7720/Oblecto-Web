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
    <ShowList title="Watched by others"
              v-bind:shows="tvshows.siteRatingCount"
    />
    <ShowList title="Best rated"
              v-bind:shows="tvshows.siteRating"
    />
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
    computed: mapState({
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
