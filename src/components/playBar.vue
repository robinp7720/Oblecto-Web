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
        ref="seekbar"
        class="progressbarContainer"
        @click="seek"
      >
        <div
          class="progressbarload"
          :style="{ width: bufferedProgress * 100 + '%' }"
        />
        <div
          :class="{loading}"
          class="progressbar"
          :style="{ width: progress * 100 + '%' }"
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
            v-if="showVideo"
            class="volume-control"
          >
            <span
              class="toggle-button small-button"
              :class="{ active: !muted && volume > 0 }"
              @click="toggleMute"
            >
              {{ muted || volume === 0 ? 'Mute' : 'Vol' }}
            </span>
            <input
              class="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              @input="setVolume(Number($event.target.value))"
            >
            <span class="volume-label">{{ volumeDisplay }}</span>
          </div>

          <div
            v-if="qualityPopUp"
            class="quality-selector"
            @click.stop
          >
            <div class="settings-section">
              <h4>Source</h4>
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

            <div
              v-if="availableAudioStreams.length > 0"
              class="settings-section"
            >
              <h4>Audio</h4>
              <ul>
                <li
                  v-for="stream in availableAudioStreams"
                  :key="`audio-${stream.index}`"
                  :class="{selected: selectedAudioStreamIndex === stream.index}"
                  @click="selectAudioStream(stream.index)"
                >
                  {{ formatStreamLabel(stream, 'audio') }}
                </li>
              </ul>
            </div>

            <div class="settings-section">
              <h4>Subtitles</h4>
              <div class="mode-options">
                <span
                  class="mode-option"
                  :class="{selected: subtitleMode === 'off'}"
                  @click="setSubtitleMode('off')"
                >Off</span>
                <span
                  class="mode-option"
                  :class="{selected: subtitleMode === 'auto'}"
                  @click="setSubtitleMode('auto')"
                >Auto</span>
                <span
                  class="mode-option"
                  :class="{selected: subtitleMode === 'forced'}"
                  @click="setSubtitleMode('forced')"
                >Forced</span>
              </div>
              <ul
                v-if="availableSubtitleStreams.length > 0"
                :class="{disabled: subtitleMode === 'off'}"
              >
                <li
                  :class="{selected: subtitleMode !== 'off' && selectedSubtitleStreamIndex === null}"
                  @click="selectSubtitleTrack(null)"
                >
                  Default subtitle track
                </li>
                <li
                  v-for="stream in availableSubtitleStreams"
                  :key="`subtitle-${stream.index}`"
                  :class="{selected: selectedSubtitleStreamIndex === stream.index}"
                  @click="selectSubtitleTrack(stream.index)"
                >
                  {{ formatStreamLabel(stream, 'subtitle') }}
                </li>
              </ul>
              <p
                v-else
                class="settings-note"
              >No subtitle streams detected in this file.</p>
            </div>

            <div class="settings-section">
              <h4>Playback speed</h4>
              <ul class="speed-list">
                <li
                  v-for="rate in playbackSpeedOptions"
                  :key="`speed-${rate}`"
                  :class="{selected: playbackRate === rate}"
                  @click="setPlaybackRate(rate)"
                >
                  {{ rate }}x
                </li>
              </ul>
            </div>
          </div>

          <span
            v-if="showVideo"
            class="toggle-button small-button"
            @click="toggleSubtitleMode"
          >
            CC
          </span>

          <span
            v-if="showVideo"
            class="toggle-button small-button"
            @click="cyclePlaybackRate"
          >
            {{ playbackRate }}x
          </span>

          <span
            v-if="showVideo"
            class="toggle-button settings-toggle"
            @click.stop="qualityPopUp = !qualityPopUp"
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
            <FontAwesomeIcon :icon="paused ? iconPlay : iconPause" />
          </span>

          <span
            v-if="showVideo && fullscreenEnabled"
            class="toggle-button"
            @click="toggleFullScreen"
          >
            <FontAwesomeIcon :icon="playSizeFormat === 3 ? iconDeFullscreen : iconFullscreen" />
          </span>

          <span
            v-if="showVideo && playSizeFormat !== 3"
            class="toggle-button"
            @click="setPlaySizeFormat((playSizeFormat % 2) + 1)"
          >
            <FontAwesomeIcon :icon="playSizeFormat === 1 ? iconDown : iconUp" />
          </span>

          <a
            v-if="progress > 0.9 && playing.type === 'episode'"
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

        fullscreenEnabled: document.fullscreenEnabled || false,
        browserSupportsPiP: document.pictureInPictureEnabled || false,

        initialProgress: 0,
        playbarTimeout: 0,
        showVideo: false,
        nextepisode: false,
        qualityPopUp: false,

        autoplaying: false,

        PlayingFileID: 0,

        shouldPreSeek: true,
        lastSocketUpdate: 0,

        playbackSession: {},
        hls: null,
        streamType: 'hls',

        selectedAudioStreamIndex: null,
        selectedSubtitleStreamIndex: null,
        subtitleMode: 'auto',

        volume: 1,
        previousVolume: 1,
        muted: false,

        playbackRate: 1,
        playbackSpeedOptions: [0.5, 0.75, 1, 1.25, 1.5, 2],

        resumeAfterStreamChange: true,

        keydownHandler: null,
        clickHandler: null,
        playerListeners: {},
        playerListenersBound: false,
        pendingStreamUrl: null
      }
    },
    computed: {
      player () {
        return this.$refs.videoPlayer
      },
      playbar () {
        return this.$refs.playbar
      },
      hasActivePlayback () {
        return Boolean(this.playing && this.playing.entity && Array.isArray(this.playing.entity.Files) && this.playing.entity.Files.length > 0)
      },
      currentFile () {
        if (!this.hasActivePlayback) return null

        return this.playing.entity.Files[this.PlayingFileID] || null
      },
      currentDuration () {
        return this.currentFile?.duration || 0
      },
      bufferedProgress () {
        if (!this.player || !this.currentDuration) return 0
        if (!this.player.buffered || this.player.buffered.length === 0) return 0

        let bufferedEnd = this.player.buffered.end(this.player.buffered.length - 1)
        return this.clamp((this.initialProgress + bufferedEnd) / this.currentDuration, 0, 1)
      },
      availableAudioStreams () {
        if (!this.currentFile || !Array.isArray(this.currentFile.Streams)) return []

        return this.currentFile.Streams
          .filter((stream) => stream.codec_type === 'audio' && Number.isInteger(stream.index))
          .sort((a, b) => a.index - b.index)
      },
      availableSubtitleStreams () {
        if (!this.currentFile || !Array.isArray(this.currentFile.Streams)) return []

        return this.currentFile.Streams
          .filter((stream) => stream.codec_type === 'subtitle' && Number.isInteger(stream.index))
          .sort((a, b) => a.index - b.index)
      },
      volumeDisplay () {
        return `${Math.round(this.volume * 100)}%`
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
        return this.formatSeconds(this.currentAbsoluteTime())
      },
      DurationDisplayValue () {
        return this.formatSeconds(this.currentDuration)
      },
      iconCog () {
        return faCog
      },
      ...mapState(['playing', 'autoplay', 'host', 'playSizeFormat'])
    },
    methods: {
      ...mapMutations(['setPlaySizeFormat']),
      clamp: function (value, min, max) {
        return Math.min(max, Math.max(min, value))
      },
      formatSeconds: function (seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
          return '00:00:00'
        }

        let rounded = Math.floor(seconds)
        let hours = (`0${Math.floor(rounded / (60 * 60))}`).substr(-2)
        let mins = (`0${Math.floor(rounded / 60) % 60}`).substr(-2)
        let secs = (`0${Math.floor(rounded) % 60}`).substr(-2)

        return `${hours}:${mins}:${secs}`
      },
      currentAbsoluteTime: function () {
        if (!this.player) return this.initialProgress

        return this.initialProgress + (this.player.currentTime || 0)
      },
      getTracking: function () {
        if (!this.hasActivePlayback) return []

        return this.playing.entity.TrackMovies || this.playing.entity.TrackEpisodes || []
      },
      getBaseUrl: function () {
        return oblectoClient?.axios?.defaults?.baseURL || window.location.origin
      },
      getHlsAuthHeader: function () {
        if (!oblectoClient || !oblectoClient.accessToken) return null

        return `bearer ${oblectoClient.accessToken}`
      },
      buildHlsConfig: function () {
        return {
          enableWorker: true,
          lowLatencyMode: false
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
        if (!this.bindPlayerEventListeners()) {
          this.pendingStreamUrl = url
          this.$nextTick(() => {
            this.bindPlayerEventListeners()
          })
          return
        }

        let sourceUrl = url
        try {
          sourceUrl = new URL(url, this.getBaseUrl()).toString()
        } catch (error) {}

        this.destroyHls()

        if (Hls.isSupported()) {
          this.hls = new Hls(this.buildHlsConfig())
          this.hls.on(Hls.Events.MANIFEST_LOADING, () => {
            this.loading = true
          })
          this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.loading = false
          })
          this.hls.on(Hls.Events.ERROR, (event, data) => {
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
          this.hls.loadSource(sourceUrl)
          this.hls.attachMedia(this.player)
        } else {
          this.player.src = sourceUrl
          this.player.load()
        }
      },
      viewShow: function () {
        if (this.playing.type === 'episode') {
          this.$router.push({ name: 'SeriesView', params: { seriesId: this.playing.entity.Series.id } })
          this.setPlaySizeFormat(ScreenFormats.SMALL)
        }
      },
      formatStreamLabel: function (stream, type) {
        let language = (stream.tags_language || 'und').toUpperCase()
        let title = stream.tags_title || stream.codec_name || type
        let forced = Number(stream.disposition_forced) > 0 ? ' forced' : ''

        return `${language} - ${title}${forced} (#${stream.index})`
      },
      applyPlayerAudioState: function () {
        if (!this.player) return

        this.player.volume = this.volume
        this.player.muted = this.muted
      },
      bindPlayerEventListeners: function () {
        if (!this.player) return false

        const eventNames = Object.keys(this.playerListeners)

        if (eventNames.length === 0) return false

        this.applyPlayerAudioState()
        this.player.playbackRate = this.playbackRate

        if (this.playerListenersBound) {
          this.unbindPlayerEventListeners()
        }

        for (let eventName of eventNames) {
          this.player.addEventListener(eventName, this.playerListeners[eventName])
        }
        this.playerListenersBound = true

        if (this.pendingStreamUrl) {
          let pendingUrl = this.pendingStreamUrl
          this.pendingStreamUrl = null
          this.attachHlsStream(pendingUrl)
        }

        return true
      },
      unbindPlayerEventListeners: function () {
        if (!this.player || !this.playerListenersBound) return

        for (let eventName of Object.keys(this.playerListeners)) {
          this.player.removeEventListener(eventName, this.playerListeners[eventName])
        }

        this.playerListenersBound = false
      },
      setVolume: function (value) {
        let clamped = this.clamp(value, 0, 1)

        this.volume = clamped
        if (clamped > 0) {
          this.previousVolume = clamped
          this.muted = false
        } else {
          this.muted = true
        }

        this.applyPlayerAudioState()
      },
      toggleMute: function () {
        if (this.muted || this.volume === 0) {
          this.muted = false
          this.setVolume(this.previousVolume || 1)
          return
        }

        if (this.volume > 0) {
          this.previousVolume = this.volume
        }

        this.muted = true
        this.applyPlayerAudioState()
      },
      setPlaybackRate: function (rate) {
        if (!this.playbackSpeedOptions.includes(rate)) return

        this.playbackRate = rate

        if (this.player) {
          this.player.playbackRate = rate
        }
      },
      cyclePlaybackRate: function () {
        let currentIndex = this.playbackSpeedOptions.indexOf(this.playbackRate)
        let nextIndex = (currentIndex + 1) % this.playbackSpeedOptions.length
        this.setPlaybackRate(this.playbackSpeedOptions[nextIndex])
      },
      adjustPlaybackRate: function (direction) {
        let currentIndex = this.playbackSpeedOptions.indexOf(this.playbackRate)

        if (currentIndex === -1) {
          currentIndex = this.playbackSpeedOptions.indexOf(1)
        }

        let nextIndex = this.clamp(currentIndex + direction, 0, this.playbackSpeedOptions.length - 1)
        this.setPlaybackRate(this.playbackSpeedOptions[nextIndex])
      },
      changeFileId: async function (id) {
        this.updateLocalTracker()

        let tracking = this.getTracking()
        let usesServerSeeking = this.streamType === 'hls' || this.playbackSession.seeking === 'server'

        this.PlayingFileID = id
        this.selectedAudioStreamIndex = null
        this.selectedSubtitleStreamIndex = null
        this.subtitleMode = 'auto'

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
        this.resumeAfterStreamChange = !this.paused
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

        if (Number.isInteger(this.selectedAudioStreamIndex)) {
          params.audioStreamIndex = this.selectedAudioStreamIndex
        }

        params.subtitleMode = this.subtitleMode

        if (this.subtitleMode === 'off') {
          params.subtitleStreamIndex = -1
        } else if (Number.isInteger(this.selectedSubtitleStreamIndex)) {
          params.subtitleStreamIndex = this.selectedSubtitleStreamIndex
        }

        this.playbackSession = await oblectoClient.sessions.create(this.playing.entity.Files[this.PlayingFileID].id, params)

        if (this.playbackSession.selectedTracks) {
          this.selectedAudioStreamIndex = Number.isInteger(this.playbackSession.selectedTracks.audioStreamIndex)
            ? this.playbackSession.selectedTracks.audioStreamIndex
            : null
          this.selectedSubtitleStreamIndex = Number.isInteger(this.playbackSession.selectedTracks.subtitleStreamIndex)
            ? this.playbackSession.selectedTracks.subtitleStreamIndex
            : null
          this.subtitleMode = this.playbackSession.selectedTracks.subtitleMode || this.subtitleMode
        }
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
      seekToAbsolute: function (position) {
        if (!this.currentDuration || !this.player) return

        let nextPosition = this.clamp(position, 0, this.currentDuration)

        if (this.playbackSession.seeking === 'server') {
          let playableWindowEnd = this.initialProgress + (this.player.duration || 0)

          if (nextPosition <= playableWindowEnd && nextPosition >= this.initialProgress) {
            this.player.currentTime = nextPosition - this.initialProgress
            return
          }

          this.initialProgress = nextPosition
          this.shouldPreSeek = true
          this.updateURL(this.initialProgress)
          return
        }

        this.player.currentTime = nextPosition
      },
      seek: function (event) {
        if (!this.currentDuration || !this.$refs.seekbar) return

        let rect = this.$refs.seekbar.getBoundingClientRect()
        if (!rect.width) return

        let normalized = this.clamp((event.clientX - rect.left) / rect.width, 0, 1)
        let position = this.currentDuration * normalized

        this.seekToAbsolute(position)
      },
      seekBy: function (seconds) {
        this.seekToAbsolute(this.currentAbsoluteTime() + seconds)
      },
      reconfigurePlayback: async function () {
        if (!this.hasActivePlayback) return

        this.updateLocalTracker()

        let usesServerSeeking = this.streamType === 'hls' || this.playbackSession.seeking === 'server'
        let absoluteTime = this.currentAbsoluteTime()
        let tracking = this.getTracking()

        if (tracking[0]) {
          tracking[0].time = absoluteTime
        }

        this.loading = true
        this.resumeAfterStreamChange = !this.paused

        if (usesServerSeeking) {
          this.initialProgress = absoluteTime
        } else {
          this.initialProgress = 0
          this.shouldPreSeek = true
        }

        await this.updateSession(this.initialProgress)
        this.setURL()
      },
      selectAudioStream: async function (streamIndex) {
        if (this.selectedAudioStreamIndex === streamIndex) return

        this.selectedAudioStreamIndex = streamIndex
        await this.reconfigurePlayback()
      },
      setSubtitleMode: async function (mode) {
        if (!['off', 'auto', 'forced'].includes(mode)) return
        if (this.subtitleMode === mode && mode !== 'off') return

        this.subtitleMode = mode

        if (mode === 'off') {
          this.selectedSubtitleStreamIndex = null
        } else if (this.selectedSubtitleStreamIndex === null && this.availableSubtitleStreams.length > 0) {
          this.selectedSubtitleStreamIndex = this.availableSubtitleStreams[0].index
        }

        await this.reconfigurePlayback()
      },
      toggleSubtitleMode: async function () {
        if (this.subtitleMode === 'off') {
          await this.setSubtitleMode('auto')
          return
        }

        await this.setSubtitleMode('off')
      },
      selectSubtitleTrack: async function (streamIndex) {
        if (this.subtitleMode === 'off') {
          this.subtitleMode = 'auto'
        }

        if (streamIndex === this.selectedSubtitleStreamIndex) return

        this.selectedSubtitleStreamIndex = streamIndex
        await this.reconfigurePlayback()
      },
      closeSettingsOnOutsideClick: function (event) {
        if (!this.qualityPopUp) return
        if (!(event.target instanceof Element)) {
          this.qualityPopUp = false
          return
        }

        if (this.$el && this.$el.contains(event.target)) {
          let panel = this.$el.querySelector('.quality-selector')
          let toggle = event.target.closest('.settings-toggle')

          if (panel && panel.contains(event.target)) {
            return
          }

          if (toggle) {
            return
          }
        }

        this.qualityPopUp = false
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
        if (this.player) {
          this.player.src = ''
        }

        this.$store.dispatch('clearPlaying')
        this.$store.dispatch('updateWatching')

        this.showVideo = false
        this.qualityPopUp = false
        this.paused = true
        this.loading = false
        this.autoplaying = false
        this.progress = 0

        this.selectedAudioStreamIndex = null
        this.selectedSubtitleStreamIndex = null
        this.subtitleMode = 'auto'

        this.setPlaySizeFormat(ScreenFormats.SMALL)
      },
      playPause: function (event) {
        if (event) {
          event.preventDefault()
        }

        if (!this.hasActivePlayback) return

        this.paused = !this.paused
      },
      playNext: function () {
        if (this.nextepisode && this.nextepisode.id) {
          this.$store.dispatch('playEpisode', this.nextepisode.id)
        }
      },
      updateLocalTracker: function () {
        if (!this.player || !this.hasActivePlayback) return

        if (this.playing.type === 'movie') {
          if (!this.playing.entity.TrackMovies) this.playing.entity.TrackMovies = []
          if (!this.playing.entity.TrackMovies[0]) this.playing.entity.TrackMovies[0] = {}

          this.playing.entity.TrackMovies[0].time = this.currentAbsoluteTime()
        }

        if (this.playing.type === 'episode') {
          if (!this.playing.entity.TrackEpisodes) this.playing.entity.TrackEpisodes = []
          if (!this.playing.entity.TrackEpisodes[0]) this.playing.entity.TrackEpisodes[0] = {}

          this.playing.entity.TrackEpisodes[0].time = this.currentAbsoluteTime()
        }
      },
      isTypingContext: function (event) {
        if (!event || !event.target) return false

        let target = event.target

        if (target.isContentEditable) return true
        if (!target.tagName) return false

        return ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)
      },
      handleGlobalKeydown: function (event) {
        if (!this.hasActivePlayback || this.isTypingContext(event)) {
          return
        }

        switch (event.code) {
          case 'Space':
          case 'KeyK':
            event.preventDefault()
            this.playPause()
            break
          case 'ArrowLeft':
          case 'KeyJ':
            event.preventDefault()
            this.seekBy(-10)
            break
          case 'ArrowRight':
          case 'KeyL':
            event.preventDefault()
            this.seekBy(10)
            break
          case 'ArrowUp':
            event.preventDefault()
            this.setVolume(this.volume + 0.05)
            break
          case 'ArrowDown':
            event.preventDefault()
            this.setVolume(this.volume - 0.05)
            break
          case 'KeyM':
            event.preventDefault()
            this.toggleMute()
            break
          case 'KeyF':
            event.preventDefault()
            if (this.showVideo && this.fullscreenEnabled) {
              this.toggleFullScreen()
            }
            break
          case 'BracketLeft':
            event.preventDefault()
            this.adjustPlaybackRate(-1)
            break
          case 'BracketRight':
            event.preventDefault()
            this.adjustPlaybackRate(1)
            break
        }
      }
    },
    watch: {
      playSizeFormat: async function (newState) {
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

            if (this.browserSupportsPiP && this.player && !document.pictureInPictureElement) {
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

        this.selectedAudioStreamIndex = null
        this.selectedSubtitleStreamIndex = null
        this.subtitleMode = 'auto'

        this.nextepisode = null

        if (!this.playing.entity) {
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'none'
          }

          return
        }

        this.loading = true
        this.showVideo = true

        let tracking = this.getTracking()

        if (tracking[0]) {
          this.shouldPreSeek = tracking[0].progress < IGNORE_RESTORE_PROGRESS_THRESHOLD
        }

        let usesServerSeeking = this.streamType === 'hls' || this.playbackSession.seeking === 'server'

        if (usesServerSeeking && tracking[0] !== undefined && this.shouldPreSeek) {
          this.initialProgress = tracking[0].time
        }

        this.resumeAfterStreamChange = true

        await this.updateSession(this.initialProgress)

        this.setURL()

        if ('mediaSession' in navigator) {
          let imageURL = ''

          if (this.playing.type === 'episode') {
            imageURL = this.host + '/episode/' + this.playing.entity.id + '/banner'
          }

          navigator.mediaSession.metadata = new MediaMetadata({
            title: this.playing.title,
            album: this.playing.type === 'episode' ? this.playing.entity.Series?.seriesName : '',
            artwork: [{ src: imageURL }]
          })

          navigator.mediaSession.setActionHandler('nexttrack', this.playNext)
          navigator.mediaSession.setActionHandler('stop', this.stopPlaying)
        }

        if (this.playing.type === 'episode') {
          this.nextepisode = await oblectoClient.episodeLibrary.getNext(this.playing.entity.id)
        }
      },
      paused: async function (newState) {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = newState ? 'paused' : 'playing'
        }

        if (!this.player) return

        if (newState) {
          this.player.pause()
          return
        }

        try {
          await this.player.play()
        } catch (error) {
          this.paused = true
        }
      }
    },
    mounted: function () {
      this.keydownHandler = (event) => this.handleGlobalKeydown(event)
      this.clickHandler = (event) => this.closeSettingsOnOutsideClick(event)

      window.addEventListener('keydown', this.keydownHandler)
      window.addEventListener('click', this.clickHandler)

      this.playerListeners.waiting = () => {
        this.loading = true
      }
      this.playerListeners.playing = () => {
        this.paused = false
        this.loading = false
      }
      this.playerListeners.pause = () => {
        this.paused = true
      }
      this.playerListeners.play = () => {
        this.paused = false
      }
      this.playerListeners.ended = () => {
        this.$store.dispatch('updateWatching')
      }
      this.playerListeners.enterpictureinpicture = () => {
        this.setPlaySizeFormat(ScreenFormats.SMALL)
        this.browserSupportsPiP = true
      }
      this.playerListeners.leavepictureinpicture = () => {
        if (this.playSizeFormat === ScreenFormats.SMALL) {
          this.setPlaySizeFormat(ScreenFormats.LARGE)
        }
      }
      this.playerListeners.loadedmetadata = async () => {
        if (!this.hasActivePlayback) return

        let tracking = this.getTracking()

        if (tracking[0] && this.shouldPreSeek) {
          let seekTime = tracking[0].time - this.initialProgress
          this.player.currentTime = this.clamp(seekTime, 0, Number.isFinite(this.player.duration) ? this.player.duration : seekTime)
        }

        if (this.resumeAfterStreamChange) {
          try {
            await this.player.play()
            this.paused = false
          } catch (error) {
            this.paused = true
          }
        } else {
          this.player.pause()
          this.paused = true
        }

        this.player.playbackRate = this.playbackRate
        this.applyPlayerAudioState()
        this.loading = false
      }
      this.playerListeners.timeupdate = () => {
        if (!this.hasActivePlayback) {
          this.playbarTimeout = 0
          return
        }

        this.updateLocalTracker()

        if (this.playbarTimeout < 20) {
          this.playbarTimeout += 1
        }

        if (this.currentDuration > 0) {
          this.progress = this.clamp(this.currentAbsoluteTime() / this.currentDuration, 0, 1)
        }

        if (this.autoplay && !this.autoplaying && this.currentDuration > 0) {
          if (this.currentDuration - this.currentAbsoluteTime() <= AUTOPLAY_TIME_LEFT_THRESHOLD) {
            this.autoplaying = true
            this.playNext()
          }
        }

        if (Date.now() - this.lastSocketUpdate > 5000) {
          this.lastSocketUpdate = Date.now()
          switch (this.playing.type) {
            case 'episode':
              this.$socket.emit('playing', {
                time: this.playing.entity.TrackEpisodes[0].time = this.currentAbsoluteTime(),
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
        }
      }

      this.$nextTick(() => {
        this.bindPlayerEventListeners()
      })
    },
    beforeUnmount: function () {
      if (this.keydownHandler) {
        window.removeEventListener('keydown', this.keydownHandler)
      }

      if (this.clickHandler) {
        window.removeEventListener('click', this.clickHandler)
      }

      this.unbindPlayerEventListeners()

      this.destroyHls()
    }
  }
</script>

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
      user-select: none

    .toggle-button.active
      background: rgba(217, 129, 60, 0.3)
      box-shadow: inset 0 0 0 1px rgba(217, 129, 60, 0.55)

    .small-button
      width: auto
      min-width: 46px
      border-radius: 999px
      padding: 0 10px
      font-size: 0.75rem
      letter-spacing: 0.03em
      text-transform: uppercase

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

    .volume-control
      display: inline-flex
      align-items: center
      gap: 8px
      padding: 5px 10px
      border-radius: 999px
      background: rgba(255, 255, 255, 0.06)
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1)

    .volume-slider
      width: 90px
      accent-color: var(--color-accent)
      cursor: pointer

    .volume-label
      font-size: 0.75rem
      min-width: 36px
      text-align: right
      color: var(--color-text-muted)

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
    bottom: 52px
    right: 14px
    width: min(360px, calc(100vw - 28px))
    max-height: min(70vh, 560px)
    overflow-y: auto
    background: rgba(40, 33, 37, 0.97)
    border: 1px solid var(--color-border)
    border-radius: var(--radius-md)
    box-shadow: var(--shadow-soft)
    backdrop-filter: blur(12px)
    padding: 10px

  .settings-section
    border-radius: 10px
    background: rgba(255, 255, 255, 0.03)
    margin-bottom: 8px
    overflow: hidden

    h4
      margin: 0
      padding: 10px 12px
      font-size: 0.78rem
      letter-spacing: 0.06em
      text-transform: uppercase
      color: var(--color-text-faint)
      border-bottom: 1px solid rgba(255, 255, 255, 0.08)

    ul
      list-style: none

    li
      padding: 9px 12px
      cursor: pointer
      color: var(--color-text)
      font-size: 0.86rem

    li.selected
      background-color: rgba(255, 255, 255, 0.08)

    li:hover
      background-color: rgba(255, 255, 255, 0.12)

  .settings-section:last-child
    margin-bottom: 0

  .mode-options
    display: flex
    gap: 6px
    padding: 10px 12px

  .mode-option
    font-size: 0.78rem
    padding: 4px 8px
    border-radius: 999px
    cursor: pointer
    background: rgba(255, 255, 255, 0.08)
    color: var(--color-text-muted)

  .mode-option.selected
    background: rgba(217, 129, 60, 0.32)
    color: var(--color-text)

  .settings-note
    margin: 0
    padding: 10px 12px
    color: var(--color-text-faint)
    font-size: 0.8rem

  .disabled
    opacity: 0.55

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

  @media only screen and (max-width: 960px)
    .playBar
      .bar
        .controls
          gap: 8px

        .volume-slider
          width: 70px

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
          justify-content: flex-start

        .title
          max-width: 100%

        .quality-selector
          right: 8px
          bottom: 72px

</style>
