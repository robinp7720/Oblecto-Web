<template>
  <div
    v-if="loading || hasError"
    class="section-status"
    aria-live="polite"
  >
    <p
      v-if="loading && hasContent"
      role="status"
    >
      Loading more titles…
    </p>
    <!-- One failed row names itself; several (the server is down) make one
         message with one retry, not a stack of identical alerts. -->
    <p
      v-if="failed.length"
      role="alert"
    >
      {{ failed.length === 1 ? failed[0][1].error : `Could not load ${failed.length} rows.` }}
      <button
        type="button"
        @click="retry"
      >
        Try again
      </button>
    </p>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useMediaStore } from '@/stores/media'
const props = defineProps({ ids: { type: Array, default: null } })
const mediaStore = useMediaStore()
const sections = computed(() => Object.fromEntries(Object.entries(mediaStore.home.sections).filter(([id]) => !props.ids || props.ids.includes(id))))
const failed = computed(() => Object.entries(sections.value).filter(([, section]) => section.error))
const hasError = computed(() => failed.value.length > 0)
const loading = computed(() => Object.values(sections.value).some(section => section.loading))
// "More" only once something is on screen; before that the page shows its own
// first-load state.
const hasContent = computed(() => Object.values(sections.value).some(section => section.items?.length))
function retry () {
  for (const [id] of failed.value) mediaStore.loadHome(id)
}
</script>
<style scoped lang="sass">
.section-status
  color: var(--color-text-muted)
  button
    min-height: var(--control-size)
    margin-left: 12px
    padding: 8px 14px
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    background: var(--color-surface)
    color: var(--color-text)
</style>
