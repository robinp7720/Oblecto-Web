<template>
  <div
    v-if="chips.length > 0"
    class="active-filters"
  >
    <span class="label">Active:</span>
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="chip"
      @click="$emit('remove', chip)"
    >
      {{ chip.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'BrowseActiveFilters',
  props: {
    filters: {
      type: Object,
      required: true
    }
  },
  computed: {
    chips () {
      const chips = []
      const filters = this.filters || {}

      if (filters.q) {
        chips.push({ key: 'q', label: `Search: ${filters.q}`, patch: { q: '' } })
      }

      if (Array.isArray(filters.genre)) {
        filters.genre.forEach(genre => {
          chips.push({
            key: `genre-${genre}`,
            label: `Genre: ${genre}`,
            patch: { genre: filters.genre.filter(value => value !== genre) }
          })
        })
      }

      if (filters.yearFrom) {
        chips.push({ key: 'yearFrom', label: `From ${filters.yearFrom}`, patch: { yearFrom: null } })
      }

      if (filters.yearTo) {
        chips.push({ key: 'yearTo', label: `To ${filters.yearTo}`, patch: { yearTo: null } })
      }

      if (filters.watched && filters.watched !== 'all') {
        chips.push({ key: 'watched', label: `Watch: ${filters.watched}`, patch: { watched: 'all' } })
      }

      if (filters.libraryPath) {
        chips.push({ key: 'libraryPath', label: `Library: ${filters.libraryPath}`, patch: { libraryPath: null } })
      }

      return chips
    }
  }
}
</script>

<style scoped lang="sass">
.active-filters
  display: flex
  flex-wrap: wrap
  gap: 8px
  margin: 8px 0 14px
  align-items: center

.label
  color: var(--color-text-muted)
  font-size: 12px
  text-transform: uppercase
  letter-spacing: 0.06em

.chip
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.08)
  color: var(--color-text)
  border-radius: 999px
  padding: 5px 10px
  cursor: pointer

  &:hover
    border-color: var(--color-accent-soft)
</style>
