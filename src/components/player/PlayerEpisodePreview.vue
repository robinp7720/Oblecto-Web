<template>
  <article class="episode-preview">
    <component
      :is="playable ? 'button' : 'div'"
      class="episode-art"
      :type="playable ? 'button' : undefined"
      :aria-label="playable ? `${actionLabel}: ${info.title}` : undefined"
      @click="playable && $emit('play')"
    >
      <img
        v-if="info.artwork && !failed"
        :src="info.artwork"
        alt=""
        @error="failed = true"
      >
      <span
        v-else
        class="art-fallback"
        aria-hidden="true"
      >{{ info.numbering || 'Next episode' }}</span>
      <CardPlayIndicator v-if="playable" />
      <span
        v-if="info.runtime"
        class="runtime"
      >{{ info.runtime }}</span>
      <span
        v-if="countdown"
        class="countdown-progress"
        aria-hidden="true"
      ><span :style="{ width: `${elapsed * 100}%` }" /></span>
    </component>
    <div class="episode-copy">
      <span
        v-if="info.numbering"
        class="episode-number"
      >{{ info.numbering }}</span>
      <p class="episode-title">
        {{ info.title }}
      </p>
    </div>
  </article>
</template>

<script setup>
import CardPlayIndicator from '@/components/media/CardPlayIndicator.vue'
import { ref, watch } from 'vue'
const props = defineProps({
  info: { type: Object, required: true },
  playable: { type: Boolean, default: false },
  actionLabel: { type: String, default: 'Play next' },
  countdown: { type: Boolean, default: false },
  elapsed: { type: Number, default: 0 }
})
defineEmits(['play'])
const failed = ref(false)
watch(() => props.info.artwork, () => { failed.value = false })
</script>

<style scoped lang="sass">
@use '@/assets/sass/episode-card' as card

.episode-preview
  +card.episode-card
  width: 100%
  text-align: left

.episode-art:not(button)
  cursor: default

.episode-art:focus-visible
  outline: 2px solid var(--color-text)
  outline-offset: 3px

.episode-title
  margin: 0
  overflow-wrap: anywhere

.countdown-progress
  position: absolute
  inset: auto 0 0
  height: 3px
  background: rgba(255, 255, 255, 0.2)
  span
    display: block
    height: 100%
    background: var(--color-brand-coral)
</style>
