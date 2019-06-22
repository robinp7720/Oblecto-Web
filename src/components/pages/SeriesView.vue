<template>
  <div class="container">
    <div class="show">
      <div class="info-container" v-if="Object.keys(series).length > 0">
        <div class="info">
          <div class="poster">
            <img v-bind:src="host + '/series/' + showData.id + '/poster'" alt="">
          </div>
          <div class="right">
            <h2>{{ showData.seriesName }} <span class="year">First aired on {{ showData.firstAired }}</span></h2>
            <p>
              {{ showData.overview }}
            </p>
            <ul class="genres"><li class="genre" v-for="genre in showData.genre">{{ genre }}</li></ul>
          </div>
        </div>
        </div>
        <div class="episodes">
          <EpisodeList
            v-for="(episodes, index) in series"
            v-bind:episodes="episodes"
            v-bind:show="showData"
            v-bind:key="index"
            v-bind:title="index">

          </EpisodeList>

        </div>
    </div>
  </div>
</template>

<script>
  import Show from '@/components/itemTypes/Show'
  import WatchPanel from '@/components/WatchPanel'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import { mapState } from 'vuex'
  import axios from 'axios'

  export default {
    name: 'SeriesView',
    components: {
      Show: Show,
      WatchPanel: WatchPanel,
      EpisodeList: EpisodeList
    },
    data () {
      return {
        'showData': {},
        'series': {}
      }
    },
    computed: mapState([
      'host'
    ]),
    created () {
      axios.get('/series/' + this.$route.params.seriesId + `/info`)
        .then(response => {
          this.showData = response.data
        })
        .catch(e => {
          console.log(e)
        })
      // Retrieve episodes
      axios.get('/series/' + this.$route.params.seriesId + `/episodes`)
        .then(response => {
          let temp = {}
          response.data.forEach(function (v, i) {
            if (temp['Season ' + v.airedSeason] === undefined) temp['Season ' + v.airedSeason] = []
            temp['Season ' + v.airedSeason].push(v)
          })
          this.series = temp
        })
        .catch(e => {
          console.log(e)
        })
    },
    methods: {

    },
    watch: {
      '$route' (to, from) {
        console.log(to, from)
        this.series = {}
        axios.get('/series/' + this.$route.params.seriesId + `/info`)
          .then(response => {
            this.showData = response.data
          })
          .catch(e => {
            console.log(e)
          })
        // Retrieve episodes
        axios.get('/series/' + this.$route.params.seriesId + `/episodes`)
          .then(response => {
            let temp = {}
            response.data.forEach(function (v, i) {
              if (temp['Season ' + v.airedSeason] === undefined) temp['Season ' + v.airedSeason] = []
              temp['Season ' + v.airedSeason].push(v)
            })
            this.series = temp
          })
          .catch(e => {
            console.log(e)
          })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

.info-container
  padding: 0 10px

.info
  font-size: 1.1em
  border-radius: 3px
  background: #696060
  overflow: hidden
  box-shadow: 0px 2px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

  .poster
    height: 300px
    float: left
    margin-right: 20px
    box-shadow: 0px 2px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)
    img
      height: 100%

  .right
    padding: 20px

    h2
      padding: 0
      font-size: 1.2em
      margin: 0
      margin-bottom: 10px

      .year
        font-size: 0.8em

    .year, .genres
      color: rgba(250, 240, 240, 0.6)
      margin-bottom: 10px
      display: inline-block
      padding: 0
      font-weight: normal

    p
      color: rgba(250, 240, 240, 0.9)
      margin: 0
      padding: 0

      max-width: 900px

    .genres
      float: right
      margin-top: 20px

.episodes
  width: 100%

.genres
  list-style: none
  li
    display: inline-block
    margin-right: 3px
    font-style: italic

  li:after
    content: ","
  li:last-child:after
    content: ''

</style>
