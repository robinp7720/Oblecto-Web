<template>
  <div class="watching">
    <tabs :options="{ useUrlFragment: false }">
      <tab name="watching" v-bind:suffix="'<span class=badge>' + watching.length + '</span>'">
        <EpisodeList v-bind:episodes="watching"></EpisodeList>
      </tab>
      <tab name="next up" v-bind:suffix="'<span class=badge>' + watching.length + '</span>'">
        <ShowList v-bind:shows="watching"></ShowList>
      </tab>
    </tabs>
  </div>
</template>

<script>
  import ShowList from '@/components/itemLists/ShowList'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import { mapState } from 'vuex'

  export default {
    name: 'watchPanel',
    components: {
      ShowList: ShowList,
      EpisodeList: EpisodeList
    },
    computed: mapState([
      'watching'
    ]),
    created () {
      // let self = this
      this.$store.dispatch('updateWatching')
    },
    methods: {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .watching
    position: fixed
    top: 50px
    width: 100%
    padding: 20px 0
    background-color: mix(darken(#696060, 11), darken(#55535b, 11))
    background: -moz-linear-gradient(top, darken(#696060, 11) 0%, darken(#55535b, 11) 100%)
    /* FF3.6-15 */
    background: -webkit-linear-gradient(top, darken(#696060, 11) 0%, darken(#55535b, 11) 100%)
    /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(top, darken(#696060, 11) 0%, darken(#55535b, 11) 1000%)
    /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    box-shadow: 0px 0px 5px 2px rgba(darken(#55535b, 20), 0.75)
    z-index: 2

    // The height of the panel if it is populated with shows.
    // If the height isn't set the panel will collapse and the whole thing looks terrible
    height: 356px

    @media screen and (max-height: 800px)
      position: static !important
      margin-top: 50px
      margin-bottom: 20px


</style>

<style lang="sass">
  .tabs-component-tabs
    list-style: none
    margin-top: 0
    margin-bottom: 15px
    position: relative

    .tabs-component-tab
      display: inline-block
      a
        color: #999
        display: block
        text-decoration: none
        padding: 10px 20px
        font-family: Roboto
        font-size: 20px
        text-transform: capitalize
        font-weight: bold
    .is-active
      a
        color: #eee
    .badge
      display: inline-block
      margin-left: 10px
      background-color: rgba(0,0,0,0.5)
      padding: 0 5px
      -webkit-border-radius: 3px
      -moz-border-radius: 3px
      border-radius: 3px
      color: #999
</style>
