export const createDefaultBrowseFilters = (overrides = {}) => ({
  sort: 'createdAt',
  order: 'desc',
  count: 30,
  q: '',
  genre: [],
  yearFrom: null,
  yearTo: null,
  watched: 'all',
  libraryPath: null,
  ...overrides
})

export const createDefaultBrowseState = (filterOverrides = {}) => ({
  items: [],
  pageInfo: {
    hasNextPage: false,
    nextCursor: null,
    count: 0
  },
  appliedFilters: {},
  facets: {
    genres: [],
    years: []
  },
  filters: createDefaultBrowseFilters(filterOverrides),
  loading: false,
  loadingMore: false,
  error: null,
  requestKey: 0
})

export const createBrowseActions = ({
  types,
  browseRequest,
  fallbackErrorMessage
}) => ({
  setBrowseFilters ({ commit }, filters) {
    commit(types.SET_FILTERS, filters)
  },
  resetBrowse ({ commit }) {
    commit(types.RESET)
  },
  async fetchBrowse ({ commit, state }, { append = false } = {}) {
    const requestKey = state.browse.requestKey + 1
    const cursor = append ? state.browse.pageInfo.nextCursor : null

    commit(types.SET_LOADING, { loading: true, loadingMore: append, requestKey })
    commit(types.SET_ERROR, { error: null, requestKey })

    try {
      const browseData = await browseRequest({
        ...state.browse.filters,
        cursor,
        page: 0
      })

      commit(types.RECEIVE, {
        browseData,
        append,
        requestKey
      })
    } catch (error) {
      const message = (error && error.response && error.response.data && error.response.data.message) || error.message || fallbackErrorMessage
      commit(types.SET_ERROR, {
        error: message,
        requestKey
      })
    } finally {
      commit(types.SET_LOADING, { loading: false, loadingMore: false, requestKey })
    }
  }
})

export const createBrowseMutations = ({
  types,
  createState
}) => ({
  [types.SET_FILTERS] (state, filters) {
    state.browse.filters = {
      ...state.browse.filters,
      ...filters
    }
  },
  [types.SET_LOADING] (state, { loading, loadingMore, requestKey }) {
    if (requestKey && requestKey < state.browse.requestKey) return

    if (requestKey) {
      state.browse.requestKey = requestKey
    }

    state.browse.loading = loading
    state.browse.loadingMore = loadingMore
  },
  [types.SET_ERROR] (state, { error, requestKey }) {
    if (requestKey && requestKey < state.browse.requestKey) return

    state.browse.error = error
  },
  [types.RECEIVE] (state, { browseData, append, requestKey }) {
    if (requestKey < state.browse.requestKey) return

    const currentItems = append ? state.browse.items : []
    const mergedItems = currentItems.concat(browseData.items || [])

    state.browse.items = mergedItems
    state.browse.pageInfo = browseData.pageInfo || {
      hasNextPage: false,
      nextCursor: null,
      count: mergedItems.length
    }
    state.browse.appliedFilters = browseData.appliedFilters || {}
    state.browse.facets = browseData.facets || {
      genres: [],
      years: []
    }
    state.browse.error = null
  },
  [types.RESET] (state) {
    state.browse = createState()
  }
})
