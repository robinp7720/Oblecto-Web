<template>
  <ListContainer :title="title" :badge="badge">
    <Episode v-for="episode in episodes"
             :subtitle="`S${episode.airedSeason}E${episode.airedEpisodeNumber} - ${episode.Series.seriesName}`"
             :key="episode.id"
             :episode="episode"/>
  </ListContainer>
</template>

<script>
import Episode from '@/components/itemTypes/Episode.vue';
import ListContainer from '@/components/ListContainer.vue';

export default {
  name: 'EpisodeList',
  components: { Episode, ListContainer },
  props: { episodes: Array, title: String, badge: String },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
