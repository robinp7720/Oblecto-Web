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

/**
 * Human label for an ffprobe stream entry, e.g. `EN - English forced (#3)`.
 * Lifted out of the player so both the settings panel and any future track
 * picker format tracks identically.
 */
export function formatStreamLabel (stream, type) {
  if (!stream) return ''

  const language = String(stream.tags?.language || stream.tags_language || 'und').toUpperCase()
  const title = stream.tags_title || stream.tags?.title || stream.codec_name || type
  const forced = Number(stream.disposition_forced) > 0 ? ' forced' : ''

  return `${language} - ${title}${forced} (#${stream.index})`
}

// Shared with the player so labels never promise a resume the player skips.
export const IGNORE_RESTORE_PROGRESS_THRESHOLD = 0.9

export function playbackLabel (type, item) {
  const tracking = (type === 'movie' ? item?.TrackMovies : item?.TrackEpisodes)?.[0]
  const time = Number(tracking?.time)
  const progress = Number(tracking?.progress)
  if (progress >= IGNORE_RESTORE_PROGRESS_THRESHOLD) return 'Watch again'
  if (!(time > 0 && progress >= 0)) return 'Play'
  const duration = Number(item?.Files?.[0]?.duration) || Number(item?.runtime) * 60
  if (!Number.isFinite(duration) || duration <= time) return 'Resume'
  return `Resume · ${Math.ceil((duration - time) / 60)} min left`
}

export function ratingLabel (item) {
  const value = formatRating(item?.siteRating, item?.siteRatingCount)
  if (!value) return null
  const source = { tmdb: 'TMDB', tvdb: 'TVDB' }[item.siteRatingSource] || 'Community rating'
  return `${source} ${value}`
}

export function nextSeriesEpisode (episodes) {
  const numbered = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
  const regular = episodes.filter(item => numbered(item.airedSeason) && Number(item.airedSeason) > 0 && numbered(item.airedEpisodeNumber) && Number(item.airedEpisodeNumber) > 0)
  const ordered = [...(regular.length ? regular : episodes)].sort((a, b) =>
    (numbered(a.airedSeason) ? Number(a.airedSeason) : Infinity) - (numbered(b.airedSeason) ? Number(b.airedSeason) : Infinity) ||
    (numbered(a.airedEpisodeNumber) ? Number(a.airedEpisodeNumber) : Infinity) - (numbered(b.airedEpisodeNumber) ? Number(b.airedEpisodeNumber) : Infinity) || a.id - b.id)
  const unfinished = ordered.filter(item => Number(item.TrackEpisodes?.[0]?.time) > 0 && progressForItem('episode', item) < IGNORE_RESTORE_PROGRESS_THRESHOLD)
  unfinished.sort((a, b) => (Date.parse(b.TrackEpisodes?.[0]?.updatedAt) || 0) - (Date.parse(a.TrackEpisodes?.[0]?.updatedAt) || 0))
  const episode = unfinished[0] || ordered.find(item => progressForItem('episode', item) < IGNORE_RESTORE_PROGRESS_THRESHOLD) || ordered[0]
  if (!episode) return null
  const action = unfinished.length ? 'Resume' : ordered.every(item => progressForItem('episode', item) >= IGNORE_RESTORE_PROGRESS_THRESHOLD) ? 'Watch again' : 'Play'
  return { episode, label: `${action} S${episode.airedSeason ?? '?'} E${episode.airedEpisodeNumber ?? '?'}` }
}

export function relationshipLabel (relationship = {}) {
  const collections = relationship.sharedCollections || []
  if (collections.length) return `Same collection · ${collections[0].name}`
  const people = relationship.sharedPeople || []
  if (people.length) return `With ${people[0].name}${people.length > 1 ? ` +${people.length - 1}` : ''}`
  const genres = relationship.sharedGenres || []
  return genres.length ? `Shared taste · ${genres.join(' + ')}` : ''
}

export function libraryConnectionLabel (connections = {}) {
  const movies = Number(connections.movies) || 0
  const series = Number(connections.series) || 0
  const parts = []
  if (movies) parts.push(`${movies} ${movies === 1 ? 'movie' : 'movies'}`)
  if (series) parts.push(`${series} ${series === 1 ? 'show' : 'shows'}`)
  return parts.length ? `Also in ${parts.join(' and ')}` : ''
}

export function seasonSummary (episodes = []) {
  const ratings = episodes.map(item => Number(item.siteRating)).filter(value => Number.isFinite(value) && value > 0)
  return {
    episodeCount: episodes.length,
    watchedCount: episodes.filter(item => progressForItem('episode', item) >= IGNORE_RESTORE_PROGRESS_THRESHOLD).length,
    runtimeMinutes: episodes.reduce((sum, item) => sum + (Number(item.runtime) > 0 ? Number(item.runtime) : 0), 0),
    averageRating: ratings.length ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10 : null
  }
}

export function mediaCapabilities (files = []) {
  const streams = files.flatMap(file => file.Streams || file.streams || [])
  const video = streams.filter(stream => stream.codec_type === 'video')
  const audio = streams.filter(stream => stream.codec_type === 'audio')
  const subtitles = streams.filter(stream => stream.codec_type === 'subtitle')
  const width = Math.max(0, ...video.map(stream => Number(stream.width) || 0))
  const height = Math.max(0, ...video.map(stream => Number(stream.height) || 0))
  const resolution = width >= 3800 || height >= 2100 ? '4K' : width >= 1900 || height >= 1050 ? '1080p' : width >= 1200 || height >= 700 ? '720p' : null
  const dolbyVision = video.some(stream => Number(stream.rpu_present_flag) > 0 || String(stream.side_data_type || '').toLowerCase().includes('dolby vision'))
  const transfer = video.map(stream => String(stream.color_transfer || '').toLowerCase())
  const hdr = dolbyVision ? 'Dolby Vision' : transfer.some(value => value.includes('smpte2084')) ? 'HDR10' : transfer.some(value => value.includes('arib-std-b67')) ? 'HLG' : null
  const channels = Math.max(0, ...audio.map(stream => Number(stream.channels) || 0))
  const audioLayout = channels >= 8 ? '7.1 audio' : channels >= 6 ? '5.1 audio' : channels >= 2 ? 'Stereo' : null
  const language = stream => String(stream.tags_language || stream.tags?.language || '').trim().toUpperCase()
  const audioLanguages = [...new Set(audio.map(language).filter(value => value && value !== 'UND'))]
  const subtitleLanguages = [...new Set(subtitles.map(language).filter(value => value && value !== 'UND'))]
  return [
    resolution,
    hdr,
    audioLayout,
    audioLanguages.length ? `Audio · ${audioLanguages.slice(0, 3).join(', ')}${audioLanguages.length > 3 ? ` +${audioLanguages.length - 3}` : ''}` : null,
    subtitleLanguages.length ? `Subtitles · ${subtitleLanguages.slice(0, 3).join(', ')}${subtitleLanguages.length > 3 ? ` +${subtitleLanguages.length - 3}` : ''}` : null
  ].filter(Boolean)
}
