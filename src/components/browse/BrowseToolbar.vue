<template>
  <div class="browse-toolbar">
    <div class="row row-main">
      <input
        :value="filters.q"
        type="text"
        class="field text-field"
        placeholder="Search title"
        @input="onSearchInput"
      >

      <select
        :value="filters.sort"
        class="field"
        @change="emitPatch({ sort: $event.target.value }, false)"
      >
        <option
          v-for="option in sortOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <select
        :value="filters.order"
        class="field"
        @change="emitPatch({ order: $event.target.value }, false)"
      >
        <option value="desc">
          Desc
        </option>
        <option value="asc">
          Asc
        </option>
      </select>

      <select
        :value="filters.watched"
        class="field"
        @change="emitPatch({ watched: $event.target.value }, false)"
      >
        <option value="all">
          All Watch States
        </option>
        <option value="watched">
          Watched
        </option>
        <option value="unwatched">
          Unwatched
        </option>
        <option value="inprogress">
          In Progress
        </option>
      </select>

      <button
        type="button"
        class="reset-button"
        @click="$emit('reset')"
      >
        Reset
      </button>
    </div>

    <div class="row row-filters">
      <label class="field-group">
        <span>Genres</span>
        <select
          class="field multi"
          multiple
          :value="filters.genre"
          @change="onGenreChange"
        >
          <option
            v-for="genre in availableGenres"
            :key="genre"
            :value="genre"
          >
            {{ genre }}
          </option>
        </select>
      </label>

      <label class="field-group year-group">
        <span>Year From</span>
        <input
          :value="filters.yearFrom || ''"
          type="number"
          class="field"
          placeholder="e.g. 2015"
          min="1"
          max="9999"
          @input="onYearFromInput"
        >
      </label>

      <label class="field-group year-group">
        <span>Year To</span>
        <input
          :value="filters.yearTo || ''"
          type="number"
          class="field"
          placeholder="e.g. 2025"
          min="1"
          max="9999"
          @input="onYearToInput"
        >
      </label>

      <label class="field-group library-group">
        <span>Library Source</span>
        <select
          :value="filters.libraryPath || ''"
          class="field"
          @change="emitPatch({ libraryPath: $event.target.value || null }, false)"
        >
          <option value="">
            All Sources
          </option>
          <option
            v-for="library in libraries"
            :key="library.path || library"
            :value="library.path || library"
          >
            {{ library.path || library }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BrowseToolbar',
  props: {
    filters: {
      type: Object,
      required: true
    },
    facets: {
      type: Object,
      default: () => ({ genres: [] })
    },
    libraries: {
      type: Array,
      default: () => []
    },
    sortOptions: {
      type: Array,
      required: true
    }
  },
  computed: {
    availableGenres () {
      return Array.isArray(this.facets.genres) ? this.facets.genres : []
    }
  },
  methods: {
    emitPatch (patch, debounce) {
      this.$emit('change', { patch, debounce })
    },
    onSearchInput (event) {
      this.emitPatch({ q: event.target.value || '' }, true)
    },
    onYearFromInput (event) {
      const value = event.target.value
      const parsed = Number.parseInt(value, 10)
      this.emitPatch({ yearFrom: Number.isInteger(parsed) ? parsed : null }, true)
    },
    onYearToInput (event) {
      const value = event.target.value
      const parsed = Number.parseInt(value, 10)
      this.emitPatch({ yearTo: Number.isInteger(parsed) ? parsed : null }, true)
    },
    onGenreChange (event) {
      const selected = Array.from(event.target.selectedOptions || []).map(option => option.value)
      this.emitPatch({ genre: selected }, false)
    }
  }
}
</script>

<style scoped lang="sass">
.browse-toolbar
  background: var(--color-surface-glass)
  border: 1px solid var(--color-border)
  border-radius: var(--radius-lg)
  box-shadow: var(--shadow-soft)
  padding: 16px
  margin-bottom: 20px

.row
  display: flex
  gap: 12px
  align-items: flex-start
  flex-wrap: wrap

.row + .row
  margin-top: 12px

.field
  min-height: 38px
  border-radius: 10px
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.08)
  color: var(--color-text)
  padding: 8px 10px

.text-field
  min-width: 260px
  flex: 1

.field-group
  display: flex
  flex-direction: column
  gap: 6px
  min-width: 190px

.field-group span
  font-size: 12px
  color: var(--color-text-muted)
  text-transform: uppercase
  letter-spacing: 0.06em

.multi
  min-height: 96px

.reset-button
  min-height: 38px
  padding: 0 14px
  border-radius: 10px
  border: 1px solid var(--color-border-strong)
  background: rgba(255, 255, 255, 0.1)
  color: var(--color-text)
  cursor: pointer

  &:hover
    border-color: var(--color-accent-soft)
    color: var(--color-accent-strong)

@media screen and (max-width: 900px)
  .text-field
    min-width: 100%

  .field-group,
  .year-group,
  .library-group
    min-width: 100%
</style>
