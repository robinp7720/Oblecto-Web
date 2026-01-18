<template>
  <modal
    name="ShowModify"
    height="auto"
    @before-open="beforeOpen"
  >
    <div class="container">
      <h3>{{ show.seriesName }}</h3>
      <div class="wrapper">
        <div class="half">
          <div class="poster">
            <img
              :src="host + '/series/' + show.id + '/poster'"
              alt=""
            >
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
  @use "sass:color"

  h3
    width: 100%
    color: white
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(color.adjust(#696060, $lightness: -20%), 0.75)

  .wrapper
    width: 100%
    .half
      width: 50%
      float: left

      padding: 10px

    .poster
      width: 100%
      img
        width: 100%
</style>
