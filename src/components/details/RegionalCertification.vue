<template>
  <div
    v-if="certifications.length"
    class="regional-certification"
  >
    <label :for="`certification-${id}`">Content rating</label>
    <select
      :id="`certification-${id}`"
      v-model="region"
      aria-label="Certification region"
    >
      <option
        v-for="country in regions"
        :key="country"
        :value="country"
      >
        {{ regionName(country) }}
      </option>
    </select>
    <span>{{ selected?.certification || 'Not available for this region' }}</span>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ id: { type: [String, Number], required: true }, certifications: { type: Array, default: () => [] } })
let browserRegion = ''
try { browserRegion = new Intl.Locale(navigator.language).region || '' } catch { /* no explicit region */ }
const region = ref(browserRegion)
const regions = computed(() => [...new Set([browserRegion, ...props.certifications.map(value => value.country)].filter(Boolean))].sort())
watch(regions, values => { if (!values.includes(region.value)) region.value = values[0] || '' }, { immediate: true })
const selected = computed(() => props.certifications.find(value => value.country === region.value))
function regionName (country) {
  try { return new Intl.DisplayNames(undefined, { type: 'region' }).of(country) } catch { return country }
}
</script>
<style scoped lang="sass">
.regional-certification
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 12px
  margin-top: 24px
  label
    color: var(--color-text-muted)
  select
    max-width: 100%
    min-height: 44px
    background: var(--color-surface)
    color: var(--color-text)
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    padding: 8px
</style>
