<template>
  <div class="container">
    <EpisodeList
      title="Recently aired"
      :episodes="episodes.firstAired"
    />
    <SeriesList
      title="Recently added shows"
      :series="series.createdAt"
    />
    <EpisodeList
      title="Recently added episodes"
      :episodes="episodes.createdAt"
    />
    <SeriesList
      title="Watched by others"
      :series="series.siteRatingCount"
    />
    <SeriesList
      title="Best rated"
      :series="series.siteRating"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import SeriesList from '@/components/itemLists/SeriesList'

  export default {
    name: 'Series',
    components: {
      SeriesList,
      EpisodeList
    },
    computed: mapState({
      series: state => state.series.lists,
      episodes: state => state.episodes.lists
    }),
    created () {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
