<template>
  <div class="browse-load-more">
    <button
      type="button"
      class="load-more-button"
      :disabled="disabled"
      @click="$emit('load-more')"
    >
      {{ loading ? 'Loading...' : 'Load More' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'BrowseLoadMore',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="sass">
.browse-load-more
  display: flex
  justify-content: center
  margin: 18px 0 10px

.load-more-button
  min-height: 40px
  min-width: 180px
  padding: 0 16px
  border-radius: 10px
  border: 1px solid var(--color-border-strong)
  background: rgba(255, 255, 255, 0.09)
  color: var(--color-text)
  cursor: pointer

  &:disabled
    opacity: 0.6
    cursor: default
</style>
