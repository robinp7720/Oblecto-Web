<template>
  <div class="container">
    <div class="show-info">
      <div class="left">
        <transition-group
          name="staggered-fade"
          tag="ul"
          v-bind:css="false"
          v-on:before-enter="beforeEnter"
          v-on:enter="enter"
          v-on:leave="leave"
        >
        <Show
              v-bind:title="showData.seriesName"
              v-bind:tvdbId="showData.tvdbid"
              v-bind:watching="showData.watching"
              v-bind:key="showData.id"
              v-bind:id="showData.id"
              v-bind:show="showData"
        ></Show>
        </transition-group>
      </div>
      <div class="right">
        <div class="info">
          <h2>{{ showData.seriesName }}</h2>
          <span id="year">{{ showData.firstAired }}</span>
          <p>
            {{ showData.overview }}
          </p>
          <ul class="genres"><li class="genre" v-for="genre in showData.genre">{{ genre }}</li></ul>
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
  </div>
</template>

<script>
  import Show from '@/components/itemTypes/Show'
  import WatchPanel from '@/components/WatchPanel'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import axios from 'axios'
  import Velocity from 'velocity-animate'

  export default {
    name: 'seriesView',
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
    created () {
      axios.get('/series/' + this.$route.params.seriesId + `/info`)
        .then(response => {
          this.showData = response.data
          console.log(response)
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
          console.log(this.series)
        })
        .catch(e => {
          console.log(e)
        })
    },
    methods: {
      beforeEnter: function (el) {
        el.style.opacity = 0
        el.style.height = 0
      },
      enter: function (el, done) {
        var delay = el.dataset.index * 150
        setTimeout(function () {
          Velocity(
            el,
            { opacity: 1, width: '136px' },
            { complete: done }
          )
        }, delay)
      },
      leave: function (el, done) {
        var delay = el.dataset.index * 150
        setTimeout(function () {
          Velocity(
            el,
            { opacity: 0, width: 0 },
            { complete: done }
          )
        }, delay)
      }
    },
    watch: {
      '$route' (to, from) {
        console.log(to, from)
        this.series = {}
        axios.get('/series/' + this.$route.params.seriesId + `/info`)
          .then(response => {
            this.showData = response.data
            console.log(response)
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
            console.log(this.series)
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

.staggered-fade-move
  transition: transform 1s

.info
  margin-top: -5px
  background-color: rgba(0,0,0,0.3)

  padding: 20px 30px

  -webkit-border-radius: 3px
  -moz-border-radius: 3px
  border-radius: 3px
  margin: 0 10px

  @media screen and (min-height: 800px)
    margin: 0
    margin-right: 20px

  //box-shadow: 0px 0px 5px 2px rgba(darken(#55535b, 20), 0.75)
  h2
    margin-top: 5px

.show-info
  overflow: hidden

.left
  width: 100%
  float: left
  overflow: hidden
  text-align: center
  @media screen and (min-height: 800px)
    width: 25%
    float: left
    overflow: hidden
    ul
      position: fixed
      right: 75%
      min-height: 10px



.right
  width: 100%
  float: right
  padding-right: 0
  overflow: hidden
  @media screen and (min-height: 800px)
    width: 75%
    float: right
    padding: 0 20px
    padding-right: 0
    overflow: hidden
p
  max-width: 700px
  font-weight: 300
  line-height: 1.5em
  font-family: Poppins, Ubuntu, Lato, sans-serif
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
