<template>
  <div class="playBar">
    <div class="player" v-bind:class="{ small: !showVideo, hidden: !url}">
      <video ref="videoPlayer" controls></video>
    </div>
    <div class="bar">
      <div class="progressbar" v-bind:style="{ width: progress * 100 + '%' }"></div>
      <span class="title">{{ playing.title }}</span>
      <div class="right">
        <span v-on:click="stopPlaying" v-if="url" class="toggle-button"><FontAwesomeIcon
          :icon="iconStop"/></span>
        <span v-on:click="playPause" class="toggle-button" v-if="url"><FontAwesomeIcon
          :icon="paused? iconPlay : iconPause"/></span>
        <span v-on:click="showVideo = !showVideo" class="toggle-button" v-if="url"><FontAwesomeIcon
          :icon="showVideo? iconDown : iconUp"/></span>
      </div>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'

  import faDown from '@fortawesome/fontawesome-free-solid/faAngleDown'
  import faUp from '@fortawesome/fontawesome-free-solid/faAngleUp'
  import faStop from '@fortawesome/fontawesome-free-solid/faStop'
  import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
  import faPause from '@fortawesome/fontawesome-free-solid/faPause'

  import { mapState } from 'vuex'

  export default {
    components: {
      FontAwesomeIcon
    },
    name: 'play-bar',
    data () {
      return {
        progress: 0,
        url: '',
        showVideo: false,
        firstSinceNewsource: false,
        shouldAutoPlay: false,
        paused: true
      }
    },
    computed: {
      player () {
        return this.$refs.videoPlayer
      },
      iconUp () {
        return faUp
      },
      iconDown () {
        return faDown
      },
      iconStop () {
        return faStop
      },
      iconPlay () {
        return faPlay
      },
      iconPause () {
        return faPause
      },
      ...mapState(['playing'])
    },
    methods: {
      stopPlaying: function () {
        this.player.src = ''
        this.url = ''
        this.$store.dispatch('clearPlaying')
        this.paused = true
      },
      playPause: function () {
        if (this.player.paused) {
          this.paused = false
          return this.player.play()
        }

        this.paused = true
        this.player.pause()
      }
    },
    watch: {
      playing: function (newState, oldState) {
        this.showVideo = true
        this.firstSinceNewsource = true

        switch (this.playing.type) {
          case 'episode':
            this.url = this.axios.defaults.baseURL + '/episode/' + newState.entity.id + '/play'
            break
          case 'movie':
            this.url = this.axios.defaults.baseURL + '/movie/' + newState.entity.id + '/play'
            break
        }

        this.player.src = this.url

        this.player.addEventListener('loadedmetadata', () => {
          let tracking = this.playing.entity.trackEpisodes || this.playing.entity.trackMovies

          if (!tracking[0]) {
            this.player.play()
            this.pause = false
            return
          }
  
          this.player.currentTime = tracking[0].time
          this.player.play()
          this.paused = false
        })

        this.player.addEventListener('timeupdate', () => {
          this.progress = this.player.currentTime / this.player.duration

          switch (this.playing.type) {
            case 'episode':
              this.$socket.emit('playing', {
                time: this.player.currentTime,
                progress: this.player.currentTime / this.player.duration,
                episodeId: this.playing.entity.id,
                type: 'tv'
              })
              break
            case 'movie':
              this.$socket.emit('playing', {
                time: this.player.currentTime,
                progress: this.player.currentTime / this.player.duration,
                movieId: this.playing.entity.id,
                type: 'movie'
              })
              break
          }
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">

  .playBar
    height: 100%
    position: fixed
    z-index: 10

    .bar
      position: fixed
      bottom: 0
      padding: 20px
      width: 100%

      color: #eee

      z-index: 1000

      background: -moz-linear-gradient(to bottom, lighten(#3c3737, 15) 0%, lighten(#3c3737, 12) 100%)
      background: -webkit-linear-gradient(to bottom, lighten(#3c3737, 15) 0%, lighten(#3c3737, 12) 100%)
      background: linear-gradient(to bottom, lighten(#3c3737, 15) 0%, lighten(#3c3737, 12) 100%)
      box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000, 6), 0.75)

    .player
      position: fixed
      top: 0
      height: calc(100% - 59px)
      width: 100%

      background: black
      z-index: 5

      transition: top 0.2s, height 0.2s, width 0.2s

    .small
      height: 200px
      width: auto
      top: calc(100% - 269px)
      right: 10px
      border-radius: 3px
      overflow: hidden
      -webkit-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75)
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75)
      @media only screen and (max-width: 600px)
        height: 100px
        top: calc(100% - 169px)
      @media only screen and (max-height: 600px)
        height: 100px
        top: calc(100% - 169px)

    .hidden
      top: 100%

    .right
      float: right

    .toggle-button
      cursor: pointer

  video
    width: 100%
    height: 100%

  .progressbar
    height: 5px
    background-color: #ae6600
    position: absolute
    top: 0
    left: 0



</style>
