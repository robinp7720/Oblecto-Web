import Hls from 'hls.js'

export function browserCapabilities(video) {
  const supports = type => !!video.canPlayType(type)
  const hevc = supports('video/mp4; codecs="hvc1.2.4.L153.B0"')
  return {
    containers: supports('video/mp4; codecs="avc1.4d401f"') ? ['mp4', 'm4v'] : [],
    videoCodecs: [...(supports('video/mp4; codecs="avc1.4d401f"') ? ['h264'] : []), ...(hevc ? ['hevc'] : [])],
    audioCodecs: supports('audio/mp4; codecs="mp4a.40.2"') ? ['aac'] : [],
    profiles: ['Baseline', 'Constrained Baseline', 'Main', 'High', ...(hevc ? ['Main 10'] : [])],
    maxLevel: hevc ? 153 : 51, maxBitDepth: hevc ? 10 : 8, maxAudioChannels: 2, maxHeight: 2160,
    hdr: hevc && !!window.matchMedia?.('(dynamic-range: high)').matches, nativeTracks: false,
    hls: Hls.isSupported() || supports('application/vnd.apple.mpegurl')
  }
}

/** Owns media loading, recovery, and server-session lifetime; UI only renders its state. */
export default class PlaybackController {
  constructor(client, changed = () => {}) {
    this.client = client
    this.changed = changed
    this.generation = 0
    this.serial = Promise.resolve()
    this.listeners = []
    this.networkRetries = 0
    this.mediaRecovered = false
    this.fellBack = false
    this.progressSerial = Promise.resolve()
    this.heartbeat = setInterval(() => this.report(), 10000)
  }
  emit(values) { this.changed(values) }
  open(fileId, options) {
    const generation = ++this.generation
    this.serial = this.serial.catch(() => {}).then(async () => {
      if (generation !== this.generation) return null
      this.emit({ loading: true, error: '' })
      this.options = options
      let next
      try {
        if (this.session && this.fileId === fileId) {
          next = await this.client.update(this.session.sessionId, { ...options, revision: this.session.revision })
        } else {
          await this.releaseSession()
          next = await this.client.create(fileId, options)
        }
        if (generation !== this.generation) {
          await this.client.stop(next.sessionId).catch(() => {})
          this.session = null
          return null
        }
        this.session = next
        this.fileId = fileId
        this.emit({ session: next, loading: true })
        return next
      } catch (error) {
        if (generation === this.generation) this.fail(error.response?.data?.message || error.message || 'Playback could not start.')
        return null
      }
    })
    return this.serial
  }
  attach(video, autoplay = true) {
    if (!this.session || !video) return
    this.detach()
    this.video = video
    this.autoplay = autoplay
    this.networkRetries = 0
    this.mediaRecovered = false
    const generation = this.generation
    let lastTime = -1
    let lastAdvance = Date.now()
    this.watchdog = setInterval(() => {
      if (video.currentTime !== lastTime || video.ended || (video.paused && !this.autoplay)) {
        lastTime = video.currentTime
        lastAdvance = Date.now()
      } else if (Date.now() - lastAdvance > (this.session?.method === 'direct' ? 12000 : 60000)) {
        clearInterval(this.watchdog)
        if (this.session?.method === 'direct') this.fallback()
        else this.fail('Playback stopped making progress. Retry to resume.')
      }
    }, 1000)
    const on = (name, handler) => {
      video.addEventListener(name, handler)
      this.listeners.push(() => video.removeEventListener(name, handler))
    }
    on('loadedmetadata', () => {
      if (generation !== this.generation) return
      video.currentTime = Math.min(this.session.position || 0, Number.isFinite(video.duration) ? video.duration : this.session.duration)
      // `blocked` distinguishes "the browser refused to start" from "the user
      // paused it". Locally they look the same; from another device driving
      // this one they do not, and a refusal there needs saying out loud.
      if (autoplay) video.play().catch(() => this.emit({ paused: true, loading: false, blocked: true }))
      else video.pause()
    })
    on('waiting', () => { this.emit({ loading: true }); this.report(true) })
    on('playing', () => { this.autoplay = true; this.emit({ loading: false, paused: false, error: '', blocked: false }) })
    on('pause', () => { this.autoplay = false; this.emit({ paused: true }); this.report() })
    on('seeked', () => this.report())
    on('ended', () => this.report())
    on('error', () => this.fallback())
    const url = this.client.mediaUrl(this.session.mediaUrl)
    if (this.session.method !== 'direct' && Hls.isSupported()) {
      const policy = { default: { maxTimeToFirstByteMs: 60000, maxLoadTimeMs: 60000, timeoutRetry: { maxNumRetry: 0, retryDelayMs: 0, maxRetryDelayMs: 0 }, errorRetry: { maxNumRetry: 0, retryDelayMs: 0, maxRetryDelayMs: 0 } } }
      this.hls = new Hls({ enableWorker: true, lowLatencyMode: false, manifestLoadPolicy: policy, playlistLoadPolicy: policy, fragLoadPolicy: policy, startPosition: this.session.position || 0 })
      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || generation !== this.generation) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && this.networkRetries < 3) {
          const delay = 1000 * 2 ** this.networkRetries++
          clearTimeout(this.retryTimer)
          this.retryTimer = setTimeout(() => {
            if (generation !== this.generation || !this.hls) return
            if (!this.hls.levels.length) this.hls.loadSource(url)
            else this.hls.startLoad(video.currentTime)
          }, delay)
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !this.mediaRecovered) {
          this.mediaRecovered = true
          this.hls.recoverMediaError()
        } else this.fail('Playback was interrupted. Check your connection and retry.')
      })
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => { if (this.hls && this.session.subtitleUrl) this.hls.subtitleTrack = 0 })
      this.hls.loadSource(url)
      this.hls.attachMedia(video)
    } else {
      video.src = url
      if (this.session.method === 'direct' && this.session.subtitleUrl) {
        this.track = document.createElement('track')
        this.track.kind = 'subtitles'
        this.track.label = 'Subtitles'
        this.track.default = true
        this.track.src = this.client.mediaUrl(this.session.subtitleUrl)
        video.appendChild(this.track)
      }
      video.load()
    }
  }
  async fallback() {
    if (!this.session || this.session.method !== 'direct' || this.fellBack) {
      this.fail('This media could not be played. Retry playback or select another source.')
      return
    }
    this.fellBack = true
    const video = this.video
    const autoplay = !video.paused || this.autoplay
    const next = await this.open(this.fileId, { ...this.options, position: video.currentTime || this.session.position, forceHls: true, quality: 'auto' })
    if (next) this.attach(video, autoplay)
  }
  async retry() {
    this.fellBack = false
    const video = this.video
    if (!this.fileId || !video) return
    const options = { ...this.options, position: video.currentTime || this.session?.position || 0 }
    await this.releaseSession()
    const session = await this.open(this.fileId, options)
    if (session) this.attach(video, true)
  }
  report(buffering = false) {
    if (!this.session || !this.video || this.video.readyState === 0) return Promise.resolve()
    const session = this.session
    const body = { revision: session.revision, position: this.video.currentTime, paused: this.video.paused, buffering }
    this.progressSerial = this.progressSerial.catch(() => {}).then(() => this.client.progress(session.sessionId, body)).catch(error => {
      if (error.response?.status === 404 && this.session === session) this.fail('Playback session expired. Retry to resume.')
    })
    return this.progressSerial
  }
  fail(error) {
    this.hls?.stopLoad()
    clearInterval(this.watchdog)
    clearTimeout(this.retryTimer)
    this.emit({ error, loading: false })
  }
  detach() {
    clearInterval(this.watchdog)
    clearTimeout(this.retryTimer)
    this.listeners.splice(0).forEach(remove => remove())
    this.hls?.destroy()
    this.hls = null
    this.track?.remove()
    this.track = null
    if (this.video) { this.video.pause(); this.video.removeAttribute('src'); this.video.load() }
  }
  async releaseSession() {
    await this.report()
    const session = this.session
    this.session = null
    this.detach()
    if (session) await this.client.stop(session.sessionId).catch(() => {})
  }
  async stop() { ++this.generation; await this.serial.catch(() => {}); await this.releaseSession(); this.fellBack = false }
  async destroy() { clearInterval(this.heartbeat); await this.stop() }
}
