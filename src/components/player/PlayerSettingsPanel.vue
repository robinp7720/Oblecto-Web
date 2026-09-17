<template>
  <div class="panel">
    <section
      class="section"
      role="radiogroup"
      aria-label="Quality"
    >
      <h4>Quality</h4>
      <button
        v-for="option in qualityOptions"
        :key="`quality-${option.value}`"
        type="button"
        role="radio"
        :aria-checked="String(quality) === String(option.value)"
        :class="{ selected: String(quality) === String(option.value) }"
        @click="$emit('select-quality', option.value)"
      >
        {{ option.label }}
      </button>
    </section>

    <section
      v-if="files.length > 1"
      class="section"
      role="radiogroup"
      aria-label="Source file"
    >
      <h4>Source</h4>
      <button
        v-for="(file, index) in files"
        :key="file.id"
        type="button"
        role="radio"
        :aria-checked="index === fileIndex"
        :class="{ selected: index === fileIndex }"
        @click="$emit('select-file', index)"
      >
        <span class="row-label">{{ file.name }}</span>
        <span class="chip">{{ file.extension }}</span>
      </button>
    </section>

    <section
      v-if="audioStreams.length > 0"
      class="section"
      role="radiogroup"
      aria-label="Audio track"
    >
      <h4>Audio</h4>
      <button
        v-for="stream in audioStreams"
        :key="`audio-${stream.index}`"
        type="button"
        role="radio"
        :aria-checked="audioIndex === stream.index"
        :class="{ selected: audioIndex === stream.index }"
        @click="$emit('select-audio', stream.index)"
      >
        {{ formatStreamLabel(stream, 'audio') }}
      </button>
    </section>

    <section
      class="section"
      aria-label="Subtitles"
    >
      <h4>Subtitles</h4>
      <div
        class="modes"
        role="radiogroup"
        aria-label="Subtitle mode"
      >
        <button
          v-for="mode in subtitleModes"
          :key="`mode-${mode}`"
          type="button"
          role="radio"
          class="mode"
          :aria-checked="subtitleMode === mode"
          :class="{ selected: subtitleMode === mode }"
          @click="$emit('set-subtitle-mode', mode)"
        >
          {{ mode }}
        </button>
      </div>
      <template v-if="subtitleStreams.length > 0">
        <button
          type="button"
          :disabled="subtitleMode === 'off'"
          :class="{ selected: subtitleMode !== 'off' && subtitleIndex === null }"
          @click="$emit('select-subtitle', null)"
        >
          Default track
        </button>
        <button
          v-for="stream in subtitleStreams"
          :key="`subtitle-${stream.index}`"
          type="button"
          :disabled="subtitleMode === 'off'"
          :class="{ selected: subtitleIndex === stream.index }"
          @click="$emit('select-subtitle', stream.index)"
        >
          {{ formatStreamLabel(stream, 'subtitle') }}
        </button>
      </template>
      <p
        v-else
        class="note"
      >
        No subtitle streams in this file.
      </p>
    </section>

    <section
      class="section"
      role="radiogroup"
      aria-label="Playback speed"
    >
      <h4>Speed</h4>
      <div class="speeds">
        <button
          v-for="rate in speedOptions"
          :key="`speed-${rate}`"
          type="button"
          role="radio"
          class="speed"
          :aria-checked="playbackRate === rate"
          :class="{ selected: playbackRate === rate }"
          @click="$emit('set-rate', rate)"
        >
          {{ rate }}x
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { formatStreamLabel } from '@/utils/media'

defineProps({
  files: { type: Array, default: () => [] },
  fileIndex: { type: Number, default: 0 },
  quality: { type: [String, Number], default: 'original' },
  qualityOptions: { type: Array, default: () => [] },
  audioStreams: { type: Array, default: () => [] },
  audioIndex: { type: Number, default: null },
  subtitleStreams: { type: Array, default: () => [] },
  subtitleIndex: { type: Number, default: null },
  subtitleMode: { type: String, default: 'auto' },
  subtitleModes: { type: Array, default: () => ['off', 'auto', 'forced'] },
  playbackRate: { type: Number, default: 1 },
  speedOptions: { type: Array, default: () => [] }
})

defineEmits([
  'select-quality',
  'select-file',
  'select-audio',
  'select-subtitle',
  'set-subtitle-mode',
  'set-rate'
])
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.panel
  display: grid
  gap: 18px

.section
  display: grid
  gap: 2px

  h4
    +p.player-label
    padding: 0 12px 6px

  > button
    display: flex
    align-items: center
    justify-content: space-between
    gap: 10px
    width: 100%
    min-height: var(--control-size)
    padding: 10px 12px
    border: 0
    border-radius: var(--radius-sm)
    background: transparent
    color: var(--color-text)
    font-size: 0.9rem
    text-align: left
    cursor: pointer
    &:hover:not(:disabled)
      background: rgba(255, 255, 255, 0.08)
    &:disabled
      opacity: 0.4
      cursor: default
    &.selected
      background: var(--color-accent-soft)
      color: var(--color-accent-strong)
      font-weight: 700

.row-label
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.chip
  flex: none
  padding: 2px 8px
  border-radius: 999px
  background: rgba(255, 255, 255, 0.1)
  color: var(--color-text-faint)
  font-size: 0.7rem
  text-transform: uppercase

.modes,
.speeds
  display: flex
  flex-wrap: wrap
  gap: 6px
  padding: 0 12px 4px

.mode,
.speed
  min-height: 36px
  padding: 6px 14px
  border: 1px solid var(--color-border)
  border-radius: 999px
  background: transparent
  color: var(--color-text-muted)
  font-size: 0.8rem
  cursor: pointer
  &:hover
    background: rgba(255, 255, 255, 0.08)
  &.selected
    border-color: transparent
    background: var(--color-accent-soft)
    color: var(--color-accent-strong)
    font-weight: 700

.mode
  text-transform: capitalize

.note
  margin: 0
  padding: 4px 12px 0
  color: var(--color-text-faint)
  font-size: 0.82rem
</style>
