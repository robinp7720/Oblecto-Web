import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Hls from 'hls.js';
import {
  Activity,
  AlertTriangle,
  Clapperboard,
  Cog,
  Database,
  Film,
  FolderPlus,
  HardDrive,
  Home,
  Library,
  LogOut,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Server,
  Trash2,
  Tv,
  Upload,
  Users
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ApiError, apiUrl, browse, createSession, request } from './api';
import { useAuth } from './state';
import type { BrowseEnvelope, Episode, MediaFile, MediaSet, Movie, Series, SystemInfo, User } from './types';
import {
  bestFile,
  compactPath,
  episodeCode,
  episodeTitle,
  firstTrack,
  formatMinutes,
  formatSeconds,
  groupEpisodesBySeason,
  movieTitle,
  parseGenres,
  progressPercent,
  seriesTitle,
  streamLabel,
  streamsOf,
  yearFromDate
} from './utils';

type MediaKind = 'movie' | 'episode';

function ErrorText({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : String(error);
  return <p className="error">{message}</p>;
}

function LoadingRows() {
  return (
    <div className="grid cards">
      {Array.from({ length: 8 }).map((_, index) => <div className="skeleton-card" key={index} />)}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return <div className="progress"><span style={{ width: `${value}%` }} /></div>;
}

function PosterImage({ src, alt }: { src: string; alt: string }) {
  return <img loading="lazy" src={src} alt={alt} onError={event => event.currentTarget.classList.add('missing')} />;
}

function MovieCard({ movie }: { movie: Movie }) {
  const title = movieTitle(movie);
  const track = firstTrack(movie);
  return (
    <Link className="media-card" to={`/movies/${movie.id}`}>
      <PosterImage src={apiUrl(`/movie/${movie.id}/poster`, { size: 'medium' })} alt="" />
      <div>
        <strong>{title}</strong>
        <span>{yearFromDate(movie.releaseDate)} {movie.runtime ? `- ${formatMinutes(movie.runtime)}` : ''}</span>
        <ProgressBar value={progressPercent(track)} />
      </div>
    </Link>
  );
}

function SeriesCard({ series }: { series: Series }) {
  return (
    <Link className="media-card" to={`/series/${series.id}`}>
      <PosterImage src={apiUrl(`/series/${series.id}/poster`, { size: 'medium' })} alt="" />
      <div>
        <strong>{seriesTitle(series)}</strong>
        <span>{yearFromDate(series.firstAired)} {series.status ? `- ${series.status}` : ''}</span>
      </div>
    </Link>
  );
}

function EpisodeRow({ episode }: { episode: Episode }) {
  const title = `${episodeCode(episode)} - ${episodeTitle(episode)}`;
  const track = firstTrack(episode);
  return (
    <Link className="episode-row" to={`/episodes/${episode.id}`}>
      <img src={apiUrl(`/episode/${episode.id}/banner`, { size: 'medium' })} alt="" />
      <div>
        <strong>{title}</strong>
        <span>{episode.Series ? seriesTitle(episode.Series) : yearFromDate(episode.firstAired)}</span>
        <ProgressBar value={progressPercent(track)} />
      </div>
      <Play size={18} />
    </Link>
  );
}

function Shell() {
  const auth = useAuth();
  const links = [
    ['/', Home, 'Home'],
    ['/movies', Film, 'Movies'],
    ['/series', Tv, 'TV Shows'],
    ['/search', Search, 'Search'],
    ['/sets', Library, 'Sets'],
    ['/files', HardDrive, 'Files'],
    ['/users', Users, 'Users'],
    ['/system', Activity, 'System'],
    ['/settings', Cog, 'Settings']
  ] as const;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <img src="/web/logo.png" alt="" />
          <span>Oblecto</span>
        </Link>
        <nav>
          {links.map(([to, Icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="ghost full" onClick={auth.logout}>
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </aside>
      <main>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="movies" element={<BrowsePage media="movies" />} />
          <Route path="movies/:id" element={<MovieDetail />} />
          <Route path="series" element={<BrowsePage media="series" />} />
          <Route path="series/:id" element={<SeriesDetail />} />
          <Route path="episodes/:id" element={<EpisodeDetail />} />
          <Route path="watch/movie/:id" element={<PlayerPage kind="movie" />} />
          <Route path="watch/episode/:id" element={<PlayerPage kind="episode" />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="sets" element={<SetsPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await auth.login(username, password);
      navigate('/');
    } catch (nextError) {
      setError(nextError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <img src="/web/logo.png" alt="" />
        <h1>Oblecto</h1>
        <label>
          Username
          <input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </label>
        <button disabled={busy || username.length === 0} type="submit">{busy ? 'Signing in...' : 'Sign in'}</button>
        <ErrorText error={error} />
      </form>
    </main>
  );
}

function HomePage() {
  const moviesWatching = useQuery({ queryKey: ['moviesWatching'], queryFn: () => request<Movie[]>('/movies/watching') });
  const episodesWatching = useQuery({ queryKey: ['episodesWatching'], queryFn: () => request<Episode[]>('/episodes/watching') });
  const nextEpisodes = useQuery({
    queryKey: ['episodesNext'],
    queryFn: async () => {
      try {
        return await request<Episode[]>('/episodes/next');
      } catch (error) {
        if (error instanceof ApiError && error.status === 501) return [];
        throw error;
      }
    }
  });
  const recentMovies = useQuery({
    queryKey: ['recentMovies'],
    queryFn: () => browse<Movie>('movies', 'createdAt', { order: 'desc', count: 12 })
  });
  const recentSeries = useQuery({
    queryKey: ['recentSeries'],
    queryFn: () => browse<Series>('series', 'createdAt', { order: 'desc', count: 12 })
  });

  return (
    <section>
      <PageHeader title="Home" subtitle="Continue watching, jump into TV, or browse recent additions." />
      <MediaRail title="Continue Movies" loading={moviesWatching.isLoading}>
        {moviesWatching.data?.map(movie => <MovieCard movie={movie} key={movie.id} />)}
      </MediaRail>
      <MediaRail title="Continue Episodes" loading={episodesWatching.isLoading}>
        {episodesWatching.data?.map(episode => <EpisodeRow episode={episode} key={episode.id} />)}
      </MediaRail>
      <MediaRail title="Next Up" loading={nextEpisodes.isLoading}>
        {nextEpisodes.data?.map(episode => <EpisodeRow episode={episode} key={episode.id} />)}
      </MediaRail>
      <MediaRail title="Recently Added Movies" loading={recentMovies.isLoading}>
        {recentMovies.data?.items.map(movie => <MovieCard movie={movie} key={movie.id} />)}
      </MediaRail>
      <MediaRail title="Recently Added TV" loading={recentSeries.isLoading}>
        {recentSeries.data?.items.map(series => <SeriesCard series={series} key={series.id} />)}
      </MediaRail>
    </section>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

function MediaRail({ title, loading, children }: { title: string; loading?: boolean; children?: React.ReactNode }) {
  const count = Array.isArray(children) ? children.filter(Boolean).length : children ? 1 : 0;
  if (!loading && count === 0) return null;
  return (
    <section className="rail">
      <h2>{title}</h2>
      {loading ? <LoadingRows /> : <div className="horizontal-list">{children}</div>}
    </section>
  );
}

function BrowsePage({ media }: { media: 'movies' | 'series' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMovies = media === 'movies';
  const query = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const year = searchParams.get('year') ?? '';
  const watched = searchParams.get('watched') ?? 'all';
  const sort = searchParams.get('sort') ?? (isMovies ? 'movieName' : 'seriesName');
  const order = searchParams.get('order') ?? 'asc';

  const result = useInfiniteQuery({
    queryKey: [media, 'browse', query, genre, year, watched, sort, order],
    queryFn: ({ pageParam }) => browse<Movie | Series>(media, sort, {
      order,
      q: query,
      genre,
      yearFrom: year,
      yearTo: year,
      watched,
      count: 36,
      cursor: pageParam
    }),
    initialPageParam: '',
    getNextPageParam: page => page.pageInfo.nextCursor || undefined
  });

  const firstPage = result.data?.pages[0] as BrowseEnvelope<Movie | Series> | undefined;
  const items = result.data?.pages.flatMap(page => page.items) ?? [];

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <section>
      <PageHeader title={isMovies ? 'Movies' : 'TV Shows'} subtitle="Browse, filter, and sort your library." />
      <div className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={event => setParam('q', event.target.value)} placeholder="Search title" />
        </label>
        <select value={genre} onChange={event => setParam('genre', event.target.value)}>
          <option value="">All genres</option>
          {firstPage?.facets.genres.map(item => <option value={item} key={item}>{item}</option>)}
        </select>
        <select value={year} onChange={event => setParam('year', event.target.value)}>
          <option value="">All years</option>
          {[...(firstPage?.facets.years ?? [])].reverse().map((item: number) => <option value={item} key={item}>{item}</option>)}
        </select>
        <select value={watched} onChange={event => setParam('watched', event.target.value)}>
          <option value="all">All watch states</option>
          <option value="inprogress">In progress</option>
          <option value="unwatched">Unwatched</option>
          <option value="watched">Watched</option>
        </select>
        <select value={sort} onChange={event => setParam('sort', event.target.value)}>
          {(isMovies ? ['movieName', 'releaseDate', 'createdAt', 'runtime', 'popularity'] : ['seriesName', 'firstAired', 'createdAt', 'siteRating', 'popularity']).map(item => (
            <option value={item} key={item}>{item}</option>
          ))}
        </select>
        <select value={order} onChange={event => setParam('order', event.target.value)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
      <ErrorText error={result.error} />
      {result.isLoading ? <LoadingRows /> : (
        <div className="grid cards">
          {items.map(item => isMovies
            ? <MovieCard movie={item as Movie} key={`movie-${item.id}`} />
            : <SeriesCard series={item as Series} key={`series-${item.id}`} />)}
        </div>
      )}
      {result.hasNextPage ? (
        <button className="load-more" onClick={() => void result.fetchNextPage()} disabled={result.isFetchingNextPage}>
          {result.isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      ) : null}
    </section>
  );
}

function MovieDetail() {
  const { id } = useParams();
  const movie = useQuery({ queryKey: ['movie', id], queryFn: () => request<Movie>(`/movie/${id}/info`) });
  const sets = useQuery({ queryKey: ['movieSets', id], queryFn: () => request<MediaSet[]>(`/movie/${id}/sets`) });
  if (movie.isLoading) return <LoadingRows />;
  if (!movie.data) return <ErrorText error={movie.error ?? 'Movie not found'} />;
  const item = movie.data;
  const genres = parseGenres(item.genres);
  return (
    <DetailHero
      background={apiUrl(`/movie/${item.id}/fanart`, { size: 'large' })}
      poster={apiUrl(`/movie/${item.id}/poster`, { size: 'medium' })}
      title={movieTitle(item)}
      meta={[yearFromDate(item.releaseDate), formatMinutes(item.runtime), ...genres.slice(0, 3)].filter(Boolean).join(' - ')}
      overview={item.overview}
      action={<Link className="primary" to={`/watch/movie/${item.id}`}><Play size={18} />Play</Link>}
    >
      <FilePanel files={item.Files} />
      <SetsPanel sets={sets.data} />
    </DetailHero>
  );
}

function SeriesDetail() {
  const { id } = useParams();
  const series = useQuery({ queryKey: ['series', id], queryFn: () => request<Series>(`/series/${id}/info`) });
  const episodes = useQuery({ queryKey: ['seriesEpisodes', id], queryFn: () => request<Episode[]>(`/series/${id}/episodes`) });
  if (series.isLoading) return <LoadingRows />;
  if (!series.data) return <ErrorText error={series.error ?? 'Series not found'} />;
  const groups = groupEpisodesBySeason(episodes.data ?? []);
  const genres = parseGenres(series.data.genre);
  return (
    <DetailHero
      poster={apiUrl(`/series/${series.data.id}/poster`, { size: 'medium' })}
      title={seriesTitle(series.data)}
      meta={[yearFromDate(series.data.firstAired), series.data.status, series.data.network, ...genres.slice(0, 2)].filter(Boolean).join(' - ')}
      overview={series.data.overview}
    >
      <section className="panel">
        <h2>Episodes</h2>
        {[...groups.entries()].map(([season, group]) => (
          <div className="season" key={season}>
            <h3>Season {season}</h3>
            {group.map(episode => <EpisodeRow episode={episode} key={episode.id} />)}
          </div>
        ))}
      </section>
    </DetailHero>
  );
}

function EpisodeDetail() {
  const { id } = useParams();
  const episode = useQuery({ queryKey: ['episode', id], queryFn: () => request<Episode>(`/episode/${id}/info`) });
  if (episode.isLoading) return <LoadingRows />;
  if (!episode.data) return <ErrorText error={episode.error ?? 'Episode not found'} />;
  const item = episode.data;
  return (
    <DetailHero
      background={apiUrl(`/episode/${item.id}/banner`, { size: 'medium' })}
      poster={item.Series ? apiUrl(`/series/${item.Series.id}/poster`, { size: 'medium' }) : apiUrl(`/episode/${item.id}/banner`, { size: 'medium' })}
      title={`${episodeCode(item)} - ${episodeTitle(item)}`}
      meta={[item.Series ? seriesTitle(item.Series) : '', yearFromDate(item.firstAired)].filter(Boolean).join(' - ')}
      overview={item.overview}
      action={<Link className="primary" to={`/watch/episode/${item.id}`}><Play size={18} />Play</Link>}
    >
      <FilePanel files={item.Files} />
    </DetailHero>
  );
}

function DetailHero({
  background,
  poster,
  title,
  meta,
  overview,
  action,
  children
}: {
  background?: string;
  poster: string;
  title: string;
  meta?: string;
  overview?: string | null;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="detail-hero" style={background ? { backgroundImage: `linear-gradient(90deg, rgba(8,14,20,.96), rgba(8,14,20,.74)), url(${background})` } : undefined}>
        <img className="detail-poster" src={poster} alt="" />
        <div>
          <h1>{title}</h1>
          {meta ? <p className="meta">{meta}</p> : null}
          {overview ? <p>{overview}</p> : null}
          {action}
        </div>
      </div>
      <div className="detail-content">{children}</div>
    </section>
  );
}

function FilePanel({ files }: { files?: MediaFile[] }) {
  return (
    <section className="panel">
      <h2>Files</h2>
      {files?.length ? files.map(file => (
        <div className="data-row" key={file.id}>
          <HardDrive size={18} />
          <div>
            <strong>{file.name || `File ${file.id}`}</strong>
            <span>{compactPath(file.path)}</span>
          </div>
          <span>{file.videoCodec || file.container || file.extension}</span>
          <span>{formatSeconds(file.duration)}</span>
        </div>
      )) : <p className="muted">No files are available.</p>}
    </section>
  );
}

function SetsPanel({ sets }: { sets?: MediaSet[] }) {
  if (!sets?.length) return null;
  return (
    <section className="panel">
      <h2>Sets</h2>
      {sets.map(set => <div className="data-row" key={set.id}><Library size={18} /><strong>{set.setName}</strong><span>{set.overview}</span></div>)}
    </section>
  );
}

function PlayerPage({ kind }: { kind: MediaKind }) {
  const { id } = useParams();
  const auth = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const query = useQuery({
    queryKey: [kind, 'play', id],
    queryFn: () => request<Movie | Episode>(kind === 'movie' ? `/movie/${id}/info` : `/episode/${id}/info`)
  });
  const [fileId, setFileId] = useState<number | null>(null);
  const [audioIndex, setAudioIndex] = useState<number | null>(null);
  const [subtitleIndex, setSubtitleIndex] = useState<number | null>(null);
  const [subtitleMode, setSubtitleMode] = useState<'off' | 'auto' | 'forced'>('auto');
  const [error, setError] = useState<unknown>(null);

  const item = query.data;
  const file = useMemo(() => item ? (item.Files?.find(candidate => candidate.id === fileId) ?? bestFile(item.Files)) : undefined, [fileId, item]);
  const title = item ? (kind === 'movie' ? movieTitle(item as Movie) : episodeTitle(item as Episode)) : 'Player';
  const track = item ? firstTrack(item) : undefined;

  useEffect(() => {
    if (!auth.token) return;
    const socket = io(window.location.origin, { path: '/socket.io' });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('authenticate', { token: auth.token }));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [auth.token]);

  useEffect(() => {
    if (!file) return;
    setFileId(current => current ?? file.id);
  }, [file]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !item) return;
    const emitProgress = () => {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : file?.duration ?? 0;
      const payload = {
        type: kind === 'movie' ? 'movie' : 'tv',
        time: video.currentTime,
        progress: duration > 0 ? Math.min(video.currentTime / duration, 1) : 0,
        ...(kind === 'movie' ? { movieId: String(item.id) } : { episodeId: String(item.id) })
      };
      socketRef.current?.emit('playing', payload);
    };
    const interval = window.setInterval(emitProgress, 5000);
    video.addEventListener('pause', emitProgress);
    video.addEventListener('ended', emitProgress);
    window.addEventListener('beforeunload', emitProgress);
    return () => {
      window.clearInterval(interval);
      video.removeEventListener('pause', emitProgress);
      video.removeEventListener('ended', emitProgress);
      window.removeEventListener('beforeunload', emitProgress);
    };
  }, [file?.duration, item, kind]);

  async function startPlayback(selectedType: 'hls' | 'directhttp' | 'recode' = 'hls') {
    if (!file || !videoRef.current) return;
    setError(null);
    try {
      const session = await createSession(file.id, {
        type: selectedType,
        offset: track?.time ?? 0,
        audioStreamIndex: audioIndex,
        subtitleStreamIndex: subtitleMode === 'off' ? -1 : subtitleIndex,
        subtitleMode
      });
      const source = apiUrl(`/session/stream/${session.sessionId}`);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (selectedType === 'hls' && Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(source);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = source;
      }
      await videoRef.current.play();
    } catch (nextError) {
      if (selectedType === 'hls') {
        await startPlayback('directhttp');
        return;
      }
      setError(nextError);
    }
  }

  if (query.isLoading) return <LoadingRows />;
  if (!item) return <ErrorText error={query.error ?? 'Media item not found'} />;
  const audioStreams = streamsOf(file, 'audio');
  const subtitleStreams = streamsOf(file, 'subtitle');

  return (
    <section className="player-page">
      <PageHeader title={title} subtitle={kind === 'episode' && (item as Episode).Series ? seriesTitle((item as Episode).Series!) : undefined} />
      <video ref={videoRef} controls playsInline poster={kind === 'movie' ? apiUrl(`/movie/${item.id}/fanart`, { size: 'large' }) : apiUrl(`/episode/${item.id}/banner`, { size: 'medium' })} />
      <div className="player-controls">
        <button className="primary" onClick={() => void startPlayback()}><Play size={18} />Start</button>
        <select value={file?.id ?? ''} onChange={event => setFileId(Number(event.target.value))}>
          {item.Files?.map(candidate => <option value={candidate.id} key={candidate.id}>{candidate.name || candidate.path || `File ${candidate.id}`}</option>)}
        </select>
        <select value={audioIndex ?? ''} onChange={event => setAudioIndex(event.target.value ? Number(event.target.value) : null)}>
          <option value="">Default audio</option>
          {audioStreams.map(stream => <option value={stream.index ?? ''} key={stream.id ?? stream.index}>{streamLabel(stream)}</option>)}
        </select>
        <select value={subtitleMode} onChange={event => setSubtitleMode(event.target.value as 'off' | 'auto' | 'forced')}>
          <option value="auto">Auto subtitles</option>
          <option value="forced">Forced only</option>
          <option value="off">Subtitles off</option>
        </select>
        <select value={subtitleIndex ?? ''} onChange={event => setSubtitleIndex(event.target.value ? Number(event.target.value) : null)} disabled={subtitleMode === 'off'}>
          <option value="">Default subtitle</option>
          {subtitleStreams.map(stream => <option value={stream.index ?? ''} key={stream.id ?? stream.index}>{streamLabel(stream)}</option>)}
        </select>
      </div>
      <p className="muted">Resume point: {formatSeconds(track?.time)}</p>
      <ErrorText error={error} />
    </section>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const enabled = query.trim().length > 1;
  const movies = useQuery({ queryKey: ['searchMovies', query], enabled, queryFn: () => request<Movie[]>(`/movies/search/${encodeURIComponent(query)}`) });
  const series = useQuery({ queryKey: ['searchSeries', query], enabled, queryFn: () => request<Series[]>(`/shows/search/${encodeURIComponent(query)}`) });
  const episodes = useQuery({ queryKey: ['searchEpisodes', query], enabled, queryFn: () => request<Episode[]>(`/episodes/search/${encodeURIComponent(query)}`) });
  return (
    <section>
      <PageHeader title="Search" subtitle="Search movies, shows, and episodes." />
      <label className="search-box wide">
        <Search size={18} />
        <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your library" />
      </label>
      <MediaRail title="Movies" loading={movies.isLoading}>{movies.data?.map(movie => <MovieCard movie={movie} key={movie.id} />)}</MediaRail>
      <MediaRail title="TV Shows" loading={series.isLoading}>{series.data?.map(item => <SeriesCard series={item} key={item.id} />)}</MediaRail>
      <MediaRail title="Episodes" loading={episodes.isLoading}>{episodes.data?.map(episode => <EpisodeRow episode={episode} key={episode.id} />)}</MediaRail>
    </section>
  );
}

function SetsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [overview, setOverview] = useState('');
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const movieSets = useQuery({ queryKey: ['movieSets'], queryFn: () => request<MediaSet[]>('/movies/sets') });
  const seriesSets = useQuery({ queryKey: ['seriesSets'], queryFn: () => request<MediaSet[]>('/series/sets') });
  const create = useMutation({
    mutationFn: () => request<MediaSet>(`/set/${type}`, { method: 'POST', body: JSON.stringify({ name, overview, public: true }) }),
    onSuccess: async () => {
      setName('');
      setOverview('');
      await queryClient.invalidateQueries({ queryKey: [type === 'movie' ? 'movieSets' : 'seriesSets'] });
    }
  });
  const remove = useMutation({
    mutationFn: ({ id, setType }: { id: number; setType: 'movie' | 'series' }) => request(`/set/${setType}/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['movieSets'] });
      await queryClient.invalidateQueries({ queryKey: ['seriesSets'] });
    }
  });
  return (
    <section>
      <PageHeader title="Sets" subtitle="Curate movie and TV collections." />
      <form className="panel form-grid" onSubmit={event => { event.preventDefault(); create.mutate(); }}>
        <select value={type} onChange={event => setType(event.target.value as 'movie' | 'series')}><option value="movie">Movie set</option><option value="series">Series set</option></select>
        <input value={name} onChange={event => setName(event.target.value)} placeholder="Name" />
        <input value={overview} onChange={event => setOverview(event.target.value)} placeholder="Overview" />
        <button disabled={!name}><Plus size={18} />Create</button>
      </form>
      <SetList title="Movie Sets" sets={movieSets.data} onDelete={id => remove.mutate({ id, setType: 'movie' })} />
      <SetList title="Series Sets" sets={seriesSets.data} onDelete={id => remove.mutate({ id, setType: 'series' })} />
      <ErrorText error={create.error ?? remove.error} />
    </section>
  );
}

function SetList({ title, sets, onDelete }: { title: string; sets?: MediaSet[]; onDelete: (id: number) => void }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {sets?.map(set => (
        <div className="data-row" key={set.id}>
          <Library size={18} />
          <strong>{set.setName}</strong>
          <span>{set.overview}</span>
          <button className="icon" title="Delete" onClick={() => onDelete(set.id)}><Trash2 size={17} /></button>
        </div>
      ))}
    </section>
  );
}

function FilesPage() {
  const queryClient = useQueryClient();
  const duplicates = useQuery({ queryKey: ['duplicates'], queryFn: () => request<MediaFile[][]>('/files/duplicates') });
  const problematic = useQuery({ queryKey: ['problematic'], queryFn: () => request<MediaFile[]>('/files/problematic') });
  const retry = useMutation({
    mutationFn: (id: number) => request(`/files/${id}/retry`, { method: 'POST' }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['problematic'] })
  });
  return (
    <section>
      <PageHeader title="Files" subtitle="Find duplicate media and retry problematic imports." />
      <section className="panel">
        <h2>Problematic Files</h2>
        {problematic.data?.map(file => (
          <div className="data-row" key={file.id}>
            <AlertTriangle size={18} />
            <div><strong>{file.name || `File ${file.id}`}</strong><span>{file.error || compactPath(file.path)}</span></div>
            <button onClick={() => retry.mutate(file.id)}><RefreshCw size={17} />Retry</button>
          </div>
        ))}
      </section>
      <section className="panel">
        <h2>Duplicates</h2>
        {duplicates.data?.map((group, index) => (
          <div className="duplicate-group" key={index}>
            {group.map(file => <div className="data-row" key={file.id}><HardDrive size={18} /><span>{compactPath(file.path)}</span></div>)}
          </div>
        ))}
      </section>
      <ErrorText error={duplicates.error ?? problematic.error ?? retry.error} />
    </section>
  );
}

function UsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ['users'], queryFn: () => request<User[]>('/users') });
  const [draft, setDraft] = useState({ username: '', name: '', email: '', password: '' });
  const create = useMutation({
    mutationFn: () => request<User>('/user', { method: 'POST', body: JSON.stringify(draft) }),
    onSuccess: async () => {
      setDraft({ username: '', name: '', email: '', password: '' });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  const remove = useMutation({
    mutationFn: (id: number) => request(`/user/${id}`, { method: 'DELETE' }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });
  return (
    <section>
      <PageHeader title="Users" subtitle="Manage Oblecto accounts." />
      <form className="panel form-grid" onSubmit={event => { event.preventDefault(); create.mutate(); }}>
        <input value={draft.username} onChange={event => setDraft({ ...draft, username: event.target.value })} placeholder="Username" />
        <input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Name" />
        <input value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} placeholder="Email" />
        <input value={draft.password} onChange={event => setDraft({ ...draft, password: event.target.value })} placeholder="Password" type="password" />
        <button disabled={!draft.username || !draft.email || !draft.name}><Plus size={18} />Create</button>
      </form>
      <section className="panel">
        {users.data?.map(user => (
          <div className="data-row" key={user.id}>
            <Users size={18} />
            <div><strong>{user.username}</strong><span>{user.name} - {user.email}</span></div>
            <button className="icon" title="Delete" onClick={() => remove.mutate(user.id)}><Trash2 size={17} /></button>
          </div>
        ))}
      </section>
      <ErrorText error={users.error ?? create.error ?? remove.error} />
    </section>
  );
}

function SystemPage() {
  const info = useQuery({ queryKey: ['systemInfo'], queryFn: () => request<SystemInfo>('/api/v1/system/info') });
  const sessions = useQuery({ queryKey: ['statusSessions'], queryFn: () => request<Record<string, unknown>[]>('/api/v1/status/sessions'), refetchInterval: 5000 });
  const clients = useQuery({ queryKey: ['statusClients'], queryFn: () => request<Record<string, unknown>[]>('/api/v1/status/clients'), refetchInterval: 5000 });
  const seedbox = useQuery({ queryKey: ['statusSeedbox'], queryFn: () => request<Record<string, unknown>>('/api/v1/status/seedbox'), refetchInterval: 5000 });
  return (
    <section>
      <PageHeader title="System" subtitle="Runtime status and connected clients." />
      <div className="dashboard-grid">
        <StatusCard icon={<Server />} title="Version" value={info.data?.version ?? 'Unknown'} />
        <StatusCard icon={<Activity />} title="Uptime" value={formatSeconds(info.data?.uptime)} />
        <StatusCard icon={<Clapperboard />} title="Sessions" value={String(sessions.data?.length ?? 0)} />
        <StatusCard icon={<Users />} title="Clients" value={String(clients.data?.length ?? 0)} />
      </div>
      <JsonPanel title="Active Sessions" data={sessions.data} />
      <JsonPanel title="Realtime Clients" data={clients.data} />
      <JsonPanel title="Seedbox" data={seedbox.data} />
      <ErrorText error={info.error ?? sessions.error ?? clients.error ?? seedbox.error} />
    </section>
  );
}

function StatusCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <div className="status-card">{icon}<span>{title}</span><strong>{value}</strong></div>;
}

function JsonPanel({ title, data }: { title: string; data: unknown }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <pre>{JSON.stringify(data ?? [], null, 2)}</pre>
    </section>
  );
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ['settings'], queryFn: () => request<Record<string, unknown>>('/api/v1/settings') });
  const libraries = useQuery({ queryKey: ['libraries'], queryFn: () => request<Record<string, { directories?: { path: string }[] }>>('/api/v1/libraries') });
  const [section, setSection] = useState('server');
  const [editor, setEditor] = useState('{}');
  const [pathDraft, setPathDraft] = useState('');
  const [libraryType, setLibraryType] = useState<'movies' | 'tvshows'>('movies');
  const saveSettings = useMutation({
    mutationFn: () => request(`/api/v1/settings/${section}`, { method: 'PATCH', body: editor }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });
  const addPath = useMutation({
    mutationFn: () => request(`/api/v1/libraries/${libraryType}/paths`, { method: 'POST', body: JSON.stringify({ path: pathDraft }) }),
    onSuccess: async () => {
      setPathDraft('');
      await queryClient.invalidateQueries({ queryKey: ['libraries'] });
    }
  });
  const removePath = useMutation({
    mutationFn: ({ type, path }: { type: string; path: string }) => request(`/api/v1/libraries/${type}/paths`, { method: 'DELETE', body: JSON.stringify({ path }) }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['libraries'] })
  });
  const maintenance = useMutation({
    mutationFn: ({ action, target }: { action: string; target: string }) => request('/api/v1/system/maintenance', { method: 'POST', body: JSON.stringify({ action, target }) })
  });
  const imports = useMutation({
    mutationFn: (type: string) => request('/api/v1/system/imports', { method: 'POST', body: JSON.stringify({ type }) })
  });

  useEffect(() => {
    if (settings.data?.[section] !== undefined) {
      setEditor(JSON.stringify(settings.data[section], null, 2));
    }
  }, [section, settings.data]);

  const sections = Object.keys(settings.data ?? {}).sort();
  return (
    <section>
      <PageHeader title="Settings" subtitle="Configure libraries, imports, maintenance, and server sections." />
      <section className="panel">
        <h2>Libraries</h2>
        {(['movies', 'tvshows'] as const).map(type => (
          <div className="library-block" key={type}>
            <h3>{type}</h3>
            {libraries.data?.[type]?.directories?.map(entry => (
              <div className="data-row" key={entry.path}>
                <Database size={18} />
                <span>{entry.path}</span>
                <button className="icon" title="Remove" onClick={() => removePath.mutate({ type, path: entry.path })}><Trash2 size={17} /></button>
              </div>
            ))}
          </div>
        ))}
        <form className="form-grid" onSubmit={event => { event.preventDefault(); addPath.mutate(); }}>
          <select value={libraryType} onChange={event => setLibraryType(event.target.value as 'movies' | 'tvshows')}><option value="movies">Movies</option><option value="tvshows">TV Shows</option></select>
          <input value={pathDraft} onChange={event => setPathDraft(event.target.value)} placeholder="/path/to/media" />
          <button disabled={!pathDraft}><FolderPlus size={18} />Add path</button>
        </form>
      </section>
      <section className="panel">
        <h2>Maintenance</h2>
        <div className="button-row">
          {['scan', 'update_artwork', 'update_metadata', 'clean'].map(action => <button key={action} onClick={() => maintenance.mutate({ action, target: 'all' })}><RefreshCw size={17} />{action}</button>)}
          <button onClick={() => imports.mutate('movies')}><Upload size={17} />Import movies</button>
          <button onClick={() => imports.mutate('tvshows')}><Upload size={17} />Import TV</button>
        </div>
      </section>
      <section className="panel settings-editor">
        <h2>Configuration</h2>
        <select value={section} onChange={event => setSection(event.target.value)}>
          {sections.map(item => <option value={item} key={item}>{item}</option>)}
        </select>
        <textarea value={editor} onChange={event => setEditor(event.target.value)} spellCheck={false} />
        <button onClick={() => saveSettings.mutate()}><Save size={18} />Save section</button>
      </section>
      <ErrorText error={settings.error ?? libraries.error ?? saveSettings.error ?? addPath.error ?? removePath.error ?? maintenance.error ?? imports.error} />
    </section>
  );
}

function App() {
  const auth = useAuth();
  if (!auth.token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}

export default App;
