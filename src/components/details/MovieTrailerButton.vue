<template>
  <button
    v-if="videos.length"
    type="button"
    class="detail-button secondary movie-trailer-trigger"
    :class="{ quiet }"
    aria-label="Watch trailer"
    @click="open"
  >
    <svg
      v-if="quiet"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      aria-hidden="true"
    ><circle
      cx="12"
      cy="12"
      r="9"
    /><path d="m10 8 6 4-6 4V8Z" /></svg>
    {{ quiet ? 'Trailer' : 'Watch trailer' }}
  </button>
  <dialog
    ref="dialog"
    class="trailer-dialog"
    aria-labelledby="trailer-title"
    @close="active = false"
    @click="backdropClick"
  >
    <div class="trailer-header">
      <h2 id="trailer-title">
        {{ title }} — trailer
      </h2>
      <button
        type="button"
        class="detail-button secondary"
        aria-label="Close trailer"
        @click="dialog.close()"
      >
        Close
      </button>
    </div>
    <select
      v-if="videos.length > 1"
      v-model="selected"
      aria-label="Trailer"
    >
      <option
        v-for="(option, index) in videos"
        :key="`${option.site}:${option.key}`"
        :value="index"
      >
        {{ option.name }}{{ option.official ? ' · Official' : '' }}
      </option>
    </select>
    <iframe
      v-if="active && video"
      :key="embedUrl"
      :src="embedUrl"
      :title="`${title}: ${video.name}`"
      allow="fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    />
    <a
      v-if="video"
      :href="watchUrl"
      target="_blank"
      rel="noopener noreferrer"
    >Watch on {{ video.site }} ↗</a>
  </dialog>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
const props = defineProps({ trailers: { type: Array, default: () => [] }, title: { type: String, required: true }, quiet: { type: Boolean, default: false } })
const dialog = ref(null)
const active = ref(false)
const selected = ref(0)
const videos = computed(() => props.trailers.filter(video =>
  (video.site === 'YouTube' && /^[\w-]{11}$/.test(video.key)) || (video.site === 'Vimeo' && /^\d{1,12}$/.test(video.key))
))
const video = computed(() => videos.value[selected.value] || videos.value[0])
const embedUrl = computed(() => video.value?.site === 'YouTube'
  ? `https://www.youtube-nocookie.com/embed/${video.value.key}?rel=0`
  : `https://player.vimeo.com/video/${video.value?.key}`)
const watchUrl = computed(() => video.value?.site === 'YouTube'
  ? `https://www.youtube.com/watch?v=${video.value.key}`
  : `https://vimeo.com/${video.value?.key}`)
function open () {
  active.value = true
  dialog.value.showModal()
}
function backdropClick (event) {
  if (event.target !== dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.value.close()
}
watch(() => props.title, () => { dialog.value?.close(); active.value = false; selected.value = 0 })
onBeforeUnmount(() => dialog.value?.close())
</script>

<style scoped lang="sass">
.detail-button.secondary.quiet
  min-height: 44px
  padding: 0 12px
  border-color: transparent
  background: transparent
  font-size: 0.875rem
  font-weight: 500
  &:hover
    color: var(--color-brand-turquoise)
    background: rgba(40, 40, 40, 0.5)
.trailer-dialog
  width: min(960px, calc(100vw - 32px))
  max-width: none
  max-height: calc(100dvh - 32px)
  box-sizing: border-box
  padding: 20px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-md)
  color: var(--color-text)
  background: var(--color-bg-1)
  &::backdrop
    background: rgba(0, 0, 0, 0.85)
  iframe
    display: block
    width: 100%
    aspect-ratio: 16 / 9
    border: 0
    margin: 16px 0
    background: #000
  select
    width: 100%
    margin-top: 12px
  a
    display: inline-block
    color: var(--color-brand-turquoise)
    padding: 8px 0
.trailer-header
  display: flex
  align-items: center
  justify-content: space-between
  gap: 16px
  h2
    margin: 0
    font-size: 1.15rem
</style>
