<template>
  <div class="playBar">
    <div class="bar">
    <span class="title" >{{ playing.title }}</span>
      <div class="right">
    <span v-on:click="showVideo = !showVideo" class="toggle-button"><FontAwesomeIcon :icon="showVideo? iconDown : iconUp" /></span>
      </div>
  </div>

    <div class="player" v-bind:class="{ hidden: !showVideo }">
      <video-player class="video-player-box"
                    ref="videoPlayer"
                    :options="playerOptions"
                    :playsinline="false"

                    @play="onPlayerPlay($event)"
                    @pause="onPlayerPause($event)"
                    @ended="onPlayerEnded($event)"
                    @waiting="onPlayerWaiting($event)"
                    @playing="onPlayerPlaying($event)"
                    @loadeddata="onPlayerLoadeddata($event)"
                    @timeupdate="onPlayerTimeupdate($event)"
                    @canplay="onPlayerCanplay($event)"
                    @canplaythrough="onPlayerCanplaythrough($event)"

                    @statechanged="playerStateChanged($event)"
                    @ready="playerReadied">
      </video-player>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faDown from '@fortawesome/fontawesome-free-solid/faAngleDown'
  import faUp from '@fortawesome/fontawesome-free-solid/faAngleUp'
  import { mapState } from 'vuex'

  export default {
    components: {
      FontAwesomeIcon
    },
    name: 'play-bar',
    data () {
      return {
        showVideo: false,
        firstSinceNewsource: false,
        shouldAutoPlay: false,
        playerOptions: {
          // videojs options
          autoplay: false,
          fluid: false,
          muted: false,
          language: 'en',
          playbackRates: [0.7, 1.0, 1.5, 2.0],
          sources: [{
          }],
          poster: '/static/images/author.jpg'
        }
      }
    },
    mounted () {

    },
    computed: {
      player () {
        return this.$refs.videoPlayer.player
      },
      iconUp () {
        return faUp
      },
      iconDown () {
        return faDown
      },
      ...mapState(['playing'])
    },

    watch: {
      playing: function (newState, oldState) {
        this.showVideo = true
        this.firstSinceNewsource = true
        this.player.src([
          {type: 'video/mp4', src: this.axios.defaults.baseURL + '/episode/' + newState.entity.id + '/play'}
        ])
      }
    },
    methods: {
      // listen event
      onPlayerPlay (player) {
        // console.log('player play!', player)
      },
      onPlayerPause (player) {
        // console.log('player pause!', player)
      },
      // ...player event

      onPlayerEnded (player) {

      },

      onPlayerPlaying (player) {

      },

      onPlayerWaiting (player) {

      },

      onPlayerLoadeddata (player) {

      },

      onPlayerTimeupdate (player) {
        this.$socket.emit('playing', {
          time: player.currentTime(),
          progress: player.currentTime() / player.duration(),
          tvshowId: this.playing.entity.tvshow.tvdbid,
          episodeId: this.playing.entity.id,
          type: 'tv'
        })
      },

      onPlayerCanplay (player) {
        if (this.firstSinceNewsource) {
          this.shouldAutoPlay = true
          this.firstSinceNewsource = false
          this.player.currentTime(this.playing.entity.trackEpisodes[0].time)
        }
        if (this.shouldAutoPlay) {
          player.play()
          this.shouldAutoPlay = true
        }
      },

      onPlayerCanplaythrough (player) {

      },

      // or listen state event
      playerStateChanged (playerCurrentState) {

      },

      // player is ready
      playerReadied (player) {

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

    background: -moz-linear-gradient(top, lighten(#3c3737, 15) 0%, lighten(#3c3737, 12) 100%)
    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

  .player
    position: fixed
    top: 0
    height: calc(100% - 59px)
    width: 100%

    background: rgba(0,0,80,0.9)
    z-index: 5

    transition: top 0.2s
  
  .hidden
    top: 100%

  .right
    float: right

  .player .video-js
    height: 100%
    position: absolute
    top: 0
    left: 0
    width: 100%
    z-index: 110

  .toggle-button
    cursor: pointer



</style>
