import { IGNORE_RESTORE_PROGRESS_THRESHOLD } from './media.js'

export function moviePlaybackDetails (movie) {
  const positive = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 0
  const track = movie.TrackMovies?.[0] || {}
  const duration = positive(movie.Files?.[0]?.duration) || positive(movie.runtime) * 60
  const progress = Math.min(1, positive(track.progress))
  const time = positive(track.time)
  const watched = progress >= IGNORE_RESTORE_PROGRESS_THRESHOLD
  const resuming = !watched && time > 0 && Number(track.progress) >= 0
  return { duration, progress, watched, resuming, remainingSeconds: resuming ? Math.max(0, duration - time) : duration }
}

export function movieProviderLinks (movie) {
  const links = []
  if (/^tt\d+$/.test(movie?.imdbid || '')) links.push({ label: 'IMDb', url: `https://www.imdb.com/title/${movie.imdbid}/` })
  if (Number.isSafeInteger(Number(movie?.tmdbid)) && Number(movie.tmdbid) > 0) links.push({ label: 'TMDB', url: `https://www.themoviedb.org/movie/${Number(movie.tmdbid)}` })
  return links
}

export function crewDepartments (credits) {
  const groups = new Map()
  for (const credit of credits) {
    if (!credit.person?.id) continue
    const roles = credit.roles?.length ? credit.roles : [{ job: credit.job, department: credit.department }]
    for (const role of roles) {
      const department = role.department || 'Other crew'
      if (!groups.has(department)) groups.set(department, new Map())
      const people = groups.get(department)
      if (!people.has(credit.person.id)) people.set(credit.person.id, { person: credit.person, jobs: new Set() })
      if (role.job) people.get(credit.person.id).jobs.add(role.job)
    }
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([name, people]) => ({
    name, people: [...people.values()].map(entry => ({ person: entry.person, jobs: [...entry.jobs].join(' · ') }))
  }))
}
