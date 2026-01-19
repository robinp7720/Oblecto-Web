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

      <div class="bar-content">
        <div class="meta">
          <span
            v-if="playing.type === 'episode'"
            class="seriesid"
            @click="viewShow"
          > {{ playing.entity.Series.seriesName }} S{{ playing.entity.airedSeason }}E{{ playing.entity.airedEpisodeNumber }}: </span>
          <span class="title">{{ playing.title }}</span>
        </div>

        <div class="controls">
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
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import Hls from 'hls.js'

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

        playbackSession: {},
        hls: null,
        streamType: 'hls'
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
      getBaseUrl: function () {
        return oblectoClient?.axios?.defaults?.baseURL || window.location.origin
      },
      getHlsAuthHeader: function () {
        if (!oblectoClient || !oblectoClient.accessToken) return null

        return `bearer ${oblectoClient.accessToken}`
      },
      normalizeHlsUrl: function (url) {
        if (!url) return url

        let baseUrl = this.getBaseUrl().replace(/\/+$/, '')
        let sessionId = this.playbackSession?.sessionId
        let uuidMatch = url.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)

        if (url.includes('/session/stream/')) {
          return url
        }

        if (sessionId && url.startsWith(baseUrl + '/') && uuidMatch && !url.includes('/HLS/')) {
          return `${baseUrl}/HLS/${sessionId}/segment/${uuidMatch[1]}`
        }

        return url
      },
      buildHlsConfig: function () {
        let authHeader = this.getHlsAuthHeader()
        let getFixedUrl = (url) => this.normalizeHlsUrl(url)

        return {
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 3,
          maxLiveSyncPlaybackRate: 1.0,
          maxBufferLength: 10,
          backBufferLength: 10,
          startPosition: 0,
          xhrSetup: (xhr, url) => {
            let nextUrl = getFixedUrl(url)

            if (nextUrl && nextUrl !== url) {
              xhr.open('GET', nextUrl, true)
            }
            if (authHeader) {
              xhr.setRequestHeader('Authorization', authHeader)
            }
          },
          fetchSetup: (context, init) => {
            let nextInit = init || {}
            let nextUrl = getFixedUrl(context.url)

            if (authHeader) {
              nextInit.headers = {
                ...(nextInit.headers || {}),
                Authorization: authHeader
              }
            }

            return new Request(nextUrl, nextInit)
          }
        }
      },
      destroyHls: function () {
        if (!this.hls) return

        this.hls.stopLoad()
        this.hls.detachMedia()
        this.hls.destroy()
        this.hls = null
      },
      attachHlsStream: function (url) {
        this.destroyHls()

        if (Hls.isSupported()) {
          this.hls = new Hls(this.buildHlsConfig())
          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('[hls] media attached')
          })
          this.hls.on(Hls.Events.MANIFEST_LOADING, (event, data) => {
            console.log('[hls] manifest loading', data?.url)
          })
          this.hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
            console.log('[hls] manifest loaded', data)
          })
          this.hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log('[hls] level loaded', { startSN: data?.details?.startSN, endSN: data?.details?.endSN, live: data?.details?.live })
          })
          this.hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            console.log('[hls] frag loaded', { sn: data?.frag?.sn, level: data?.frag?.level, url: data?.frag?.url })
          })
          this.hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
            console.log('[hls] frag changed', { sn: data?.frag?.sn, level: data?.frag?.level })
          })
          this.hls.on(Hls.Events.ERROR, (event, data) => {
            console.warn('[hls] error', data)
            if (!data || !data.fatal) return

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                this.hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                this.hls.recoverMediaError()
                break
              default:
                this.destroyHls()
            }
          })
          this.hls.loadSource(url)
          this.hls.attachMedia(this.player)
        } else if (this.player.canPlayType('application/vnd.apple.mpegurl')) {
          this.player.src = url
          this.player.load()
        } else {
          this.player.src = url
          this.player.load()
        }
      },
      viewShow: function () {
        if (this.playing.type === 'episode') {
          this.$router.push({ name: 'SeriesView', params: { seriesId: this.playing.entity.Series.id } })
          this.setPlaySizeFormat(ScreenFormats.SMALL)
        }
      },
      changeFileId: async function (id) {
        this.updateLocalTracker()

        let tracking = this.playing.entity.TrackMovies || this.playing.entity.TrackEpisodes
        let usesServerSeeking = this.streamType === 'hls' || this.playbackSession.seeking === 'server'

        this.PlayingFileID = id

        if (usesServerSeeking) {
          if (tracking[0] !== undefined) {
            this.initialProgress = tracking[0].time
          }
        } else {
          this.initialProgress = 0
          this.shouldPreSeek = true
        }

        await this.updateSession(this.initialProgress)

        this.qualityPopUp = false

        this.loading = true
        this.setURL()
      },
      updateSession: async function (offset = null) {
        let params = { type: this.streamType }

        if (this.streamType === 'hls') {
          params.formats = 'mp4'
          params.videoCodecs = 'h264'
          params.audioCodec = 'aac'
        }

        if (typeof offset === 'number') {
          params.offset = offset
        }

        this.playbackSession = await oblectoClient.sessions.create(this.playing.entity.Files[this.PlayingFileID].id, params)
      },
      updateURL: async function (offset = null) {
        await this.updateSession(offset)
        this.setURL()
      },
      setURL: function () {
        let token = this.playbackSession.sessionId

        let url = oblectoClient.sessions.getStreamUrl(token)
        this.attachHlsStream(url)
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
          this.updateURL(this.initialProgress)
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
        this.destroyHls()
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

        if (tracking[0]) {
          this.shouldPreSeek = tracking[0].progress < IGNORE_RESTORE_PROGRESS_THRESHOLD
        }

        let usesServerSeeking = this.streamType === 'hls' || this.playbackSession.seeking === 'server'

        if (usesServerSeeking) {
          if (tracking[0] !== undefined && this.shouldPreSeek) {
            this.initialProgress = tracking[0].time
          }
        }

        await this.updateSession(this.initialProgress)

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
        console.log('[player] waiting')
      })

      this.player.addEventListener('playing', () => {
        this.paused = false
        this.loading = false
        console.log('[player] playing')
      })

      this.player.addEventListener('pause', () => {
        this.paused = true
        console.log('[player] pause')
      })

      this.player.addEventListener('play', () => {
        this.paused = false
        console.log('[player] play')
      })

      this.player.addEventListener('ended', () => {
        this.$store.dispatch('updateWatching')
        console.log('[player] ended')
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
        console.log('[player] loadedmetadata', { duration: this.player.duration })
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
      left: 0

      transition: transform 0.2s, opacity 0.2s

      padding: 18px 24px 16px
      width: 100%

      color: var(--color-text)

      z-index: 1000

      background: linear-gradient(180deg, rgba(46, 38, 42, 0.95), rgba(30, 26, 30, 0.98))
      border-top: 1px solid var(--color-border)
      box-shadow: var(--shadow-strong)
      backdrop-filter: blur(14px)

      .bar-content
        display: flex
        align-items: center
        justify-content: space-between
        gap: 20px

      .meta
        display: flex
        align-items: center
        gap: 8px
        min-width: 0
        font-family: var(--font-body)
        letter-spacing: 0.02em

      .title
        font-weight: 600
        color: var(--color-text)
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

      .seriesid
        color: var(--color-text-faint)
        cursor: pointer

      .nextepisode
        cursor: pointer

        background: linear-gradient(120deg, rgba(217, 129, 60, 0.18), rgba(217, 129, 60, 0.35))
        box-shadow: inset 0 0 0 1px rgba(217, 129, 60, 0.35)
        color: var(--color-text)

        transition: background-color 0.2s, box-shadow 0.2s, transform 0.2s

        padding: 7px 14px
        border-radius: 999px
        font-size: 0.85rem
        letter-spacing: 0.02em
        white-space: nowrap

      .nextepisode:hover
        background: linear-gradient(120deg, rgba(217, 129, 60, 0.3), rgba(217, 129, 60, 0.5))
        box-shadow: inset 0 0 0 1px rgba(217, 129, 60, 0.6)
        transform: translateY(-1px)

    .player
      position: fixed
      bottom: 0
      height: 100%
      width: 100%

      background: black
      z-index: 5

      transition: top 0.2s, height 0.2s, width 0.2s

    .small
      width: clamp(220px, 30vw, 360px)
      height: auto
      max-height: clamp(160px, 26vw, 260px)
      bottom: 88px
      right: 18px
      border-radius: var(--radius-md)
      overflow: hidden
      border: 1px solid rgba(255, 255, 255, 0.12)
      box-shadow: 0 16px 30px rgba(10, 8, 10, 0.55)
      background: rgba(20, 16, 18, 0.9)

      video
        display: block
        width: 100%
        height: auto
        object-fit: contain

      @media only screen and (max-width: 600px)
        width: clamp(180px, 55vw, 260px)
        max-height: clamp(140px, 35vw, 210px)
        bottom: 96px
        right: 12px

      @media only screen and (max-height: 600px)
        width: clamp(180px, 45vw, 240px)
        max-height: clamp(120px, 30vw, 180px)
        bottom: 78px
        right: 12px

    .hidden
      top: 100%

    .controls
      display: flex
      align-items: center
      gap: 10px
      flex-wrap: wrap
      justify-content: flex-end

    .toggle-button
      cursor: pointer
      display: inline-flex
      align-items: center
      justify-content: center
      width: 34px
      height: 34px
      border-radius: 50%
      background: rgba(255, 255, 255, 0.06)
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1)
      color: var(--color-text)
      transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s

    .toggle-button:hover
      background: rgba(255, 255, 255, 0.12)
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16)
      transform: translateY(-1px)

    .time
      padding: 6px 12px
      border-radius: 999px
      background: rgba(255, 255, 255, 0.08)
      color: var(--color-text-muted)
      font-size: 0.85rem
      letter-spacing: 0.03em

  .progressbarContainer
    height: 8px
    position: absolute
    top: 0
    left: 0
    width: 100%

    background-color: rgba(18, 14, 17, 0.55)

    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6)
    border-bottom: 1px solid rgba(255, 255, 255, 0.08)
    border-radius: 0 0 999px 999px
    overflow: hidden

    cursor: pointer

    .progressbar
      position: absolute
      top: 0
      left: 0
      height: 100%
      background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong))

      z-index: 4

      box-shadow: 0 0 12px rgba(16, 12, 14, 0.6)

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
    background: rgba(40, 33, 37, 0.95)
    border: 1px solid var(--color-border)
    border-radius: var(--radius-md)
    box-shadow: var(--shadow-soft)
    backdrop-filter: blur(12px)

    ul
      list-style: none
      border-radius: var(--radius-md)
      li
        padding: 12px 18px
        cursor: pointer
        color: var(--color-text)
        font-size: 0.9rem
      li.selected
        background-color: rgba(255, 255, 255, 0.08)
      li:hover
        background-color: rgba(255, 255, 255, 0.12)

  .badge
    margin-left: 6px
    padding: 2px 8px
    border-radius: 999px
    font-size: 0.7rem
    letter-spacing: 0.04em
    background: rgba(255, 255, 255, 0.1)
    color: var(--color-text-faint)


  .hiddenBar
    cursor: none
    .bar
      opacity: 0
      transform: translateY(80px)

  @media only screen and (max-width: 720px)
    .playBar
      .bar
        padding: 16px 16px 14px

        .bar-content
          flex-direction: column
          align-items: flex-start
          gap: 12px

        .controls
          width: 100%
          justify-content: space-between

        .title
          max-width: 100%

</style>
