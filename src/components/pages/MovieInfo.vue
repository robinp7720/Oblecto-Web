<template>
  <div class="container">
    <div class="movie">
      <div ref="infoContainer" class="info-container" v-if="movieData.id" v-bind:style="{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255, 0) 40%, ' + endGradient + ' 80%), url(' + host + '/movie/' + movieData.id + '/fanart)' }">
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

      <MovieList v-for="(set, index) in sets"
                 v-bind:title="set.setName"
                 v-bind:key="set.id"
                 v-bind:movies="set.movies"
      ></MovieList>
    </div>
  </div>
</template>

<script>
  import MovieList from '@/components/itemLists/MovieList'
  import { mapState } from 'vuex'
  import axios from 'axios'

  export default {
    name: 'MovieInfo',
    components: {
      MovieList
    },
    data () {
      return {
        'movieData': {},
        'sets': [],
        'endGradient': '',
        'infoBottom': 0
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
      },
      update: async function () {
        this.movieData = (await axios.get('/movie/' + this.$route.params.movieId + `/info`)).data
        this.sets = (await axios.get(`/movie/${this.$route.params.movieId}/sets`)).data
      },
      gradientColor: function () {
        let infoBottom = this.$refs.infoContainer.getBoundingClientRect().bottom

        let wh = window.innerHeight
        let st = (wh * 0.36)

        var w1 = infoBottom / st

        var w2 = 1 - w1

        var rgb = [
          Math.round(105 * w2 + 85 * w1),
          Math.round(96 * w2 + 83 * w1),
          Math.round(96 * w2 + 91 * w1)
        ]

        if ((infoBottom - st) < 0) {
          return rgb
        }

        w1 = ((infoBottom - st)) / (wh - st)
        w2 = 1 - w1

        console.log(w1, w2)

        rgb = [
          Math.round(85 * w2 + 40 * w1),
          Math.round(83 * w2 + 52 * w1),
          Math.round(91 * w2 + 59 * w1)
        ]
        return rgb
      },
      updateGradient: function () {
        let g = this.gradientColor()
        this.endGradient = `rgb(${g[0]}, ${g[1]}, ${g[2]})`
      }
    },
    async mounted () {

    },
    async created () {
      await this.update()
      let g = this.gradientColor()
      this.endGradient = `rgb(${g[0]}, ${g[1]}, ${g[2]})`
      window.addEventListener('resize', this.updateGradient)
      window.addEventListener('scroll', this.updateGradient)
    },
    async beforeDestroy () {
      window.removeEventListener('resize', this.updateGradient)
      window.removeEventListener('scroll', this.updateGradient)
    },
    watch: {
      async '$route' (to, from) {
        await this.update()
      }
    }
  }
</script>

<style scoped lang="sass">

  .info-container
    margin-top: -20px

    padding: 10px 10px
    padding-top: 400px

    background-size: cover
    background-position: center 0

    position: relative

    z-index: 0

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
    top: calc(50% - 50px)
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
