<template>
  <aside
    class="up-next"
    aria-label="Up next"
  >
    <div class="copy">
      <p class="label">
        {{ countdown ? `Next episode in ${remaining}` : 'Up next' }}
      </p>
      <p class="title">
        <span
          v-if="numbering"
          class="numbering"
        >{{ numbering }}</span>
        {{ title }}
      </p>
    </div>
    <div class="actions">
      <button
        type="button"
        class="primary"
        :style="countdown ? { '--elapsed': `${elapsed * 100}%` } : null"
        :class="{ counting: countdown }"
        @click="$emit('play')"
      >
        {{ countdown ? 'Play now' : 'Play next' }}
      </button>
      <button
        type="button"
        class="secondary"
        @click="$emit(countdown ? 'cancel' : 'dismiss')"
      >
        {{ countdown ? 'Cancel' : 'Not now' }}
      </button>
    </div>
    <!-- Announced once per state, not every second of the countdown. -->
    <p
      class="sr-only"
      role="status"
    >
      {{ countdown ? `Next episode, ${title}, starts in ${total} seconds.` : `Up next: ${title}.` }}
    </p>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

// The next episode, offered outside the auto-hiding controls so it is there
// when the credits roll. With autoplay on it counts down, in playback time
// (pausing pauses it), and starts the episode itself.
const props = defineProps({
  title: { type: String, required: true },
  numbering: { type: String, default: '' },
  countdown: { type: Boolean, default: false },
  remaining: { type: Number, default: 0 },
  total: { type: Number, default: 10 }
})

defineEmits(['play', 'cancel', 'dismiss'])

const elapsed = computed(() => props.total ? 1 - props.remaining / props.total : 0)
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.up-next
  +p.player-panel
  position: absolute
  right: 24px
  bottom: 112px
  display: grid
  gap: 14px
  width: min(360px, calc(100% - 32px))
  padding: 18px
  border-radius: var(--radius-lg)
  animation: motion-rise var(--motion-base) var(--ease-out)

.label
  +p.player-label

.title
  margin: 6px 0 0
  font-weight: 700
  line-height: 1.35

.numbering
  margin-right: 6px
  color: var(--color-text-muted)
  font-weight: 600

.actions
  display: flex
  flex-wrap: wrap
  gap: 10px

button
  +p.player-action
  flex: 1 1 auto

// The countdown fills the Play now button from the left.
.primary.counting
  background: linear-gradient(90deg, var(--color-brand-orange) var(--elapsed), var(--color-brand-coral) var(--elapsed))

.sr-only
  +p.visually-hidden

@media (max-width: 600px)
  .up-next
    right: 12px
    bottom: 96px
    width: calc(100% - 24px)
</style>
