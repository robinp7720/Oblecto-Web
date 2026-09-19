<template>
  <MediaShelf
    v-if="credits.length"
    class="detail-section"
    :title="title"
    type="person"
    :items="credits"
  >
    <template #item="{ item }">
      <PersonCard :credit="item" />
    </template>
  </MediaShelf>
</template>

<script setup>
import MediaShelf from '@/components/media/MediaShelf.vue'
import PersonCard from './PersonCard.vue'
const props = defineProps({
  title: { type: String, default: 'Cast' },
  credits: { type: Array, default: () => [] },
  limit: { type: Number, default: 10 }
})
</script>

<style scoped lang="sass">
.people-toggle
  border: 0
  background: transparent
  color: var(--color-brand-turquoise)
  cursor: pointer
</style>
