<template>
  <ListContainer :title="title" :badge="badge">
    <Series v-for="(show, index) in series"
            v-bind:title="show.seriesName"
            v-bind:seriesId="show.id"
            v-bind:series="show"
            v-bind:watching="show.watching"
            v-bind:key="show.id" />
  </ListContainer>
</template>

<script>
  import Series from '@/components/itemTypes/Series'
  import ListContainer from '@/components/ListContainer'

  export default {
    name: 'SeriesList',
    components: { Series, ListContainer },
    props: { 'series': Array, 'title': String, 'badge': String }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
