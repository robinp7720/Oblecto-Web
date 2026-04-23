import * as types from '../mutation-types'
import oblectoClient from '@/oblectoClient'
import {
  createDefaultBrowseState,
  createBrowseActions,
  createBrowseMutations
} from './browseState'

const createSeriesBrowseState = () => createDefaultBrowseState()

const state = {
  lists: {},
  browse: createSeriesBrowseState()
}

const getters = {

}

const browseMutationTypes = {
  SET_FILTERS: types.SET_SERIES_BROWSE_FILTERS,
  SET_LOADING: types.SET_SERIES_BROWSE_LOADING,
  SET_ERROR: types.SET_SERIES_BROWSE_ERROR,
  RECEIVE: types.RECEIVE_SERIES_BROWSE,
  RESET: types.RESET_SERIES_BROWSE
}

const actions = {
  async getSeries ({ commit }, { sort, order }) {
    let shows = await oblectoClient.seriesLibrary.getList(sort, order, 100, 0)

    commit(types.RECEIVE_SHOWS, { shows, sort })
  },
  ...createBrowseActions({
    types: browseMutationTypes,
    browseRequest: (params) => oblectoClient.seriesLibrary.browse(params),
    fallbackErrorMessage: 'Failed to load series'
  })
}

const mutations = {
  [types.RECEIVE_SHOWS] (state, { shows, sort }) {
    state.lists = {
      ...state.lists,
      [sort]: shows
    }
  },
  ...createBrowseMutations({
    types: browseMutationTypes,
    createState: createSeriesBrowseState
  })
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
