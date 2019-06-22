<template>
  <div class="container">
    <div class="movie">
      <div class="info-container" v-if="movieData.id">
        <div class="info">
          <div class="poster">
            <img v-bind:src="host + '/movie/' + movieData.id + '/poster'" alt="">
            <a class="play" v-on:click="playMovie"><i class="fa fa-play" aria-hidden="true"></i></a>
          </div>
          <div class="right">
            <h2>{{ movieData.movieName }}</h2>
            <span class="year">First released on {{ movieData.releaseDate }}</span>
            <p>
              {{ movieData.overview }}
            </p>
            <ul class="genres"><li class="genre" v-for="genre in movieData.genre">{{ genre }}</li></ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Movie from '@/components/itemTypes/Movie'
  import WatchPanel from '@/components/WatchPanel'
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import { mapState } from 'vuex'
  import axios from 'axios'

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
    computed: mapState([
      'host'
    ]),
    methods: {
      playMovie: function (event) {
        event.preventDefault()
        this.$store.dispatch('playMovie', this.movieData.id)
      },
      openModal: function (event) {
        this.$modal.show('MovieDialog', { movie: this.movieData })
      }
    },
    async created () {
      this.movieData = (await axios.get('/movie/' + this.$route.params.movieId + `/info`)).data
    },
    watch: {
      async '$route' (to, from) {
        this.movieData = (await axios.get('/movie/' + this.$route.params.movieId + `/info`)).data
      }
    }
  }
</script>

<style scoped lang="sass">

  .info-container
    padding: 0 10px
    padding-top: 50px

  .info
    font-size: 1em
    border-radius: 3px
    background: #696060
    box-shadow: 0px 2px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)
    padding-bottom: 40px

    min-height: 270px

    .poster
      position: relative

      height: 300px
      float: left
      margin-right: 20px
      box-shadow: 0px 2px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)
      border-radius: 3px
      overflow: hidden

      margin-top: -50px
      margin-left: 20px
      margin-bottom: 20px

      @media screen and (max-width: 700px)
        height: 200px

      img
        height: 100%

    .right
      padding: 20px

      h2
        padding: 0
        font-size: 1.2em
        margin: 0
        margin-bottom: 5px

      .year, .genres
        color: rgba(250, 240, 240, 0.6)
        margin-bottom: 10px
        padding: 0
        font-weight: normal

      p
        color: rgba(250, 240, 240, 0.9)
        margin: 0
        padding: 0
        margin-top: 20px

        max-width: 900px

      .genres
        float: right
        margin-top: 20px

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

  a
    color: white
    margin: 0 5px
    cursor: pointer

  .fa
    margin-left: 10px

  a.play
    opacity: 0
    display: block
    font-size: 4em
    margin: 0
    width: 100px
    height: 100px

    position: absolute
    top: 100px
    left: calc(50% - 50px)

    background-color: rgba(0,0,0,0.5)
    border: 2px solid white
    border-radius: 100%
    text-align: center
    line-height: 100px
    transition: opacity 0.2s

  .poster:hover a.play
    opacity: 0.4

  a.play:hover
    opacity: 1 !important




</style>
