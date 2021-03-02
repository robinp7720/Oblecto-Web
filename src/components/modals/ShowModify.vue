<template>
  <modal name="ShowModify" @before-open="beforeOpen" height="auto">
    <div class="container">
      <h3>{{ show.seriesName }}</h3>
      <div class="wrapper">
        <div class="half">
          <div class="poster">
            <img :src="host + '/series/' + show.id + '/poster'" alt="">
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'ShowModify',
    data () {
      return {
        show: {}
      }
    },
    computed: mapState([
      'host'
    ]),
    methods: {
      beforeOpen (event) {
        this.show = event.params.show
      }
    }
  }
</script>

<style scoped lang="sass">

  h3
    width: 100%
    color: white
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(darken(#696060, 20), 0.75)

  .wrapper
    width: 100%
    .half
      width: 50%
      float: left

      padding: 10px

    .poster
      width:
      img
        width: 100%
</style>
