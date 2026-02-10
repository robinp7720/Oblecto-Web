<template>
  <div class="browse-state">
    <p
      v-if="loading"
      class="state-text"
    >
      Loading {{ entityLabel }}...
    </p>
    <p
      v-else-if="error"
      class="state-text error"
    >
      {{ error }}
    </p>
    <p
      v-else
      class="state-text"
    >
      No {{ entityLabel }} found for the current filters.
    </p>

    <button
      v-if="error"
      type="button"
      class="state-button"
      @click="$emit('retry')"
    >
      Retry
    </button>
  </div>
</template>

<script>
export default {
  name: 'BrowseState',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    entityLabel: {
      type: String,
      default: 'items'
    }
  }
}
</script>

<style scoped lang="sass">
.browse-state
  margin: 14px 0 8px
  padding: 18px
  border-radius: var(--radius-md)
  border: 1px dashed var(--color-border)
  background: rgba(255, 255, 255, 0.03)

.state-text
  margin: 0
  color: var(--color-text-muted)

.error
  color: #f8a7a7

.state-button
  margin-top: 12px
  min-height: 34px
  padding: 0 12px
  border-radius: 8px
  border: 1px solid var(--color-border-strong)
  background: rgba(255, 255, 255, 0.08)
  color: var(--color-text)
  cursor: pointer
</style>
