<template>
  <section
    class="shelf"
    :aria-label="title"
  >
    <div class="heading">
      <h2>{{ title }}</h2>
      <slot name="action">
        <RouterLink
          v-if="actionLabel && actionTo"
          :to="actionTo"
          class="action-link"
        >
          {{ actionLabel }} <span aria-hidden="true">›</span>
        </RouterLink>
      </slot>
      <div
        v-if="canScroll"
        class="row-controls"
      >
        <button
          type="button"
          :aria-label="`Previous ${itemLabel} in ${title}`"
          :disabled="atStart"
          @click="scroll(-1)"
        >
          ‹
        </button>
        <button
          type="button"
          :aria-label="`More ${itemLabel} in ${title}`"
          :disabled="atEnd"
          @click="scroll(1)"
        >
          ›
        </button>
      </div>
    </div>
    <div
      ref="track"
      class="track"
      :class="{ 'people-track': type === 'person' }"
      tabindex="0"
      :aria-label="`${title}, scrollable ${itemLabel}`"
      @scroll.passive="updateScroll"
      @keydown.left.prevent="scroll(-1)"
      @keydown.right.prevent="scroll(1)"
    >
      <slot
        v-for="item in items"
        :key="`${type}-${item.id}`"
        name="item"
        :item="item"
      >
        <MediaCard
          :item="item"
          :type="type"
          :landscape="type !== 'series'"
        />
      </slot>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import MediaCard from '@/components/media/MediaCard.vue'
const props = defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  type: { type: String, required: true },
  actionLabel: { type: String, default: null },
  actionTo: { type: [String, Object], default: null }
})
const track = ref(null)
const itemLabel = computed(() => props.type === 'person' ? 'people' : 'titles')
const atStart = ref(true)
const atEnd = ref(false)
const canScroll = ref(false)
let observer
function updateScroll () {
  const el = track.value
  if (!el) return
  canScroll.value = el.scrollWidth > el.clientWidth + 2
  atStart.value = el.scrollLeft <= 2
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
}
function scroll (direction) {
  track.value?.scrollBy({ left: direction * track.value.clientWidth * 0.85, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
onMounted(() => {
  observer = new ResizeObserver(updateScroll)
  observer.observe(track.value)
  updateScroll()
})
watch(() => props.items, async () => { await nextTick(); updateScroll() })
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped lang="sass">
.shelf
  min-width: 0
.heading
  display: flex
  align-items: center
  gap: 18px
  min-height: 36px
  margin-bottom: 10px
  h2
    margin: 0
    font-size: clamp(1.1rem, 1.6vw, 1.5rem)
    letter-spacing: -0.025em
.action-link
  color: #bcbcbc
  font-size: 0.78rem
  white-space: nowrap
  &:hover
    color: white
.row-controls
  display: flex
  gap: 6px
  margin-left: auto
  button
    width: 36px
    height: 32px
    border: 1px solid #555
    border-radius: 3px
    background: #242424
    color: white
    font-size: 1.5rem
    cursor: pointer
    &:hover:not(:disabled)
      background: #444
    &:disabled
      opacity: 0.3
      cursor: default
.track
  display: grid
  grid-auto-flow: column
  grid-auto-columns: clamp(230px, 22vw, 360px)
  gap: 12px
  overflow-x: auto
  overscroll-behavior-x: contain
  scroll-snap-type: x mandatory
  scrollbar-width: none
  padding: 6px 2px 12px
  &::-webkit-scrollbar
    display: none
  > :deep(*)
    scroll-snap-align: start
  &.people-track, &:has(.media-card:not(.landscape))
    grid-auto-columns: clamp(150px, 14vw, 220px)
@media (max-width: 600px)
  .heading
    gap: 10px
    flex-wrap: wrap
  .action-link
    display: none
  .track
    grid-auto-columns: 72vw
  .row-controls button
    width: 32px
</style>
