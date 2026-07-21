export interface Track {
  id?: number;
  userId?: number;
  movieId?: number;
  episodeId?: number;
  time?: number | null;
  progress?: number | null;
  updatedAt?: string;
}

export interface MediaStream {
  id?: number;
  index?: number | null;
  codec_name?: string | null;
  codec_type?: 'video' | 'audio' | 'subtitle' | string | null;
  channels?: number | null;
  channel_layout?: string | null;
  width?: number | null;
  height?: number | null;
  tags_language?: string | null;
  tags_title?: string | null;
  disposition_default?: number | null;
  disposition_forced?: number | null;
}

export interface MediaFile {
  id: number;
  host?: string | null;
  path?: string | null;
  name?: string | null;
  extension?: string | null;
  container?: string | null;
  videoCodec?: string | null;
  audioCodec?: string | null;
  duration?: number | null;
  size?: number | string | null;
  problematic?: boolean;
  error?: string | null;
  Streams?: MediaStream[];
}

export interface Movie {
  id: number;
  movieName?: string | null;
  originalName?: string | null;
  tagline?: string | null;
  genres?: string | null;
  runtime?: number | null;
  releaseDate?: string | null;
  overview?: string | null;
  popularity?: number | null;
  Files?: MediaFile[];
  TrackMovies?: Track[];
}

export interface Series {
  id: number;
  seriesName?: string | null;
  alias?: string | null;
  genre?: string | string[] | null;
  status?: string | null;
  firstAired?: string | null;
  network?: string | null;
  runtime?: number | null;
  overview?: string | null;
  siteRating?: number | null;
}

export interface Episode {
  id: number;
  episodeName?: string | null;
  airedSeason?: string | number;
  airedEpisodeNumber?: string | number;
  firstAired?: string | null;
  overview?: string | null;
  SeriesId?: number;
  Series?: Series;
  Files?: MediaFile[];
  TrackEpisodes?: Track[];
}

export interface BrowseEnvelope<T> {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    nextCursor: string | null;
    count: number;
  };
  appliedFilters: Record<string, unknown>;
  facets: {
    genres: string[];
    years: number[];
  };
}

export interface SessionResponse {
  sessionId: string;
  seeking: 'client' | 'server';
  outputCodec: {
    video?: string | null;
    audio?: string | null;
  };
  inputCodec: {
    video?: string | null;
    audio?: string | null;
  };
  selectedTracks?: {
    audioStreamIndex?: number | null;
    subtitleStreamIndex?: number | null;
    subtitleMode?: 'off' | 'auto' | 'forced';
  };
}

export interface User {
  id: number;
  username: string;
  name?: string | null;
  email?: string | null;
}

export interface ApiErrorBody {
  code?: number;
  message?: string;
}

export interface SystemInfo {
  version: string;
  platform: string;
  arch: string;
  uptime: number;
  nodeVersion: string;
  memory: Record<string, number>;
}

export interface MediaSet {
  id: number;
  setName?: string | null;
  overview?: string | null;
  public?: boolean;
  Movies?: Movie[];
  Series?: Series[];
}
