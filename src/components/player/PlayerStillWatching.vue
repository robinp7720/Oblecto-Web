<template>
  <div
    ref="dialog"
    class="still-watching"
    role="dialog"
    aria-modal="true"
    aria-labelledby="still-watching-title"
    aria-describedby="still-watching-description"
    @keydown.stop="onKeydown"
  >
    <div class="panel">
      <h2 id="still-watching-title">
        Are you still watching?
      </h2>
      <p id="still-watching-description">
        Playback has stopped after 90 minutes without interaction.
      </p>
      <PlayerEpisodePreview :info="next" />
      <div class="actions">
        <button
          type="button"
          class="primary"
          @click="$emit('continue')"
        >
          Continue watching
        </button>
        <button
          type="button"
          class="secondary"
          @click="$emit('stop')"
        >
          Stop watching
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PlayerEpisodePreview from './PlayerEpisodePreview.vue'
defineProps({ next: { type: Object, required: true } })
defineEmits(['continue', 'stop'])
const dialog = ref(null)
onMounted(() => dialog.value.querySelector('button').focus())
function onKeydown (event) {
  if (event.key !== 'Tab') return
  const buttons = [...dialog.value.querySelectorAll('button')]
  const index = buttons.indexOf(document.activeElement)
  event.preventDefault()
  buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus()
}
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p
.still-watching
  position: absolute
  inset: 0
  z-index: 30
  display: grid
  place-items: center
  padding: 24px
  overflow: auto
  background: rgba(0, 0, 0, 0.9)
.panel
  width: min(400px, 100%)
  text-align: center
h2
  margin: 0
.actions
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 10px
  margin-top: 20px
button
  +p.player-action
</style>
