<template>
  <div class="container">
    <div class="movie-info">
      <div class="left">
        <transition-group
          name="staggered-fade"
          tag="ul"
          v-bind:css="false"
          v-on:before-enter="beforeEnter"
          v-on:enter="enter"
          v-on:leave="leave"
        >
        <Movie
              v-bind:title="movieData.movieName"
              v-bind:movieId="movieData.id"
              v-bind:watching="movieData.watching"
              v-bind:key="movieData.id"
              v-bind:movie="movieData"
        ></Movie>
        </transition-group>
      </div>
      <div class="right">
        <div class="info">
          <h2>{{ movieData.movieName }}</h2>
          <p>
            {{ movieData.overview }}
          </p>
          <ul class="genres"><li class="genre" v-for="genre in movieData.genre">{{ genre }}</li></ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Movie from '@/components/itemTypes/Movie'
  import WatchPanel from '@/components/WatchPanel'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import axios from 'axios'
  import Velocity from 'velocity-animate'

  export default {
    name: 'MovieInfo',
    components: {
      Movie,
      WatchPanel: WatchPanel,
      EpisodeList: EpisodeList
    },
    data () {
      return {
        'movieData': {}
      }
    },
    async created () {
      this.movieData = (await axios.get('/movie/' + this.$route.params.movieId + `/info`)).data
      console.log(this.movieData)
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
      async '$route' (to, from) {
        this.movieData = await axios.get('/movie/' + this.$route.params.movieId + `/info`).data
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
