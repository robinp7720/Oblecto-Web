<template>
  <dl class="library-metrics">
    <div
      v-for="metric in metrics"
      :key="metric.key"
    >
      <dt>{{ metric.label }}</dt>
      <dd>{{ metric.key === 'localBytes' ? bytes(library[metric.key]) : number(library[metric.key]) }}</dd>
    </div>
  </dl>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ library: { type: Object, required: true } })
const metrics = computed(() => [
  ...(props.library.type === 'movies'
    ? [{ key: 'movies', label: 'Movies' }]
    : [{ key: 'series', label: 'Series' }, { key: 'episodes', label: 'Episodes' }]),
  { key: 'files', label: 'Indexed files' },
  { key: 'localBytes', label: 'Known local storage' },
  { key: 'missingSize', label: 'Missing sizes' },
  { key: 'problematicFiles', label: 'Problem files' }
])
const number = value => Number(value || 0).toLocaleString()
function bytes (value) {
  const size = Number(value || 0)
  const unit = size > 0 ? Math.min(5, Math.floor(Math.log(size) / Math.log(1024))) : 0
  return `${(size / 1024 ** unit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'][unit]}`
}
</script>

<style scoped lang="sass">
.library-metrics
  display: flex
  flex-wrap: wrap
  gap: 12px 24px
  margin: 12px 0
  font-size: .8rem
  white-space: normal
  > div
    min-width: 0
  dt
    color: var(--color-text-muted)
    margin-bottom: 4px
  dd
    margin: 0
    font-variant-numeric: tabular-nums
    font-weight: 600
    overflow-wrap: anywhere
</style>
