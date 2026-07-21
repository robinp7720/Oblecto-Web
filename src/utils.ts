import type { Episode, MediaFile, MediaStream, Movie, Series, Track } from './types';

export function formatMinutes(value?: number | null): string {
  if (!value) return '';
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatSeconds(value?: number | null): string {
  if (!value || value < 0) return '0:00';
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = Math.floor(value % 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function yearFromDate(value?: string | null): string {
  return value ? String(value).slice(0, 4) : '';
}

export function parseGenres(value?: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Fall back to comma-separated values.
  }
  return trimmed.split(',').map(item => item.trim()).filter(Boolean);
}

export function firstTrack<T extends { TrackMovies?: Track[]; TrackEpisodes?: Track[] }>(item: T): Track | undefined {
  return item.TrackMovies?.[0] ?? item.TrackEpisodes?.[0];
}

export function progressPercent(track?: Track): number {
  const progress = track?.progress ?? 0;
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, progress * 100));
}

export function movieTitle(movie: Movie): string {
  return movie.movieName || movie.originalName || `Movie ${movie.id}`;
}

export function seriesTitle(series: Series): string {
  return series.seriesName || series.alias || `Series ${series.id}`;
}

export function episodeTitle(episode: Episode): string {
  return episode.episodeName || `Episode ${episode.airedEpisodeNumber ?? episode.id}`;
}

export function episodeCode(episode: Episode): string {
  const season = String(episode.airedSeason ?? '?').padStart(2, '0');
  const number = String(episode.airedEpisodeNumber ?? '?').padStart(2, '0');
  return `S${season}E${number}`;
}

export function bestFile(files?: MediaFile[]): MediaFile | undefined {
  return files?.find(file => !file.problematic) ?? files?.[0];
}

export function streamsOf(file: MediaFile | undefined, type: 'audio' | 'subtitle' | 'video'): MediaStream[] {
  return file?.Streams?.filter(stream => stream.codec_type === type) ?? [];
}

export function streamLabel(stream: MediaStream): string {
  const language = stream.tags_language ? stream.tags_language.toUpperCase() : 'Unknown';
  const title = stream.tags_title ? ` - ${stream.tags_title}` : '';
  const codec = stream.codec_name ? ` (${stream.codec_name})` : '';
  const forced = stream.disposition_forced ? ' forced' : '';
  return `#${stream.index ?? '?'} ${language}${title}${codec}${forced}`;
}

export function groupEpisodesBySeason(episodes: Episode[]): Map<string, Episode[]> {
  const seasons = new Map<string, Episode[]>();
  for (const episode of episodes) {
    const season = String(episode.airedSeason ?? '0');
    const group = seasons.get(season) ?? [];
    group.push(episode);
    seasons.set(season, group);
  }
  for (const group of seasons.values()) {
    group.sort((a, b) => Number(a.airedEpisodeNumber ?? 0) - Number(b.airedEpisodeNumber ?? 0));
  }
  return new Map([...seasons.entries()].sort(([a], [b]) => Number(a) - Number(b)));
}

export function compactPath(path?: string | null): string {
  if (!path) return 'Unknown path';
  if (path.length <= 72) return path;
  return `...${path.slice(-69)}`;
}
