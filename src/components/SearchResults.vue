<template>
  <div class="results">
    <transition-group name="list">
      <ShowList v-for="(show, index) in shows"
                v-bind:key="index"
                v-bind:title="index"
                v-bind:shows="show"
      ></ShowList>
    </transition-group>
  </div>
</template>

<script>
  import ShowList from '@/components/itemLists/ShowList'
  import { mapState } from 'vuex'

  export default {
    name: 'search-results',
    components: {ShowList: ShowList},
    computed: mapState([
      'shows'
    ]),
    methods: {}
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .list-enter-active, .list-leave-active {
    transition: all 0.5s;
    height: 288px;
  }

  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */
  {
    opacity: 0;
    height: 0;
  }
</style>
