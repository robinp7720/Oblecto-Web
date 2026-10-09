// Monotonic elapsed time plus the browser's played ranges. Position jumps do
// not contribute time; ranges survive quality/track changes within a session.
export default class PlaybackTelemetry {
  constructor(now = () => performance.now()) {
    this.now = now
    this.activeSeconds = 0
    this.ranges = []
    this.sequence = 0
    this.last = null
    this.buffering = false
  }

  sample(video) {
    const at = this.now()
    const position = video.currentTime
    if (this.last?.playing && !video.seeking) {
      const elapsed = (at - this.last.at) / 1000
      const media = (position - this.last.position) / this.last.rate
      if (elapsed >= 0 && elapsed <= 60 && media >= 0 && media <= elapsed + 0.25) {
        this.activeSeconds += Math.min(elapsed, media)
      }
    }
    this.last = {
      at, position, rate: video.playbackRate || 1,
      playing: !video.paused && !video.seeking && !video.ended && !this.buffering && video.readyState >= 3
    }
    const ranges = [...this.ranges]
    for (let i = 0; i < (video.played?.length || 0); i++) {
      ranges.push([video.played.start(i), video.played.end(i)])
    }
    this.ranges = []
    for (const [start, end] of ranges.sort((a, b) => a[0] - b[0])) {
      const last = this.ranges.at(-1)
      if (last && start <= last[1] + 0.01) last[1] = Math.max(last[1], end)
      else if (this.ranges.length < 1024) this.ranges.push([start, end])
    }
  }

  report(video) {
    this.sample(video)
    return {
      sequence: ++this.sequence,
      activeSeconds: this.activeSeconds,
      playedRanges: this.ranges.map(range => [...range]),
      playbackRate: video.playbackRate || 1,
      buffering: this.buffering
    }
  }
}
