<template>
  <details
    v-if="departments.length"
    class="detail-section technical-details full-crew"
  >
    <summary>Full crew ({{ credits.length }})</summary>
    <section
      v-for="department in departments"
      :key="department.name"
      :aria-label="`${department.name} crew`"
    >
      <h3>{{ department.name }}</h3>
      <ul>
        <li
          v-for="entry in department.people"
          :key="entry.person.id"
        >
          <RouterLink :to="{ name: 'PersonInfo', params: { personId: entry.person.id } }">
            {{ entry.person.name }}
          </RouterLink>
          <span>{{ entry.jobs }}</span>
        </li>
      </ul>
    </section>
  </details>
</template>

<script setup>
import { computed } from 'vue'
import { crewDepartments } from '@/utils/movieDetails'
const props = defineProps({ credits: { type: Array, default: () => [] } })
const departments = computed(() => crewDepartments(props.credits))
</script>

<style scoped lang="sass">
.full-crew
  section + section
    margin-top: 24px
  h3
    margin: 0 0 12px
    font-size: 1rem
  ul
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr))
    gap: 16px 24px
    list-style: none
    margin: 0
    padding: 0
  li
    display: grid
    gap: 4px
  a
    color: var(--color-brand-turquoise)
    width: fit-content
  span
    color: var(--color-text-muted)
    font-size: 0.85rem
</style>
