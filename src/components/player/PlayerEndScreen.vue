<template>
  <div
    class="end-screen"
    role="dialog"
    :aria-label="heading"
  >
    <!-- The player's own controls are hidden behind this screen, so it
         carries their way out. -->
    <button
      type="button"
      class="close"
      aria-label="Close player"
      @click="$emit('close')"
    >
      <PlayerIcon name="close" />
    </button>
    <div
      ref="panel"
      class="panel"
    >
      <p class="label">
        {{ label }}
      </p>
      <h2>{{ heading }}</h2>
      <PlayerEpisodePreview
        v-if="next"
        :info="next"
        playable
        @play="$emit('play-next')"
      />
      <div class="actions">
        <button
          v-if="kind === 'movie'"
          type="button"
          class="primary"
          @click="$emit('more-like-this')"
        >
          More like this
        </button>
        <button
          type="button"
          class="secondary"
          @click="$emit('details')"
        >
          {{ kind === 'movie' ? 'Back to details' : 'Back to show' }}
        </button>
        <button
          type="button"
          class="secondary"
          @click="$emit('replay')"
        >
          Watch again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PlayerIcon from './PlayerIcon.vue'
import PlayerEpisodePreview from './PlayerEpisodePreview.vue'

// What to do once a title has finished, instead of a black frame. Only shown
// when nothing plays on by itself: a movie, the last episode, or an episode
// whose autoplay was turned off or cancelled.
const props = defineProps({
  kind: { type: String, required: true }, // 'movie' | 'episode'
  title: { type: String, required: true },
  next: { type: Object, default: null }
})

defineEmits(['play-next', 'more-like-this', 'details', 'replay', 'close'])

const panel = ref(null)
const label = computed(() => props.kind === 'movie' ? 'Finished' : props.next ? 'Episode finished' : 'You are all caught up')
const heading = computed(() => props.title)

// Keyboard users land on the main choice rather than wherever focus was.
onMounted(() => panel.value?.querySelector('button')?.focus())
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.end-screen
  position: absolute
  inset: 0
  display: grid
  place-items: center
  padding: 24px
  overflow: auto
  background: rgba(0, 0, 0, 0.8)
  animation: motion-fade var(--motion-base) var(--ease-out)

.panel
  display: grid
  justify-items: center
  gap: 12px
  width: min(400px, 100%)
  text-align: center

.label
  +p.player-label

h2
  margin: 0 0 12px
  font-size: clamp(1.4rem, 3vw, 2.2rem)
  letter-spacing: -0.03em

.actions
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 10px

.actions button
  +p.player-action

.close
  +p.player-button
  position: absolute
  top: max(12px, var(--safe-top, 0px))
  right: 12px
</style>
