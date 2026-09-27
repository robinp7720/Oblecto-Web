import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'
import { imageUrl } from '@/utils/media'

const refreshTimers = new WeakMap()
const watchCategory = progress => progress >= 0.9 ? 'watched' : progress > 0 ? 'inprogress' : 'unwatched'

function createLibraryState () {
  return {
    filters: {
      q: '',
      sort: 'createdAt',
      order: 'desc',
      watched: 'all',
      genre: [],
      libraryPath: '',
      yearFrom: '',
      yearTo: '',
      personId: '',
      creditRole: 'any',
      count: 30
    },
    facets: {
      genres: []
    },
    items: [],
    pageInfo: null,
    loading: false,
    loadingMore: false,
    busy: false,
    requestId: 0,
    pagesLoaded: 0,
    refreshPending: false,
    moreError: null,
    librariesLoaded: false,
    error: null,
    libraries: []
  }
}

function createBrowseParams (filters, cursor = null) {
  const params = {
    sort: filters.sort,
    order: filters.order,
    count: filters.count,
    q: filters.q || undefined,
    genre: filters.genre && filters.genre.length ? filters.genre : undefined,
    yearFrom: filters.yearFrom ? Number(filters.yearFrom) : undefined,
    yearTo: filters.yearTo ? Number(filters.yearTo) : undefined,
    watched: filters.watched || 'all',
    libraryPath: filters.libraryPath || undefined,
    personId: filters.personId || undefined,
    creditRole: filters.personId ? filters.creditRole || 'any' : undefined
  }

  if (cursor) {
    params.cursor = cursor
  }

  return params
}

export const useMediaStore = defineStore('media', {
  state: () => ({
    epoch: 0,
    progress: {},
    savedProgress: {},
    deviceSeen: {},
    artworkVersions: {},
    catalogRevision: 0,
    watchRevision: 0,
    catalogPending: false,
    watchPending: false,
    home: {
      sections: {},
      spotlight: null,
      rails: [],
      loading: false,
      error: null
    },
    library: {
      movies: createLibraryState(),
      series: createLibraryState()
    }
  }),
  actions: {
    trackFor (type, item) {
      const original = (type === 'movie' ? item?.TrackMovies : item?.TrackEpisodes)?.[0]
      const live = this.progress[`${type}:${item?.id}`]
      return live && (!original?.updatedAt || Date.parse(live.updatedAt) >= Date.parse(original.updatedAt)) ? live : original
    },
    withProgress (type, item) {
      if (!item || !['movie', 'episode'].includes(type)) return item
      const track = this.trackFor(type, item)
      return track ? { ...item, [type === 'movie' ? 'TrackMovies' : 'TrackEpisodes']: [track] } : item
    },
    artworkUrl (host, type, id, variant) {
      const url = imageUrl(host, type, id, variant)
      const version = this.artworkVersions[`${type}:${id}`]
      return version && url ? `${url}?v=${version}` : url
    },
    applyProgress ({ type, id, track }, { persisted = false } = {}) {
      if (!['movie', 'episode'].includes(type) || id == null || !track) return
      const progress = Number(track.progress)
      const time = Number(track.time)
      const updatedAt = Date.parse(track.updatedAt)
      if (!Number.isFinite(progress) || !Number.isFinite(time) || !Number.isFinite(updatedAt)) return
      const key = `${type}:${id}`
      // Live playback can lead the database by several seconds. A later save
      // must refresh shelf membership even when the live category is unchanged.
      const saved = this.savedProgress[key]
      if (persisted && (!saved || updatedAt > Date.parse(saved.updatedAt))) {
        this.savedProgress[key] = { ...track }
        if (!saved || watchCategory(saved.progress) !== watchCategory(progress)) this.scheduleRefresh('watch')
      }
      const previous = this.progress[key]
      if (previous && updatedAt <= Date.parse(previous.updatedAt)) return
      this.progress[key] = { ...track, time: Math.max(0, time), progress: Math.max(0, Math.min(1, progress)) }
      this.selectHomeSpotlight()
      if (!previous || watchCategory(previous.progress) !== watchCategory(progress)) this.scheduleRefresh('watch')
    },
    applyDevices (devices) {
      for (const device of devices || []) {
        const state = device.state
        if (!state?.media || !(state.duration > 0) || this.deviceSeen[device.deviceId] >= state.updatedAt) continue
        this.deviceSeen[device.deviceId] = state.updatedAt
        this.applyProgress({ type: state.media.kind, id: state.media.id, track: {
          time: state.position, progress: state.position / state.duration, updatedAt: new Date(state.updatedAt).toISOString()
        } })
      }
    },
    libraryEvent (event) {
      if (!['added', 'updated', 'artwork', 'removed'].includes(event?.event)) return
      if (event.id != null) this.artworkVersions[`${event.type}:${event.id}`] = Date.now()
      this.scheduleRefresh('catalog')
    },
    scheduleRefresh (reason = 'catalog') {
      if (reason === 'catalog') this.catalogPending = true
      else this.watchPending = true
      if (refreshTimers.has(this)) return
      // A bounded batch: continuous imports still refresh once each second.
      refreshTimers.set(this, setTimeout(() => {
        refreshTimers.delete(this)
        this.flushRefresh()
      }, 750))
    },
    flushRefresh () {
      const catalog = this.catalogPending
      const watched = this.watchPending
      this.catalogPending = this.watchPending = false
      if (catalog) this.catalogRevision++
      if (watched) this.watchRevision++
      if (Object.keys(this.home.sections).length) {
        if (catalog) void this.loadHome(null, { silent: true })
        else if (watched) for (const id of ['continue-movies', 'continue-episodes', 'next-episodes']) void this.loadHome(id, { silent: true })
      }
      for (const [type, state] of Object.entries(this.library)) {
        if (!state.requestId || (!catalog && !watched)) continue
        if (state.busy) state.refreshPending = true
        else void this.loadLibrary(type, { silent: true, preservePages: true })
      }
    },
    resync () {
      this.deviceSeen = {}
      // REST snapshots after reconnect replace any missed watch resets.
      this.progress = {}
      this.savedProgress = {}
      this.scheduleRefresh('catalog')
    },
    reset () {
      clearTimeout(refreshTimers.get(this))
      refreshTimers.delete(this)
      const epoch = this.epoch + 1
      this.$reset()
      this.epoch = epoch
    },
    selectHomeSpotlight () {
      const sections = this.home.sections
      const priority = ['continue-movies', 'continue-episodes', 'next-episodes']
      // A fallback chosen before watch-history requests finish would flash and
      // then turn into a resume title while someone is reading the page.
      if (priority.some(id => !sections[id]?.settled || sections[id].busy)) return

      const unfinished = [
        ...(sections['continue-movies']?.items || []).map(item => ({ type: 'movie', item })),
        ...(sections['continue-episodes']?.items || []).map(item => ({ type: 'episode', item }))
      ].filter(({ type, item }) => {
        const track = this.trackFor(type, item)
        return Number(track?.time) > 0 && Number(track?.progress) >= 0 && Number(track?.progress) < 0.9
      }).sort((a, b) => {
        const lastWatched = candidate => Date.parse(this.trackFor(candidate.type, candidate.item)?.updatedAt) || 0
        return lastWatched(b) - lastWatched(a)
      })
      const resume = unfinished[0]
      const next = sections['next-episodes']?.items?.[0]
      const movie = sections['recent-movies']?.items?.[0]
      const series = sections['recent-series']?.items?.[0]
      this.home.spotlight = resume
        ? { ...resume, context: 'resume' }
        : next ? { type: 'episode', item: next, context: 'next' }
          : movie ? { type: 'movie', item: movie, context: 'new' }
            : series ? { type: 'series', item: series, context: 'new' } : null
    },
    async loadHome (onlyId = null, { silent = false } = {}) {
      const epoch = this.epoch
      const definitions = [
        ['continue-movies', 'Continue Watching Movies', 'movie', () => oblectoClient.movieLibrary.getWatching()],
        ['continue-episodes', 'Continue Watching Episodes', 'episode', () => oblectoClient.episodeLibrary.getWatching()],
        ['next-episodes', 'Next Up', 'episode', () => oblectoClient.episodeLibrary.getNextUp()],
        ['recent-movies', 'Recently Added Movies', 'movie', () => oblectoClient.movieLibrary.getList('createdAt', 'DESC', 16, 0)],
        ['recent-series', 'Recently Added Series', 'series', () => oblectoClient.seriesLibrary.getList('createdAt', 'DESC', 16, 0)],
        ['recent-episodes', 'Fresh Episodes', 'episode', () => oblectoClient.episodeLibrary.getList('createdAt', 'DESC', 16, 0)],
        ['popular-movies', 'Popular Movies', 'movie', () => oblectoClient.movieLibrary.getList('popularity', 'DESC', 16, 0)],
        ['top-series', 'Top Rated Series', 'series', () => oblectoClient.seriesLibrary.getList('siteRating', 'DESC', 16, 0)],
        ['sets', 'Collections', 'movie', () => oblectoClient.movieLibrary.getSets()]
      ]
      const refresh = () => {
        const sections = this.home.sections
        this.home.loading = Object.values(sections).some(section => section.loading)
        this.home.error = Object.values(sections).some(section => section.error) ? 'Some sections could not be loaded.' : null
        this.home.rails = definitions.flatMap(([id, title, type]) => {
          const items = sections[id]?.items || []
          if (id === 'sets') return items.slice(0, 2).map(set => ({ id: `set-${set.id}`, title: set.setName, type, items: set.movies || set.Movies || [] }))
          return [{ id, title, type, items }]
        }).filter(section => section.items.length)
        this.selectHomeSpotlight()
      }
      const jobs = definitions.filter(([id]) => !onlyId || id === onlyId).filter(([id]) => {
        if (!this.home.sections[id]?.busy) return true
        this.home.sections[id].refreshPending = true
        return false
      })
      for (const [id, title] of jobs) {
        this.home.sections[id] = { ...this.home.sections[id], title, busy: true, loading: !silent, error: null }
      }
      refresh()
      await Promise.all(jobs.map(async ([id, , , fetch]) => {
        const section = this.home.sections[id]
        try {
          const items = await fetch()
          if (epoch !== this.epoch) return
          section.items = Array.isArray(items) ? items : []
        } catch (error) {
          if (epoch !== this.epoch) return
          if (id === 'next-episodes' && error?.response?.status === 501) section.items = []
          else section.error = `Could not load ${section.title.toLowerCase()}.`
        } finally {
          if (epoch === this.epoch) {
            section.settled = true
            section.loading = section.busy = false
            refresh()
            if (section.refreshPending) {
              section.refreshPending = false
              void this.loadHome(id, { silent: true })
            }
          }
        }
      }))
    },
    async ensureLibraries (type) {
      const state = this.library[type]
      if (state.librariesLoaded && state.libraries.length) return

      state.libraries = await oblectoClient.libraries.getLibraryPaths(type === 'movies' ? 'movies' : 'tvshows')
      state.librariesLoaded = true
    },
    updateLibraryFilters (type, patch) {
      this.library[type].filters = {
        ...this.library[type].filters,
        ...patch
      }
    },
    resetLibraryFilters (type) {
      this.library[type] = {
        ...this.library[type],
        ...createLibraryState(),
        libraries: this.library[type].libraries
      }
    },
    async loadLibrary (type, { append = false, silent = false, preservePages = false } = {}) {
      const state = this.library[type]
      const epoch = this.epoch
      const client = type === 'movies' ? oblectoClient.movieLibrary : oblectoClient.seriesLibrary

      if (append && state.busy) return
      const requestId = ++state.requestId
      const params = createBrowseParams(state.filters, append ? state.pageInfo?.nextCursor || null : null)
      state.moreError = null
      if (!append) state.error = null
      state.busy = true
      state.loading = !append && !silent
      state.loadingMore = append

      try {
        await this.ensureLibraries(type)

        let response
        const nextItems = []
        const pageCount = preservePages ? Math.max(1, state.pagesLoaded) : 1
        let fetchedPages = 0
        for (let page = 0; page < pageCount; page++) {
          response = await client.browse(params)
          if (requestId !== state.requestId || epoch !== this.epoch) return
          nextItems.push(...(Array.isArray(response?.items) ? response.items : []))
          fetchedPages++
          if (!response?.pageInfo?.hasNextPage || !response.pageInfo.nextCursor) break
          params.cursor = response.pageInfo.nextCursor
        }

        state.items = [...new Map((append ? [...state.items, ...nextItems] : nextItems).map(item => [String(item.id), item])).values()]
        state.pagesLoaded = append ? state.pagesLoaded + fetchedPages : fetchedPages
        state.facets = response?.facets || { genres: [] }
        state.pageInfo = response?.pageInfo || null
      } catch (error) {
        if (requestId !== state.requestId || epoch !== this.epoch) return
        state[append ? 'moreError' : 'error'] = error.message || `Failed to load ${type}`
      } finally {
        if (requestId === state.requestId && epoch === this.epoch) {
          state.busy = false
          state.loading = false
          state.loadingMore = false
          if (state.refreshPending) {
            state.refreshPending = false
            void this.loadLibrary(type, { silent: true, preservePages: true })
          }
        }
      }
    }
  }
})
