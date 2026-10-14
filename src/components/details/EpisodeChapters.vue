<template>
  <details
    v-if="versions.length"
    class="detail-section episode-chapters"
  >
    <summary>Chapters <span>{{ chapters.length }}</span></summary>
    <label v-if="versions.length > 1">
      File version
      <select v-model="selected"><option
        v-for="version in versions"
        :key="version.id"
        :value="version.id"
      >{{ version.name || version.path?.split('/').pop() || `File ${version.id}` }}</option></select>
    </label>
    <ol>
      <li
        v-for="(chapter, index) in chapters"
        :key="`${chapter.start}:${index}`"
      >
        <button
          type="button"
          @click="store.playEpisode(episode.id, { fileId: file.id, position: chapter.start })"
        >
          <time>{{ timestamp(chapter.start) }}</time>
          <span>{{ hideTitles ? `Chapter ${index + 1}` : chapter.title || `Chapter ${index + 1}` }}</span>
          <span aria-hidden="true">▶</span>
        </button>
      </li>
    </ol>
  </details>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { fileChapters } from '@/utils/tvDetails'
const props = defineProps({ episode: { type: Object, required: true }, hideTitles: { type: Boolean, default: false } })
const store = useAppStore()
const versions = computed(() => (props.episode.Files || []).filter(file => fileChapters(file).length))
const selected = ref(null)
watch([() => props.episode.id, versions], () => {
  if (!versions.value.some(file => file.id === selected.value)) selected.value = versions.value[0]?.id ?? null
}, { immediate: true })
const file = computed(() => versions.value.find(file => file.id === selected.value) || versions.value[0])
const chapters = computed(() => fileChapters(file.value))
function timestamp (seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes >= 60 ? `${Math.floor(minutes / 60)}:` : ''}${String(minutes % 60).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}
</script>
<style scoped lang="sass">
.episode-chapters
  summary
    cursor: pointer
    min-height: 44px
    font-size: 1.2rem
    span
      margin-left: 8px
      color: var(--color-text-muted)
      font-size: 0.8rem
  ol
    list-style: none
    padding: 0
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))
    gap: 8px
  button
    display: flex
    align-items: center
    gap: 16px
    width: 100%
    min-height: 48px
    padding: 12px
    background: var(--color-surface)
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    color: var(--color-text)
    text-align: left
    cursor: pointer
    span:first-of-type
      flex: 1
    time
      color: var(--color-brand-turquoise)
      font-variant-numeric: tabular-nums
  select
    max-width: 100%
    min-height: 44px
    margin: 12px
    background: var(--color-surface)
    color: var(--color-text)
</style>
