<template>
  <div class="container">
    <div class="movie">
      <div ref="infoContainer"
           class="info-container"
           v-if="movieData.id"
           :style="{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255, 0) 40%, ' + endGradient + ' 80%), url(' + host + '/movie/' + movieData.id + '/fanart)' }">
        <div class="info" v-if="posterLoaded">
          <div class="poster">
            <img :src="posterUrl" alt="">
            <a class="play" v-on:click="playMovie"><i class="fa fa-play" aria-hidden="true"></i></a>
          </div>
          <div class="right">
            <h2>{{ movieData.movieName }}</h2>
            <span class="year">First released on {{ movieData.releaseDate }}</span>
            <p>
              {{ movieData.overview }}
            </p>
            <ul class="genres">
              <li class="genre" v-for="genre in movieData.genre">{{ genre }}</li>
            </ul>
          </div>
        </div>
      </div>

      <FileList :files="movieData.Files"></FileList>

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
import FileList from '@/components/files/FileList'

import { mapState } from 'vuex'
import axios from 'axios'

export default {
  name: 'MovieInfo',
  components: { MovieList, FileList },
  data () {
    return {
      'movieData': {},
      'sets': [],
      'endGradient': '',
      'infoBottom': 0,
      posterLoaded: false,
      posterUrl: 'data:image/png;base64,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'
    }
  },
  computed: {
    ...mapState([
      'host'
    ])
  },
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

      const posterImage = new Image()
      posterImage.src = this.host + '/movie/' + this.movieData.id + '/poster'

      posterImage.onload = () => {
        this.posterUrl = posterImage.src
        this.posterLoaded = true
      }

      posterImage.onerror = () => {
        this.posterLoaded = true
      }
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
    this.updateGradient()
  },

  async updated () {
    this.updateGradient()
  },

  async created () {
    await this.update()
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
  box-shadow: 0px 2px 5px 2px rgba(darken(darken(#696060,17) + #000000, 6), 0.75)
  padding-bottom: 40px

  min-height: 270px

  .poster
    position: relative

    height: 300px
    float: left
    margin-right: 20px
    box-shadow: 0px 2px 5px 2px rgba(darken(darken(#696060,17) + #000000, 6), 0.75)
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

  background-color: rgba(0, 0, 0, 0.5)
  border: 2px solid white
  border-radius: 100%
  text-align: center
  line-height: 100px
  transition: opacity 0.2s

.poster:hover a.play
  opacity: 0.4

a.play:hover
  opacity: 1 !important

.error
  background: #694040
  box-shadow: 0px 0px 2px 2px rgba(darken(darken(#694040,17) + #000000, 6), 0.75)

  padding: 10px

  border-spacing: 0

  list-style: none

  width: 100%

  border-radius: 3px
  overflow: hidden

  text-align: center


</style>
