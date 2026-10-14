import { moviePlaybackDetails } from './movieDetails.js'

export const playableEpisode = episode => !Array.isArray(episode.Files) || episode.Files.length > 0

export function seriesViewingProgress (episodes) {
  const local = episodes.filter(episode => Number(episode.airedSeason) > 0 && playableEpisode(episode))
  const watched = local.filter(episode => Number(episode.TrackEpisodes?.[0]?.progress) >= 0.9)
  const seasons = [...new Set(local.map(episode => Number(episode.airedSeason)))]
  const completedSeasons = seasons.filter(season => local.filter(episode => Number(episode.airedSeason) === season).every(episode => watched.includes(episode))).length
  let remainingSeconds = 0
  let unknownRuntime = 0
  for (const episode of local.filter(episode => !watched.includes(episode))) {
    const details = moviePlaybackDetails({ ...episode, TrackMovies: episode.TrackEpisodes })
    if (details.duration) remainingSeconds += details.remainingSeconds
    else unknownRuntime++
  }
  return { total: local.length, watched: watched.length, seasons: seasons.length, completedSeasons, remainingSeconds, unknownRuntime }
}

export function tvProviderLinks (type, item) {
  const links = []
  const positive = value => Number.isSafeInteger(Number(value)) && Number(value) > 0
  if (/^tt\d+$/.test(item?.imdbid || '')) links.push({ label: 'IMDb', url: `https://www.imdb.com/title/${item.imdbid}/` })
  if (type === 'series' && positive(item?.tmdbid)) links.push({ label: 'TMDB', url: `https://www.themoviedb.org/tv/${Number(item.tmdbid)}` })
  if (type === 'episode' && positive(item?.Series?.tmdbid) && /^\d+$/.test(String(item.airedSeason)) && /^\d+$/.test(String(item.airedEpisodeNumber))) links.push({ label: 'TMDB', url: `https://www.themoviedb.org/tv/${Number(item.Series.tmdbid)}/season/${Number(item.airedSeason)}/episode/${Number(item.airedEpisodeNumber)}` })
  if (positive(item?.tvdbid)) links.push({ label: 'TVDB', url: `https://thetvdb.com/dereferrer/${type}/${Number(item.tvdbid)}` })
  return links
}

export function fileChapters (file) {
  return (Array.isArray(file?.chapters) ? file.chapters : [])
    .filter(chapter => typeof chapter.start === 'number' && Number.isFinite(chapter.start) && chapter.start >= 0 && (!file.duration || chapter.start < Number(file.duration)))
    .sort((a, b) => a.start - b.start)
}

export function episodeSpoilerState (episode, preference, revealed = false) {
  const hidden = !revealed && preference !== 'off' && Number(episode?.TrackEpisodes?.[0]?.progress || 0) < 0.9
  const title = hidden && preference === 'hide-titles'
    ? `Episode ${episode?.airedEpisodeNumber ?? '—'}`
    : episode?.episodeName || `Episode ${episode?.airedEpisodeNumber ?? '—'}`
  return { hidden, title, overview: hidden ? '' : episode?.overview || '' }
}
