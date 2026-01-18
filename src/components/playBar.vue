<template>
  <div
    ref="playbar"
    class="playBar"
    :class="{hiddenBar: !(playbarTimeout < 20 || playSizeFormat === 2)}"
    @mousemove="playbarTimeout = 0"
  >
    <div
      class="player"
      :class="{ small: playSizeFormat === 2, hidden: (!showVideo || (playSizeFormat === 2 && browserSupportsPiP))}"
    >
      <video ref="videoPlayer" />
    </div>

    <div
      ref="bar"
      class="bar"
    >
      <div
        class="progressbarContainer"
        @click="seek"
      >
        <div
          :class="{loading}"
          class="progressbar"
          :style="{ width: progress * 100 + '%' }"
        />
        <div
          v-if="$refs.videoPlayer && $refs.videoPlayer.buffered.length > 0"
          class="progressbarload"
          :style="{ width: (initialProgress + $refs.videoPlayer.buffered.end($refs.videoPlayer.buffered.length - 1)) / playing.entity.Files[PlayingFileID].duration * 100 + '%' }"
        />
      </div>

      <span
        v-if="playing.type === 'episode'"
        class="seriesid"
        @click="viewShow"
      > {{ playing.entity.Series.seriesName }} S{{ playing.entity.airedSeason }}E{{ playing.entity.airedEpisodeNumber }}: </span>
      <span class="title">{{ playing.title }}</span>

      <div class="right">
        <span
          v-if="showVideo"
          class="time"
        >
          {{ PlayTimeDisplayValue }} / {{ DurationDisplayValue }}
        </span>

        <div
          v-if="qualityPopUp"
          class="quality-selector"
        >
          <ul>
            <li
              v-for="(FileIterator, index) in playing.entity.Files"
              :key="FileIterator.id"
              :class="{selected: index === PlayingFileID}"
              @click="changeFileId(index)"
            >
              {{ FileIterator.name }} <span class="badge">{{ FileIterator.extension }}</span>
            </li>
          </ul>
        </div>

        <span
          v-if="showVideo"
          class="toggle-button"
          @click="qualityPopUp = !qualityPopUp"
        >
          <FontAwesomeIcon :icon="iconCog" />
        </span>

        <span
          v-if="showVideo"
          class="toggle-button"
          @click="stopPlaying"
        >
          <FontAwesomeIcon :icon="iconStop" />
        </span>

        <span
          v-if="showVideo"
          class="toggle-button"
          @click="playPause"
        >
          <FontAwesomeIcon :icon="paused? iconPlay : iconPause" />
        </span>

        <span
          v-if="showVideo && fullscreenEnabled"
          class="toggle-button"
          @click="toggleFullScreen"
        >
          <FontAwesomeIcon :icon="playSizeFormat === 3? iconDeFullscreen: iconFullscreen" />
        </span>

        <span
          v-if="showVideo && playSizeFormat !== 3"
          class="toggle-button"
          @click="setPlaySizeFormat((playSizeFormat % 2) + 1)"
        >
          <FontAwesomeIcon :icon="playSizeFormat === 1 ? iconDown : iconUp" />
        </span>

        <a
          v-if="progress > 0.9 & playing.type === 'episode'"
          class="nextepisode"
          @click="playNext"
        >Next Episode</a>
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

  import { ScreenFormats } from '@/enums/ScreenFormats'

  import { mapMutations, mapState } from 'vuex'
  import oblectoClient from '@/oblectoClient'

  let AUTOPLAY_TIME_LEFT_THRESHOLD = 5
  let IGNORE_RESTORE_PROGRESS_THRESHOLD = 0.9

  export default {
    name: 'PlayBar',
    components: {
      FontAwesomeIcon
    },
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
      ...mapState(['playing', 'autoplay', 'host', 'playSizeFormat'])
    },
    methods: {
      ...mapMutations(['setPlaySizeFormat']),
      viewShow: function () {
        if (this.playing.type === 'episode') {
          this.$router.push({ name: 'SeriesView', params: { seriesId: this.playing.entity.Series.id } })
          this.setPlaySizeFormat(ScreenFormats.SMALL)
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
        this.playbackSession = await oblectoClient.sessions.create(this.playing.entity.Files[this.PlayingFileID].id)
      },
      updateURL: async function () {
        await this.updateSession()
        this.setURL()
      },
      setURL: function () {
        let token = this.playbackSession.sessionId

        if (this.playbackSession.seeking === 'server') {
          this.player.src = oblectoClient.sessions.getStreamUrl(token, { offset: this.initialProgress })
        } else {
          this.player.src = oblectoClient.sessions.getStreamUrl(token)
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
        if (this.playSizeFormat !== ScreenFormats.FULLSCREEN) {
          this.setPlaySizeFormat(ScreenFormats.FULLSCREEN)
        } else {
          this.setPlaySizeFormat(ScreenFormats.LARGE)
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

        this.setPlaySizeFormat(ScreenFormats.SMALL)
      },
      playPause: function (event) {
        event.preventDefault()

        console.log(this.$store)

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
        console.log('Size changed:', newState)
        switch (newState) {
          case ScreenFormats.FULLSCREEN:
            if (this.browserSupportsPiP && document.pictureInPictureElement) {
              await document.exitPictureInPicture()
            }

            await this.playbar.requestFullscreen()

            break

          case ScreenFormats.LARGE:
            if (document.fullscreenElement) {
              await document.exitFullscreen()
            }

            if (this.browserSupportsPiP && document.pictureInPictureElement) {
              await document.exitPictureInPicture()
            }

            break

          case ScreenFormats.SMALL:
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
        if (!oldState.entity || !oldState.entity.title) this.setPlaySizeFormat(ScreenFormats.LARGE)

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
          navigator.mediaSession.playbackState = 'none'

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

        // Set the mediaSession environment
        if ('mediaSession' in navigator) {
          let imageURL = ''

          if (this.playing.type === 'episode') {
            imageURL = this.host + '/episode/' + this.playing.entity.id + '/banner'
          }

          // eslint-disable-next-line no-undef
          navigator.mediaSession.metadata = new MediaMetadata({
            title: this.playing.title,
            album: this.playing.entity.Series.seriesName,
            artwork: [
              { src: imageURL }
            ]
          })

          navigator.mediaSession.setActionHandler('nexttrack', this.playNext)
          navigator.mediaSession.setActionHandler('stop', this.stopPlaying)
        }

        if (this.playing.type === 'episode') {
          this.nextepisode = await oblectoClient.episodeLibrary.getNext(this.playing.entity.id)
        }
      },
      paused: async function (newState, oldState) {
        navigator.mediaSession.playbackState = newState ? 'paused' : 'playing'
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
        if (this.playSizeFormat === ScreenFormats.SMALL) { return }

        e.preventDefault()

        if (this.playSizeFormat === ScreenFormats.FULLSCREEN || this.playSizeFormat === ScreenFormats.LARGE) {
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
        this.setPlaySizeFormat(ScreenFormats.SMALL)
        this.browserSupportsPiP = true
      })

      this.player.addEventListener('leavepictureinpicture', () => {
        if (this.playSizeFormat === ScreenFormats.SMALL) {
          this.setPlaySizeFormat(ScreenFormats.LARGE)
        }
      })

      this.player.addEventListener('loadedmetadata', () => {
        let tracking = this.playing.entity.TrackMovies || this.playing.entity.TrackEpisodes

        if (tracking[0] && this.shouldPreSeek) {
          this.player.currentTime = tracking[0].time - this.initialProgress
        }

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

      color: var(--color-text)

      z-index: 1000

      background: linear-gradient(135deg, rgba(49, 43, 47, 0.98), rgba(33, 29, 34, 0.96))
      border-top: 1px solid var(--color-border)
      box-shadow: 0 -12px 30px rgba(12, 10, 12, 0.45)

      .seriesid
        color: var(--color-text-faint)

      .nextepisode
        cursor: pointer

        background-color: rgba(255, 255, 255, 0.08)
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08)
        color: var(--color-text)

        transition: background-color 0.1s, box-shadow 0.1s

        padding: 6px 12px
        margin-left: 10px
        border-radius: 999px

      .nextepisode:hover
        background-color: rgba(255, 255, 255, 0.18)
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16)

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
      border-radius: var(--radius-md)
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

    background-color: rgba(0, 0, 0, 0.35)

    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.5)

    cursor: pointer

    .progressbar
      position: absolute
      top: 0
      left: 0
      height: 100%
      background-color: var(--color-accent)

      z-index: 4

      box-shadow: 0 0 10px rgba(16, 12, 14, 0.6)

    .progressbarload
      position: absolute
      top: 0
      left: 0
      height: 100%
      background-color: var(--color-accent)
      box-shadow: 0 0 6px rgba(10, 8, 10, 0.6)

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
    background: rgba(32, 27, 31, 0.95)
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    box-shadow: var(--shadow-soft)
    backdrop-filter: blur(10px)

    ul
      list-style: none
      border-radius: 3px
      li
        padding: 20px
        cursor: pointer
      li.selected
        background-color: rgba(255, 255, 255, 0.08)
      li:hover
        background-color: rgba(255, 255, 255, 0.12)



  .hiddenBar
    cursor: none
    .bar
      bottom: -70px

</style>
