<template>
  <!-- Everyone is in the row: it scrolls sideways, with its own arrows, so a
       "Show all" that only made the same row longer had nothing to show.
       The count under the title says how long the row is. -->
  <MediaShelf
    v-if="credits.length"
    class="detail-section"
    :title="title"
    :subtitle="credits.length > 1 ? `${credits.length} people` : ''"
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
defineProps({
  title: { type: String, default: 'Cast' },
  credits: { type: Array, default: () => [] }
})
</script>
