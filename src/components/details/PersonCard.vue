<template>
  <RouterLink
    class="person-card"
    :to="{ name: 'PersonInfo', params: { personId: credit.person.id } }"
    data-motion-card
  >
    <span
      class="portrait"
      data-motion-origin
    >
      <img
        v-if="!failed"
        :src="portrait"
        alt=""
        loading="lazy"
        @error="failed = true"
      >
      <span v-else>{{ initials }}</span>
    </span>
    <strong>{{ credit.person.name }}</strong>
    <small>{{ role }}</small>
  </RouterLink>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
const props = defineProps({ credit: { type: Object, required: true } })
const store = useStore()
const failed = ref(false)
const portrait = computed(() => `${store.state.host}/person/${props.credit.person.id}/profile?size=medium`)
const initials = computed(() => props.credit.person.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase())
const role = computed(() => props.credit.character || props.credit.job || props.credit.department || '')
watch(portrait, () => { failed.value = false })
</script>

<style scoped lang="sass">
.person-card
  display: grid
  gap: 8px
  color: var(--color-text)
  min-width: 0
  &:hover strong
    color: var(--color-brand-turquoise)
.portrait
  display: grid
  place-items: center
  aspect-ratio: 2 / 3
  overflow: hidden
  border-radius: 6px
  background: linear-gradient(145deg, var(--color-brand-blue), var(--color-surface))
  color: var(--color-text-muted)
  font-size: 1.5rem
  font-weight: 700
  img
    width: 100%
    height: 100%
    object-fit: cover
strong
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
small
  color: var(--color-text-muted)
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  line-height: 1.35
</style>
