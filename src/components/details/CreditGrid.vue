<template>
  <MediaShelf
    v-if="credits.length"
    :title="title"
    :type="type"
    :items="items"
    :action-label="type !== 'episode' ? 'View in library' : null"
    :action-to="libraryRoute"
  >
    <template #item="{ item }">
      <div class="credit-item">
        <MediaCard
          :item="item"
          :type="type"
          :landscape="type !== 'series'"
        />
        <small>{{ roleLabel(item.creditRoles) }}</small>
      </div>
    </template>
  </MediaShelf>
</template>

<script setup>
import { computed } from 'vue'
import MediaCard from '@/components/media/MediaCard.vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
const props = defineProps({
  title: { type: String, required: true },
  type: { type: String, required: true },
  credits: { type: Array, default: () => [] },
  person: { type: Object, required: true }
})
const items = computed(() => props.credits.map(credit => ({ ...credit.item, creditRoles: credit.roles })))
const prominentRole = computed(() => props.credits.flatMap(entry => entry.roles).find(role => role.type === 'cast') ? 'cast' : 'any')
const libraryRoute = computed(() => ({
  name: 'Library',
  params: { mediaType: props.type === 'movie' ? 'movies' : 'series' },
  query: { personId: props.person.id, personName: props.person.name, creditRole: prominentRole.value }
}))
function roleLabel (roles) {
  return [...new Set(roles.map(role => role.character || role.job).filter(Boolean))].join(' · ')
}
</script>

<style scoped lang="sass">
.credit-item
  min-width: 0
  small
    display: block
    color: var(--color-text-muted)
    margin-top: 8px
    line-height: 1.4
</style>
