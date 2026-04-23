export function imageUrl (host, type, id, variant = 'poster') {
  if (!host || !type || !id) return ''
  return `${host}/${type}/${id}/${variant}`
}

export function normalizeGenres (raw) {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw.map(entry => String(entry).trim()).filter(Boolean)
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map(entry => String(entry).trim()).filter(Boolean)
      }
    } catch (error) {
      // Fall back to comma-separated content.
    }

    return trimmed.split(',').map(entry => entry.trim()).filter(Boolean)
  }

  return []
}

export function formatRuntime (value) {
  const minutes = Number(value)
  if (!Number.isFinite(minutes) || minutes <= 0) return null

  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

export function formatYear (value) {
  if (!value) return null
  const match = String(value).match(/^\d{4}/)
  return match ? match[0] : null
}

export function formatCount (value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return null

  if (numeric >= 1000000) {
    return `${Math.round(numeric / 100000) / 10}m`
  }

  if (numeric >= 1000) {
    return `${Math.round(numeric / 100) / 10}k`
  }

  return `${Math.round(numeric)}`
}

export function formatRating (value, count = null) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return null

  const rounded = Math.round(numeric * 10) / 10
  const countLabel = formatCount(count)

  return countLabel ? `${rounded} (${countLabel})` : `${rounded}`
}

export function titleForItem (type, item) {
  if (!item) return ''

  if (type === 'movie') return item.movieName || ''
  if (type === 'series') return item.seriesName || ''
  return item.episodeName || ''
}

export function subtitleForItem (type, item) {
  if (!item) return null

  if (type === 'movie') {
    return [
      formatYear(item.releaseDate),
      formatRuntime(item.runtime),
      normalizeGenres(item.genre || item.genres).slice(0, 2).join(', ')
    ].filter(Boolean).join(' • ')
  }

  if (type === 'series') {
    return [
      formatYear(item.firstAired),
      formatRuntime(item.runtime),
      formatRating(item.siteRating, item.siteRatingCount)
    ].filter(Boolean).join(' • ')
  }

  return [
    item.Series?.seriesName || item.seriesName || null,
    item.airedSeason && item.airedEpisodeNumber
      ? `S${item.airedSeason}E${item.airedEpisodeNumber}`
      : null,
    formatYear(item.firstAired || item.aired || item.airDate)
  ].filter(Boolean).join(' • ')
}

export function progressForItem (type, item) {
  if (!item) return 0

  if (type === 'movie') {
    return Number(item.TrackMovies?.[0]?.progress || 0)
  }

  if (type === 'episode') {
    return Number(item.TrackEpisodes?.[0]?.progress || 0)
  }

  return 0
}
