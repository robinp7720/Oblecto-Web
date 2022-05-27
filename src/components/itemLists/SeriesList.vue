<template>
  <ListContainer :title="title" :badge="badge">
    <Series v-for="show in series"
            :title="show.seriesName"
            :seriesId="show.id"
            :series="show"
            :watching="show.watching"
            :key="show.id" />
  </ListContainer>
</template>

<script>
import Series from '@/components/itemTypes/Series.vue';
import ListContainer from '@/components/ListContainer.vue';

export default {
  name: 'SeriesList',
  components: { Series, ListContainer },
  props: { series: Array, title: String, badge: String },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
