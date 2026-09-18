<template>
  <div
    v-if="loading || hasError"
    class="section-status"
    aria-live="polite"
  >
    <p
      v-if="loading"
      role="status"
    >
      Loading more titles…
    </p>
    <template
      v-for="(section, id) in sections"
      :key="id"
    >
      <p
        v-if="section.error"
        role="alert"
      >
        {{ section.error }}
        <button
          type="button"
          @click="mediaStore.loadHome(id)"
        >
          Try again
        </button>
      </p>
    </template>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useMediaStore } from '@/stores/media'
const props = defineProps({ ids: { type: Array, default: null } })
const mediaStore = useMediaStore()
const sections = computed(() => Object.fromEntries(Object.entries(mediaStore.home.sections).filter(([id]) => !props.ids || props.ids.includes(id))))
const hasError = computed(() => Object.values(sections.value).some(section => section.error))
const loading = computed(() => Object.values(sections.value).some(section => section.loading))
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
