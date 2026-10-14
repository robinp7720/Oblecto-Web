<template>
  <section
    v-if="progress.total"
    class="detail-section series-progress"
    aria-label="Series viewing progress"
  >
    <div class="progress-heading">
      <h2>Your progress</h2>
      <span>{{ progress.watched }} of {{ progress.total }} library episodes watched</span>
    </div>
    <progress
      :value="progress.watched"
      :max="progress.total"
      aria-label="Library episodes watched"
    />
    <div class="progress-facts">
      <span>{{ progress.completedSeasons }} of {{ progress.seasons }} library seasons completed</span>
      <span v-if="progress.remainingSeconds">About {{ formatRuntime(progress.remainingSeconds / 60) }} remaining{{ progress.unknownRuntime ? ' with known runtimes' : '' }}</span>
      <span v-else-if="progress.unknownRuntime">Remaining runtime unavailable</span>
    </div>
    <p class="scope-note">
      Progress counts playable library episodes; specials are separate.
    </p>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import { seriesViewingProgress } from '@/utils/tvDetails'
import { formatRuntime } from '@/utils/media'
const props = defineProps({ episodes: { type: Array, default: () => [] } })
const progress = computed(() => seriesViewingProgress(props.episodes))
</script>
<style scoped lang="sass">
.series-progress
  max-width: 860px
.progress-heading, .progress-facts
  display: flex
  align-items: baseline
  justify-content: space-between
  flex-wrap: wrap
  gap: 12px
  h2
    margin-bottom: 4px
  span
    font-size: 0.85rem
    color: var(--color-text-muted)
progress
  appearance: none
  display: block
  width: 100%
  height: 4px
  margin: 16px 0
  border: 0
  background: var(--color-border)
  color: var(--color-brand-turquoise)
  &::-webkit-progress-bar
    background: var(--color-border)
  &::-webkit-progress-value
    background: var(--color-brand-turquoise)
  &::-moz-progress-bar
    background: var(--color-brand-turquoise)
.scope-note
  margin-bottom: 0
  color: var(--color-text-muted)
  font-size: 0.75rem
  line-height: 1.6
</style>
