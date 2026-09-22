<template>
  <MediaShelf
    v-if="credits.length"
    class="detail-section"
    :title="title"
    type="person"
    :items="visibleCredits"
  >
    <template #action>
      <button
        v-if="hasMore"
        type="button"
        class="people-toggle"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Show less' : `Show all ${credits.length}` }}
      </button>
    </template>
    <template #item="{ item }">
      <PersonCard :credit="item" />
    </template>
  </MediaShelf>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
import PersonCard from './PersonCard.vue'
const props = defineProps({
  title: { type: String, default: 'Cast' },
  credits: { type: Array, default: () => [] },
  limit: { type: Number, default: 10 }
})
const expanded = ref(false)
const hasMore = computed(() => props.credits.length > props.limit)
const visibleCredits = computed(() => expanded.value ? props.credits : props.credits.slice(0, props.limit))
watch(() => [props.title, props.credits], () => { expanded.value = false })
</script>

<style scoped lang="sass">
.people-toggle
  border: 0
  background: transparent
  color: var(--color-text-muted)
  font: inherit
  font-size: 0.78rem
  cursor: pointer
  &:hover
    color: var(--color-brand-turquoise)
</style>
