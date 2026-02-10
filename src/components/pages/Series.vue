<template>
  <div class="container">
    <div class="mode-switcher">
      <button
        type="button"
        class="mode-button"
        :class="{ active: activeTab === 'curated' }"
        @click="selectTab('curated')"
      >
        Curated
      </button>
      <button
        type="button"
        class="mode-button"
        :class="{ active: activeTab === 'browse' }"
        @click="selectTab('browse')"
      >
        Browse
      </button>
    </div>

    <div v-if="activeTab === 'curated'">
      <EpisodeList
        title="Recently aired"
        :episodes="episodes.firstAired"
      />
      <SeriesList
        title="Recently added shows"
        :series="series.createdAt"
      />
      <EpisodeList
        title="Recently added episodes"
        :episodes="episodes.createdAt"
      />
      <SeriesList
        title="Watched by others"
        :series="series.siteRatingCount"
      />
      <SeriesList
        title="Best rated"
        :series="series.siteRating"
      />
    </div>

    <div v-else class="browse-panel">
      <BrowseToolbar
        :filters="browse.filters"
        :facets="browse.facets"
        :libraries="showLibraries"
        :sort-options="sortOptions"
        @change="onToolbarChange"
        @reset="resetBrowseFilters"
      />

      <BrowseActiveFilters
        :filters="browse.filters"
        @remove="removeFilterChip"
      />

      <BrowseState
        v-if="showBrowseState"
        :loading="browse.loading"
        :error="browse.error"
        entity-label="series"
        @retry="retryBrowse"
      />

      <BrowseResultsGrid
        v-else
        type="series"
        :items="browse.items"
      />

      <BrowseLoadMore
        v-if="showLoadMore"
        :disabled="browse.loadingMore"
        :loading="browse.loadingMore"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import EpisodeList from '@/components/itemLists/EpisodeList'
import SeriesList from '@/components/itemLists/SeriesList'
import BrowseToolbar from '@/components/browse/BrowseToolbar'
import BrowseResultsGrid from '@/components/browse/BrowseResultsGrid'
import BrowseState from '@/components/browse/BrowseState'
import BrowseLoadMore from '@/components/browse/BrowseLoadMore'
import BrowseActiveFilters from '@/components/browse/BrowseActiveFilters'

const DEFAULT_BROWSE_FILTERS = {
  sort: 'createdAt',
  order: 'desc',
  count: 30,
  q: '',
  genre: [],
  yearFrom: null,
  yearTo: null,
  watched: 'all',
  libraryPath: null
}

export default {
  name: 'Series',
  components: {
    BrowseActiveFilters,
    BrowseLoadMore,
    BrowseState,
    BrowseResultsGrid,
    BrowseToolbar,
    SeriesList,
    EpisodeList
  },
  data () {
    return {
      activeTab: 'curated',
      browseDebounce: null,
      syncingRoute: false
    }
  },
  computed: {
    ...mapState('series', {
      series: state => state.lists,
      browse: state => state.browse
    }),
    ...mapState('libraries', {
      showLibraries: state => state.shows
    }),
    ...mapState({
      episodes: state => state.episodes.lists
    }),
    sortOptions () {
      return [
        { value: 'createdAt', label: 'Date Added' },
        { value: 'seriesName', label: 'Title' },
        { value: 'firstAired', label: 'First Aired' },
        { value: 'siteRating', label: 'Rating' },
        { value: 'siteRatingCount', label: 'Rating Count' },
        { value: 'popularity', label: 'Popularity' },
        { value: 'updatedAt', label: 'Recently Updated' }
      ]
    },
    showBrowseState () {
      if (this.browse.loading) return true
      if (this.browse.error) return true
      return !this.browse.items || this.browse.items.length === 0
    },
    showLoadMore () {
      return Boolean(this.browse.pageInfo && this.browse.pageInfo.hasNextPage)
    }
  },
  watch: {
    '$route.query': {
      deep: true,
      handler () {
        if (!this.syncingRoute) {
          this.applyRouteState()
        }
      }
    }
  },
  async created () {
    await this.updateTVShows()
    this.applyRouteState()

    if (this.activeTab === 'browse') {
      this.fetchBrowse({ append: false })
    }
  },
  methods: {
    ...mapActions('series', [
      'setBrowseFilters',
      'fetchBrowse',
      'resetBrowse'
    ]),
    ...mapActions('libraries', [
      'updateTVShows'
    ]),
    selectTab (tab) {
      this.activeTab = tab
      this.syncRouteState()

      if (tab === 'browse' && (!this.browse.items || this.browse.items.length === 0)) {
        this.fetchBrowse({ append: false })
      }
    },
    applyRouteState () {
      const query = this.$route.query || {}
      const routeTab = query.tab === 'browse' ? 'browse' : 'curated'
      this.activeTab = routeTab

      if (routeTab !== 'browse') return

      const patch = { ...DEFAULT_BROWSE_FILTERS }

      if (query.sort) patch.sort = String(query.sort)
      if (query.order) patch.order = String(query.order).toLowerCase()
      if (query.q) patch.q = String(query.q)
      if (query.genre) patch.genre = String(query.genre).split(',').map(entry => entry.trim()).filter(Boolean)
      if (query.yearFrom) {
        const yearFrom = Number.parseInt(String(query.yearFrom), 10)
        patch.yearFrom = Number.isInteger(yearFrom) ? yearFrom : null
      }
      if (query.yearTo) {
        const yearTo = Number.parseInt(String(query.yearTo), 10)
        patch.yearTo = Number.isInteger(yearTo) ? yearTo : null
      }
      if (query.watched) patch.watched = String(query.watched)
      if (query.libraryPath) patch.libraryPath = String(query.libraryPath)

      this.setBrowseFilters(patch)
    },
    buildRouteQuery () {
      if (this.activeTab !== 'browse') return {}

      const query = { tab: 'browse' }
      const filters = this.browse.filters || DEFAULT_BROWSE_FILTERS

      if (filters.sort && filters.sort !== DEFAULT_BROWSE_FILTERS.sort) query.sort = filters.sort
      if (filters.order && filters.order !== DEFAULT_BROWSE_FILTERS.order) query.order = filters.order
      if (filters.q) query.q = filters.q
      if (filters.genre && filters.genre.length > 0) query.genre = filters.genre.join(',')
      if (filters.yearFrom) query.yearFrom = String(filters.yearFrom)
      if (filters.yearTo) query.yearTo = String(filters.yearTo)
      if (filters.watched && filters.watched !== DEFAULT_BROWSE_FILTERS.watched) query.watched = filters.watched
      if (filters.libraryPath) query.libraryPath = filters.libraryPath

      return query
    },
    syncRouteState () {
      const nextQuery = this.buildRouteQuery()
      const currentQuery = this.$route.query || {}

      if (JSON.stringify(nextQuery) === JSON.stringify(currentQuery)) {
        return
      }

      this.syncingRoute = true
      this.$router.replace({ query: nextQuery }).finally(() => {
        this.syncingRoute = false
      })
    },
    onToolbarChange ({ patch, debounce }) {
      this.setBrowseFilters(patch)
      this.syncRouteState()

      if (this.activeTab !== 'browse') return

      if (debounce) {
        clearTimeout(this.browseDebounce)
        this.browseDebounce = setTimeout(() => {
          this.fetchBrowse({ append: false })
        }, 320)
        return
      }

      this.fetchBrowse({ append: false })
    },
    removeFilterChip (chip) {
      this.onToolbarChange({ patch: chip.patch, debounce: false })
    },
    resetBrowseFilters () {
      this.resetBrowse()
      this.syncRouteState()

      if (this.activeTab === 'browse') {
        this.fetchBrowse({ append: false })
      }
    },
    loadMore () {
      if (this.browse.loadingMore) return
      this.fetchBrowse({ append: true })
    },
    retryBrowse () {
      this.fetchBrowse({ append: false })
    }
  }
}
</script>

<style scoped lang="sass">
.mode-switcher
  display: flex
  gap: 8px
  margin: 6px 0 18px

.mode-button
  min-height: 36px
  padding: 0 14px
  border-radius: 10px
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.07)
  color: var(--color-text)
  cursor: pointer

  &.active
    border-color: var(--color-accent-soft)
    color: var(--color-accent-strong)
    background: rgba(217, 129, 60, 0.15)

.browse-panel
  margin-top: 6px
</style>
