<template>
  <section class="shelf">
    <div class="heading">
      <div>
        <span class="eyebrow">{{ eyebrow }}</span>
        <h2>{{ title }}</h2>
      </div>
      <RouterLink v-if="actionLabel && actionTo" :to="actionTo" class="action-link">
        {{ actionLabel }}
      </RouterLink>
    </div>

    <div class="grid">
      <MediaCard
        v-for="item in items"
        :key="`${type}-${item.id}`"
        :item="item"
        :type="type"
      />
    </div>
  </section>
</template>

<script setup>
import MediaCard from '@/components/media/MediaCard.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  eyebrow: {
    type: String,
    default: 'Collection'
  },
  items: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    required: true
  },
  actionLabel: {
    type: String,
    default: null
  },
  actionTo: {
    type: [String, Object],
    default: null
  }
})
</script>

<style scoped lang="sass">
.shelf
  display: grid
  gap: 18px

.heading
  display: flex
  align-items: end
  justify-content: space-between
  gap: 16px

  h2
    margin: 4px 0 0
    font-family: var(--font-display)
    font-size: clamp(1.8rem, 3vw, 2.5rem)

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.16em
  color: var(--color-text-faint)
  font-size: 0.76rem

.action-link
  color: var(--color-accent-strong)
  white-space: nowrap

.grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))
  gap: 20px
</style>
