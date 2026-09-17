function parts (seconds) {
  const total = Math.floor(Math.max(0, seconds))

  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60
  }
}

function pad (value) {
  return String(value).padStart(2, '0')
}

/**
 * Clock format for playback positions. Hours are dropped below the hour mark,
 * so a 40 minute episode reads `12:04` rather than `00:12:04`.
 */
export function formatSeconds (seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const { hours, minutes, seconds: secs } = parts(seconds)

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`

  return `${minutes}:${pad(secs)}`
}

/** Time left, rendered as `-12:04`. */
export function formatRemaining (currentTime, duration) {
  if (!Number.isFinite(duration) || duration <= 0) return ''

  return `-${formatSeconds(Math.max(0, duration - (currentTime || 0)))}`
}

/** Spoken form for aria-valuetext, e.g. "1 hour 12 minutes 4 seconds". */
export function describeSeconds (seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0 seconds'

  const { hours, minutes, seconds: secs } = parts(seconds)
  const segments = []

  if (hours) segments.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (minutes) segments.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
  if (secs || segments.length === 0) segments.push(`${secs} second${secs === 1 ? '' : 's'}`)

  return segments.join(' ')
}
