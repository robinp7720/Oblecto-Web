<template>
  <details
    v-if="audio.length || subtitles.length"
    class="file-tracks"
  >
    <summary>Audio and subtitles</summary>
    <div>
      <h3>Audio</h3>
      <ul v-if="audio.length">
        <li
          v-for="(stream, index) in audio"
          :key="stream.index ?? index"
        >
          {{ formatStreamLabel(stream, 'audio') }}
        </li>
      </ul>
      <p v-else>
        No audio tracks reported.
      </p>
      <h3>Subtitles</h3>
      <ul v-if="subtitles.length">
        <li
          v-for="(stream, index) in subtitles"
          :key="stream.index ?? index"
        >
          {{ formatStreamLabel(stream, 'subtitle') }}
        </li>
      </ul>
      <p v-else>
        No embedded subtitles.
      </p>
    </div>
  </details>
</template>

<script setup>
import { computed } from 'vue'
import { formatStreamLabel } from '@/utils/media'
const props = defineProps({ file: { type: Object, required: true } })
const streams = computed(() => props.file.Streams || props.file.streams || [])
const audio = computed(() => streams.value.filter(stream => stream.codec_type === 'audio'))
const subtitles = computed(() => streams.value.filter(stream => stream.codec_type === 'subtitle'))
</script>

<style scoped lang="sass">
.file-tracks
  margin-top: 8px
  summary
    min-height: 36px
    align-content: center
    font-size: 0.85rem
    color: var(--color-brand-turquoise)
    cursor: pointer
  h3
    margin: 12px 0 6px
    font-size: 0.85rem
  ul
    margin: 0
    padding-left: 20px
  li, p
    margin: 6px 0
    line-height: 1.6
    font-size: 0.8rem
    color: var(--color-text-muted)
</style>
