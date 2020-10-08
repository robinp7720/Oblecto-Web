<template>
  <div class="playBar" ref="playbar" v-on:mousemove="playbarTimeout = 0" v-bind:class="{hiddenBar: !(playbarTimeout < 20 || playSizeFormat === 2)}">

    <div class="player" v-bind:class="{ small: playSizeFormat === 2, hidden: (!showVideo || (playSizeFormat === 2 && browserSupportsPiP))}">
      <video ref="videoPlayer"></video>
    </div>

    <div class="bar" ref="bar">

      <div class="progressbarContainer" v-on:click="seek">
        <div v-bind:class="{loading}" class="progressbar" v-bind:style="{ width: progress * 100 + '%' }"></div>
        <div class="progressbarload" v-bind:style="{ width: (initialProgress + $refs.videoPlayer.buffered.end($refs.videoPlayer.buffered.length - 1)) / playing.entity.Files[PlayingFileID].duration * 100 + '%' }" v-if="$refs.videoPlayer && $refs.videoPlayer.buffered.length > 0"></div>
      </div>

      <span class="seriesid" v-if="playing.type === 'episode'" v-on:click="viewShow"> {{ playing.entity.Series.seriesName }} S{{ playing.entity.airedSeason }}E{{ playing.entity.airedEpisodeNumber }}: </span>
      <span class="title">{{ playing.title }}</span>

      <div class="right">
        <span class="time" v-if="showVideo">
          {{ PlayTimeDisplayValue }} / {{ DurationDisplayValue }}
        </span>

        <div class="quality-selector" v-if="qualityPopUp">
          <ul>
            <li
              v-for="(FileIterator, index) in playing.entity.Files"
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
          <FontAwesomeIcon :icon="playSizeFormat === 3? iconDeFullscreen: iconFullscreen"/>
        </span>

        <span v-on:click="playSizeFormat = (playSizeFormat % 2) + 1" class="toggle-button" v-if="showVideo && playSizeFormat !== 3">
          <FontAwesomeIcon :icon="playSizeFormat === 1 ? iconDown : iconUp"/>
        </span>

        <a v-on:click="playNext" v-if="progress > 0.9 & playing.type === 'episode'" class="nextepisode">Next Episode</a>
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

  let SCREEN_FORMAT = {
    'LARGE': 1,
    'SMALL': 2,
    'FULLSCREEN': 3
  }

  let AUTOPLAY_TIME_LEFT_THRESHOLD = 5
  let IGNORE_RESTORE_PROGRESS_THRESHOLD = 0.9

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

        fullscreenEnabled: document.fullscreenEnabled || false, // Does the client support putting content in a fullscreen state?
        browserSupportsPiP: document.pictureInPictureEnabled || false,

        initialProgress: 0,
        playbarTimeout: 0,
        showVideo: false,
        nextepisode: false,
        qualityPopUp: false,

        autoplaying: false,

        PlayingFileID: 0,

        shouldPreSeek: true,
        playSizeFormat: SCREEN_FORMAT.SMALL,

        playbackSession: {}
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
        let hours = ('0' + Math.floor(this.progress * this.playing.entity.Files[this.PlayingFileID].duration / (60 * 60))).substr(-2)
        let mins = ('0' + Math.floor(this.progress * this.playing.entity.Files[this.PlayingFileID].duration / 60) % 60).substr(-2)
        let seconds = ('0' + Math.floor(this.progress * this.playing.entity.Files[this.PlayingFileID].duration) % 60).substr(-2)

        return `${hours}:${mins}:${seconds}`
      },

      DurationDisplayValue () {
        let hours = ('0' + Math.floor(this.playing.entity.Files[this.PlayingFileID].duration / (60 * 60))).substr(-2)
        let mins = ('0' + Math.floor(this.playing.entity.Files[this.PlayingFileID].duration / 60) % 60).substr(-2)
        let seconds = ('0' + Math.floor(this.playing.entity.Files[this.PlayingFileID].duration) % 60).substr(-2)

        return `${hours}:${mins}:${seconds}`
      },
      iconCog () {
        return faCog
      },
      ...mapState(['playing', 'autoplay'])
    },
    methods: {
      viewShow: function () {
        if (this.playing.type === 'episode') {
          this.$router.push({ name: 'SeriesView', params: { seriesId: this.playing.entity.Series.id } })
          this.playSizeFormat = SCREEN_FORMAT.SMALL
        }
      },
      changeFileId: async function (id) {
        this.updateLocalTracker()

        let tracking = this.playing.entity.TrackMovies || this.playing.entity.TrackEpisodes

        this.PlayingFileID = id

        await this.updateSession()

        if (this.playbackSession.seeking === 'server') {
          if (tracking[0] !== undefined) {
            this.initialProgress = tracking[0].time
          }
        } else {
          this.initialProgress = 0
          this.shouldPreSeek = true
        }

        this.qualityPopUp = false

        this.loading = true
        this.setURL()
      },
      updateSession: async function () {
        this.playbackSession = (await this.axios.get(`/session/create/${this.playing.entity.Files[this.PlayingFileID].id}`)).data
      },
      updateURL: async function () {
        await this.updateSession()
        this.setURL()
      },
      setURL: function () {
        let token = this.playbackSession.sessionId

        if (this.playbackSession.seeking === 'server') {
          this.player.src = `${this.axios.defaults.baseURL}/session/stream/${token}?offset=${this.initialProgress}`
        } else {
          this.player.src = `${this.axios.defaults.baseURL}/session/stream/${token}`
        }
      },
      seek: function (event) {
        // Calculate the offset in seconds from where the user clicked on the seekbar
        let position = this.playing.entity.Files[this.PlayingFileID].duration * event.clientX / document.documentElement.clientWidth

        if (this.playbackSession.seeking === 'server') {
          if (position < this.initialProgress + this.player.duration && position - this.initialProgress > 0) {
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
        if (this.playSizeFormat !== SCREEN_FORMAT.FULLSCREEN) {
          this.playSizeFormat = SCREEN_FORMAT.FULLSCREEN
        } else {
          this.playSizeFormat = SCREEN_FORMAT.LARGE
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
        this.autoplaying = false
        this.progress = 0

        this.playSizeFormat = SCREEN_FORMAT.SMALL
      },
      playPause: function (event) {
        event.preventDefault()

        this.paused = !this.paused
      },
      playNext: function () {
        this.$store.dispatch('playEpisode', this.nextepisode.id)
      },
      updateLocalTracker: function () {
        if (this.playing.type === 'movie') {
          if (!this.playing.entity.TrackMovies) this.playing.entity.TrackMovies = []
          if (!this.playing.entity.TrackMovies[0]) this.playing.entity.TrackMovies[0] = {}

          this.playing.entity.TrackMovies[0].time = this.initialProgress + this.player.currentTime
        }

        if (this.playing.type === 'episode') {
          if (!this.playing.entity.TrackEpisodes) this.playing.entity.TrackEpisodes = []
          if (!this.playing.entity.TrackEpisodes[0]) this.playing.entity.TrackEpisodes[0] = {}

          this.playing.entity.TrackEpisodes[0].time = this.initialProgress + this.player.currentTime
        }
      }
    },
    watch: {
      playSizeFormat: async function (newState, oldState) {
        switch (newState) {
          case SCREEN_FORMAT.FULLSCREEN:
            if (this.browserSupportsPiP && document.pictureInPictureElement) {
              await document.exitPictureInPicture()
            }

            await this.playbar.requestFullscreen()

            break

          case SCREEN_FORMAT.LARGE:
            if (document.fullscreenElement) {
              await document.exitFullscreen()
            }

            if (this.browserSupportsPiP && document.pictureInPictureElement) {
              await document.exitPictureInPicture()
            }

            break

          case SCREEN_FORMAT.SMALL:
            if (document.fullscreenElement) {
              await document.exitFullscreen()
            }

            if (this.browserSupportsPiP) {
              await this.player.requestPictureInPicture()
            }

            break
        }
      },
      playing: async function (newState, oldState) {
        if (!oldState.entity || !oldState.entity.title) this.playSizeFormat = SCREEN_FORMAT.LARGE

        this.initialProgress = 0
        this.progress = 0
        this.PlayingFileID = 0
        this.shouldPreSeek = false
        this.showVideo = false
        this.qualityPopUp = false
        this.paused = true
        this.loading = false
        this.autoplaying = false

        this.nextepisode = null

        if (this.playing.entity === undefined) {
          return
        }

        this.loading = true

        this.showVideo = true

        let tracking = this.playing.entity.TrackMovies || this.playing.entity.TrackEpisodes

        // If the progress is above 90 percent, we shouldn't seek to the last position since the user probably
        // wants to start from the beginning.

        await this.updateSession()

        if (tracking[0]) {
          this.shouldPreSeek = tracking[0].progress < IGNORE_RESTORE_PROGRESS_THRESHOLD
        }

        if (this.playbackSession.seeking === 'server') {
          if (tracking[0] !== undefined && this.shouldPreSeek) {
            this.initialProgress = tracking[0].time
          }
        }

        this.setURL()

        if (this.playing.type === 'episode') {
          this.nextepisode = (await this.axios.get(`/episode/${this.playing.entity.id}/next`)).data
        }
      },
      paused: async function (newState, oldState) {
        if (newState) {
          return this.player.pause()
        }

        this.player.play()
      }
    },
    mounted: function () {
      window.addEventListener('keydown', (e) => {
        if (e.code !== 'Space') { return }
        if (this.playing === {}) { return }
        if (this.playSizeFormat === SCREEN_FORMAT.SMALL) { return }

        e.preventDefault()

        if (this.playSizeFormat === SCREEN_FORMAT.FULLSCREEN || this.playSizeFormat === SCREEN_FORMAT.LARGE) {
          this.paused = !this.paused
        }
      })

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

      this.player.addEventListener('enterpictureinpicture', () => {
        this.playSizeFormat = SCREEN_FORMAT.SMALL
        this.browserSupportsPiP = true
      })

      this.player.addEventListener('leavepictureinpicture', () => {
        if (this.playSizeFormat === SCREEN_FORMAT.SMALL) {
          this.playSizeFormat = SCREEN_FORMAT.LARGE
        }
      })

      this.player.addEventListener('loadedmetadata', () => {
        let tracking = this.playing.entity.TrackMovies || this.playing.entity.TrackEpisodes

        if (tracking[0] && this.shouldPreSeek) {
          this.player.currentTime = tracking[0].time - this.initialProgress
        }

        console.log('metadataloaded')

        this.player.play()

        this.paused = false
        this.loading = false
      })

      this.player.addEventListener('timeupdate', () => {
        this.updateLocalTracker()

        if (this.playing.entity === undefined) {
          this.playbarTimeout = 0

          return
        }

        if (this.playbarTimeout < 20) {
          this.playbarTimeout += 1
        }

        this.progress = (this.initialProgress + this.player.currentTime) / this.playing.entity.Files[this.PlayingFileID].duration

        if (this.autoplay && !this.autoplaying) {
          if (this.playing.entity.Files[this.PlayingFileID].duration - (this.initialProgress + this.player.currentTime) <= AUTOPLAY_TIME_LEFT_THRESHOLD) {
            this.autoplaying = true
            this.playNext()
          }
        }

        switch (this.playing.type) {
          case 'episode':
            this.$socket.emit('playing', {
              time: this.playing.entity.TrackEpisodes[0].time = this.initialProgress + this.player.currentTime,
              progress: this.progress,
              episodeId: this.playing.entity.id,
              type: 'tv'
            })
            break
          case 'movie':
            this.$socket.emit('playing', {
              time: this.playing.entity.TrackMovies[0].time,
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

      background: linear-gradient(to bottom, #645c5c 0%, #5c5454 100%)
      box-shadow: 0 0 5px 2px rgba(44, 40, 40, 0.75)

      .seriesid
        color: rgba(255, 255, 255, 0.6)

      .nextepisode
        cursor: pointer

        background-color: rgba(44, 40, 40, 0.6)
        box-shadow: 0 0 1px 2px rgba(44, 40, 40, 0.6)

        transition: background-color 0.1s, box-shadow 0.1s

        padding: 5px 10px
        margin-left: 10px
        border-radius: 3px

      .nextepisode:hover
        background-color: rgba(44, 40, 40, 0.9)
        box-shadow: 0 0 1px 2px rgba(44, 40, 40, 0.9)

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
      box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.75)

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

    box-shadow: inset 0 0 5px 0 rgba(44, 40, 40, 0.75)

    cursor: pointer

    .progressbar
      position: absolute
      top: 0
      left: 0
      height: 100%
      background-color: #ae6600

      z-index: 4

      box-shadow: 0 0 5px 2px rgba(44, 40, 40, 0.75)

    .progressbarload
      position: absolute
      top: 0
      left: 0
      height: 100%
      background-color: #ae6600

      box-shadow: 0 0 5px 2px #421c00

      opacity: 0.2


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
    box-shadow: 0 0 5px 2px rgba(44, 40, 40, 0.75)

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



  .hiddenBar
    cursor: none
    .bar
      bottom: -70px

</style>
