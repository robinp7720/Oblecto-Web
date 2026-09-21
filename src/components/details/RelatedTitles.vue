<template>
  <section
    v-if="loading || error || items.length"
    class="detail-section"
    aria-label="More like this"
  >
    <p
      v-if="loading"
      role="status"
    >
      Loading similar titles…
    </p>
    <div
      v-else-if="error"
      role="status"
    >
      {{ error }} <button
        class="detail-button secondary"
        @click="reload"
      >
        Try again
      </button>
    </div>
    <MediaShelf
      v-if="items.length"
      title="More like this"
      :type="type"
      :items="items"
    >
      <template #item="{ item }">
        <div class="related-card">
          <MediaCard
            :item="item"
            :type="type"
            :landscape="type !== 'series'"
          />
          <p v-if="relationshipLabel(item.relationship)">
            {{ relationshipLabel(item.relationship) }}
          </p>
        </div>
      </template>
    </MediaShelf>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import oblectoClient from '@/oblectoClient'
import MediaShelf from '@/components/media/MediaShelf.vue'
import MediaCard from '@/components/media/MediaCard.vue'
import { useDetailResource } from '@/composables/useMediaDetails'
import { relationshipLabel } from '@/utils/media'
const props = defineProps({ id: { type: [Number, String], required: true }, type: { type: String, required: true }, exclude: { type: Array, default: () => [] } })
const { data, loading, error, reload } = useDetailResource(
  () => `${props.type}:${props.id}`,
  () => oblectoClient[props.type === 'movie' ? 'movieLibrary' : 'seriesLibrary'].getRelated(props.id),
  [], Array.isArray
)
const items = computed(() => data.value.filter(item => !props.exclude.includes(item.id)))
</script>
<style scoped lang="sass">
.related-card
  min-width: 0
  p
    margin: 2px 0 0
    color: var(--color-brand-turquoise)
    font-size: 0.72rem
    line-height: 1.4
</style>
