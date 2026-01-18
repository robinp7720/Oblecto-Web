<template>
  <modal
    name="ShowModify"
    height="auto"
    @before-open="beforeOpen"
  >
    <div class="container">
      <div class="heading">
        <h3>{{ show.seriesName }}</h3>
      </div>
      <div class="body">
        <div class="wrapper">
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

  h3
    width: 100%
    color: var(--color-text)
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(255, 255, 255, 0.06)

    box-shadow: var(--shadow-soft)

  .wrapper
    width: 100%
    display: flex
    justify-content: center
    padding: 10px 0

    .poster
      width: min(260px, 70%)
      box-shadow: 0 18px 40px rgba(12, 10, 12, 0.6)
      border-radius: 14px
      overflow: hidden
      img
        width: 100%
</style>
