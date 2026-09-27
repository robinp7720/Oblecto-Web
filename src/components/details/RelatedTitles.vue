<template>
  <section
    v-if="loading || error || items.length"
    id="more-like-this"
    ref="section"
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
          <div
            v-if="hasReasons(item)"
            class="reasons"
            aria-label="Why this title is related"
          >
            <span v-if="item.relationship.sharedCollections?.length">
              Same collection · {{ item.relationship.sharedCollections[0].name }}
            </span>
            <RouterLink
              v-for="person in (item.relationship.sharedPeople || []).slice(0, 2)"
              :key="`person-${person.id}`"
              :to="{ name: 'PersonInfo', params: { personId: person.id } }"
            >
              With {{ person.name }}
            </RouterLink>
            <RouterLink
              v-for="genre in (item.relationship.sharedGenres || []).slice(0, 2)"
              :key="`genre-${genre}`"
              :to="{ name: 'Library', params: { mediaType: type === 'movie' ? 'movies' : 'series' }, query: { genre } }"
            >
              {{ genre }}
            </RouterLink>
          </div>
        </div>
      </template>
    </MediaShelf>
  </section>
</template>
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import oblectoClient from '@/oblectoClient'
import MediaShelf from '@/components/media/MediaShelf.vue'
import MediaCard from '@/components/media/MediaCard.vue'
import { useDetailResource } from '@/composables/useMediaDetails'
const props = defineProps({ id: { type: [Number, String], required: true }, type: { type: String, required: true }, exclude: { type: Array, default: () => [] } })
const { data, loading, error, reload } = useDetailResource(
  () => `${props.type}:${props.id}`,
  () => oblectoClient[props.type === 'movie' ? 'movieLibrary' : 'seriesLibrary'].getRelated(props.id),
  [], Array.isArray
)
const items = computed(() => data.value.filter(item => !props.exclude.includes(item.id)))
// Links to "#more-like-this" (the player's end screen) arrive before these
// titles do, so the page cannot scroll to them itself; this does, once.
const route = useRoute()
const section = ref(null)
let revealed = false
watch(items, async list => {
  if (revealed || !list.length || route.hash !== '#more-like-this') return
  revealed = true
  await nextTick()
  section.value?.scrollIntoView({ block: 'start' })
}, { immediate: true })
function hasReasons (item) {
  const relationship = item.relationship || {}
  return Boolean(relationship.sharedCollections?.length || relationship.sharedPeople?.length || relationship.sharedGenres?.length)
}
</script>
<style scoped lang="sass">
.related-card
  min-width: 0
.reasons
  display: flex
  flex-wrap: wrap
  gap: 6px
  margin-top: 2px
  font-size: 0.7rem
  line-height: 1.4
  a, span
    padding: 3px 7px
    border: 1px solid var(--color-border)
    border-radius: 999px
    color: var(--color-brand-turquoise)
  a:hover
    border-color: var(--color-brand-turquoise)
</style>
