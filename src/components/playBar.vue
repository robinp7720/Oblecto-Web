<template>
  <div class="playBar" ref="playbar" v-on:mousemove="playbarTimeout = 0">

    <div class="player" v-bind:class="{ small: format === 2, hidden: !showVideo}">
      <video ref="videoPlayer"></video>
    </div>

    <div class="bar" ref="bar" v-bind:class="{hiddenBar: !(playbarTimeout < 20 || format === 2)}">

      <div class="progressbarContainer" v-on:click="seek">
        <div v-bind:class="{loading}" class="progressbar" v-bind:style="{ width: progress * 100 + '%' }"></div>
      </div>

      <span class="title">{{ playing.title }}</span>

      <div class="right">
        <span class="time" v-if="showVideo">
          {{ PlayTimeDisplayValue }} / {{ DurationDisplayValue }}
        </span>

        <a v-on:click="playNext" v-if="progress > 0.9 & playing.type === 'episode'">Next Episode</a>

        <div class="quality-selector" v-if="qualityPopUp">
          <ul>
            <li
              v-for="(FileIterator, index) in playing.entity.files"
              v-bind:key="FileIterator.id"
              v-on:click="changeFileId(index)"
              v-bind:class="{selected: index === PlayingFileID}"
            >
              {{ FileIterator.name }} <span class="badge">{{ FileIterator.extension }}</span>
            </li>
          </ul>
        </div>



        <span v-on:click="qualityPopUp = !qualityPopUp" v-if="showVideo" class="toggle-button">
          <FontAwesomeIcon :icon="iconCog"/>
        </span>

        <span v-on:click="stopPlaying" v-if="showVideo" class="toggle-button">
          <FontAwesomeIcon :icon="iconStop"/>
        </span>

        <span v-on:click="playPause" class="toggle-button" v-if="showVideo">
          <FontAwesomeIcon :icon="paused? iconPlay : iconPause"/>
        </span>

        <span v-on:click="toggleFullScreen" class="toggle-button" v-if="showVideo && fullscreenEnabled">
          <FontAwesomeIcon :icon="format === 3? iconDeFullscreen: iconFullscreen"/>
        </span>

        <span v-on:click="format = (format % 2) + 1" class="toggle-button" v-if="showVideo && format !== 3">
          <FontAwesomeIcon :icon="format === 1 ? iconDown : iconUp"/>
        </span>
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
  import faFullscreen from '@fortawesome/fontawesome-free-solid/faExpandArrowsAlt'
  import faDeFullscreen from '@fortawesome/fontawesome-free-solid/faCompress'
  import faCog from '@fortawesome/fontawesome-free-solid/faCog'

  import { mapState } from 'vuex'

  export default {
    components: {
      FontAwesomeIcon
    },
    name: 'play-bar',
    data () {
      return {
        paused: true,
        progress: 0,

        loading: false,

        format: 1, //  1 = large screen, 2 = Small View, 3 = Fullscreen

        fullscreenEnabled: document.fullscreenEnabled,
        initialProgress: 0,
        playbarTimeout: 0,
        showVideo: false,
        nextepisode: false,
        qualityPopUp: false,

        PlayingFileID: 0
      }
    },
    computed: {
      player () {
        return this.$refs.videoPlayer
      },
      playbar () {
        return this.$refs.playbar
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
      iconFullscreen () {
        return faFullscreen
      },
      iconDeFullscreen () {
        return faDeFullscreen
      },
      PlayTimeDisplayValue () {
        let hours = ('0' + Math.floor(this.progress * this.playing.entity.files[this.PlayingFileID].duration / (60 * 60))).substr(-2)
        let mins = ('0' + Math.floor(this.progress * this.playing.entity.files[this.PlayingFileID].duration / 60) % 60).substr(-2)
        let seconds = ('0' + Math.floor(this.progress * this.playing.entity.files[this.PlayingFileID].duration) % 60).substr(-2)

        return `${hours}:${mins}:${seconds}`
      },

      DurationDisplayValue () {
        let hours = ('0' + Math.floor(this.playing.entity.files[this.PlayingFileID].duration / (60 * 60))).substr(-2)
        let mins = ('0' + Math.floor(this.playing.entity.files[this.PlayingFileID].duration / 60) % 60).substr(-2)
        let seconds = ('0' + Math.floor(this.playing.entity.files[this.PlayingFileID].duration) % 60).substr(-2)

        return `${hours}:${mins}:${seconds}`
      },
      iconCog () {
        return faCog
      },
      ...mapState(['playing'])
    },
    methods: {
      changeFileId: function (id) {
        this.PlayingFileID = id
        this.loading = true

        this.qualityPopUp = false

        if (this.playing.entity.trackMovies !== undefined && this.playing.entity.trackMovies[0] !== undefined) {
          this.playing.entity.trackMovies[0].time = this.initialProgress + this.player.currentTime
        } else if (this.playing.entity.trackEpisodes !== undefined && this.playing.entity.trackEpisodes[0] !== undefined) {
          this.playing.entity.trackEpisodes[0].time = this.initialProgress + this.player.currentTime
        }

        let tracking = this.playing.entity.trackMovies || this.playing.entity.trackEpisodes

        this.initialProgress = 0

        if (this.playing.entity.files[this.PlayingFileID].extension !== 'mp4') {
          if (tracking[0] !== undefined) {
            this.initialProgress = tracking[0].time
          }
        }

        this.player.src = ''

        this.updateURL()
      },
      updateURL: function () {
        if (this.playing.entity.files[this.PlayingFileID].extension !== 'mp4') {
          this.player.src = `${this.axios.defaults.baseURL}/stream/${this.playing.entity.files[this.PlayingFileID].id}/${this.initialProgress}`
        } else {
          this.player.src = `${this.axios.defaults.baseURL}/stream/${this.playing.entity.files[this.PlayingFileID].id}`
        }
      },
      seek: function (event) {
        // Calculate the offset in seconds from where the user clecked on the seekbar
        let position = this.playing.entity.files[this.PlayingFileID].duration * event.clientX / document.documentElement.clientWidth

        // If the file isn't an mp4 file, the broweser most likely won't be able to seek it. Therefore
        // server-side seeking must be used

        /* TODO: Client should also ask the server if server side real time transcoding is enabled. If it's not, it
            should tell the user that the file cannot be streamed if the client does not natively support it */

        if (this.playing.entity.files[this.PlayingFileID].extension !== 'mp4') {
          if (position < this.initialProgress + this.player.duration &&
            position - this.initialProgress > 0) {
            this.player.currentTime = position - this.initialProgress

            return
          }

          this.initialProgress = position
          this.updateURL()
        } else {
          this.player.currentTime = position
        }
      },
      toggleFullScreen: function () {
        if (
          document.fullscreenEnabled &
          this.format !== 3
        ) {
          this.playbar.requestFullscreen()
          this.format = 3
        } else {
          document.exitFullscreen()
          this.format = 1
        }
      },
      stopPlaying: function () {
        this.player.src = ''

        this.$store.dispatch('clearPlaying')
        this.$store.dispatch('updateWatching')

        this.showVideo = false
        this.qualityPopUp = false
        this.paused = true
        this.loading = false
        this.progress = 0
      },
      playPause: function () {
        if (this.player.paused) {
          this.paused = false
          return this.player.play()
        }

        this.paused = true
        this.player.pause()
      },
      playNext: function () {
        this.$store.dispatch('playEpisode', this.nextepisode.id)
      }
    },
    watch: {
      playing: async function (newState, oldState) {
        this.initialProgress = 0
        this.progress = 0
        this.PlayingFileID = 0

        if (this.playing.entity === undefined) {
          return
        }

        this.loading = true

        this.showVideo = true

        let tracking = this.playing.entity.trackMovies || this.playing.entity.trackEpisodes

        if (this.playing.entity.files[this.PlayingFileID].extension !== 'mp4') {
          if (tracking[0] !== undefined) {
            this.initialProgress = tracking[0].time
          }
        }

        this.updateURL()

        this.nextepisode = (await this.axios.get(`/episode/${this.playing.entity.id}/next`)).data
      }
    },
    mounted: function () {
      this.player.addEventListener('waiting', () => {
        this.loading = true
      })

      this.player.addEventListener('playing', () => {
        this.paused = false
        this.loading = false
      })

      this.player.addEventListener('pause', () => {
        this.paused = true
      })

      this.player.addEventListener('play', () => {
        this.paused = false
      })

      this.player.addEventListener('ended', () => {
        this.$store.dispatch('updateWatching')
      })

      this.player.addEventListener('loadedmetadata', () => {
        let tracking = this.playing.entity.trackMovies || this.playing.entity.trackEpisodes

        if (tracking[0]) {
          this.player.currentTime = tracking[0].time - this.initialProgress
        }

        this.player.play()
        this.paused = false
        this.loading = false
      })

      this.player.addEventListener('timeupdate', () => {
        if (this.playing.entity === undefined) {
          this.playbarTimeout = 0

          return
        }

        if (this.playbarTimeout < 20) {
          this.playbarTimeout += 1
        }

        this.progress = (this.initialProgress + this.player.currentTime) / this.playing.entity.files[this.PlayingFileID].duration

        switch (this.playing.type) {
          case 'episode':
            this.$socket.emit('playing', {
              time: this.initialProgress + this.player.currentTime,
              progress: this.progress,
              episodeId: this.playing.entity.id,
              type: 'tv'
            })
            break
          case 'movie':
            this.$socket.emit('playing', {
              time: this.initialProgress + this.player.currentTime,
              progress: this.progress,
              movieId: this.playing.entity.id,
              type: 'movie'
            })
            break
        }
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">

  video
    width: 100%
    height: 100%

  .playBar
    height: 100%
    position: fixed
    z-index: 10

    .bar
      position: fixed
      bottom: 0

      transition: bottom 0.2s

      padding: 20px
      padding-top: 25px
      width: 100%

      color: #eee

      z-index: 1000

      background: -moz-linear-gradient(to bottom, lighten(#3c3737, 15) 0%, lighten(#3c3737, 12) 100%)
      background: -webkit-linear-gradient(to bottom, lighten(#3c3737, 15) 0%, lighten(#3c3737, 12) 100%)
      background: linear-gradient(to bottom, lighten(#3c3737, 15) 0%, lighten(#3c3737, 12) 100%)
      box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000, 6), 0.75)

    .hiddenBar
      bottom: -64px

    .player
      position: fixed
      bottom: 0
      height: 100%
      width: 100%

      background: black
      z-index: 5

      transition: top 0.2s, height 0.2s, width 0.2s

    .small
      height: 200px
      width: auto
      bottom: 74px
      right: 10px
      border-radius: 3px
      overflow: hidden
      -webkit-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75)
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75)

      video
        width: auto

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

  .progressbarContainer
    height: 10px
    position: absolute
    top: 0
    left: 0
    width: 100%

    background-color: rgba(0,0,0,0.25)

    box-shadow: inset 0px 0px 5px 0px rgba(0,0,0,0.5)

    cursor: pointer

  .progressbar
    height: 100%
    background-color: #ae6600

    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75)


  @keyframes loading
    from
      left: -10%
    to
      left: 100%

  .loading
    width: 10% !important
    position: relative
    animation-name: loading
    animation-timing-function: linear
    animation-iteration-count: infinite
    animation-duration: 4s

  .quality-selector
    position: fixed
    bottom: 50px
    right: 10px
    width: auto
    background: #696060
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75)

    ul
      list-style: none
      border-radius: 3px
      li
        padding: 20px
        cursor: pointer
      li.selected
        background-color: rgba(0,0,0,0.3)
      li:hover
          background-color: rgba(0,0,0,0.5)




</style>
