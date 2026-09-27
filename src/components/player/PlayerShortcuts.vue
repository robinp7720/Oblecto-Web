<template>
  <div
    class="shortcuts"
    role="dialog"
    aria-labelledby="player-shortcuts-title"
  >
    <div class="panel">
      <header>
        <h2 id="player-shortcuts-title">
          Keyboard shortcuts
        </h2>
        <button
          ref="close"
          type="button"
          class="close"
          aria-label="Close keyboard shortcuts"
          @click="$emit('close')"
        >
          <PlayerIcon name="close" />
        </button>
      </header>
      <dl>
        <div
          v-for="[keys, action] in SHORTCUTS"
          :key="action"
        >
          <dt>
            <kbd
              v-for="key in keys"
              :key="key"
            >{{ key }}</kbd>
          </dt>
          <dd>{{ action }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PlayerIcon from './PlayerIcon.vue'

// Every key usePlayerHotkeys handles, in one place a user can find them.
const SHORTCUTS = [
  [['Space', 'K'], 'Play or pause'],
  [['←', 'J'], 'Back 10 seconds'],
  [['→', 'L'], 'Forward 10 seconds'],
  [['↑', '↓'], 'Volume up or down'],
  [['M'], 'Mute'],
  [['C'], 'Subtitles on or off'],
  [['[', ']'], 'Slower or faster'],
  [['F'], 'Full screen'],
  [['Esc'], 'Close a panel, or leave full screen'],
  [['?'], 'Show these shortcuts']
]

defineEmits(['close'])

const close = ref(null)
onMounted(() => close.value?.focus())
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.shortcuts
  position: absolute
  inset: 0
  display: grid
  place-items: center
  padding: 16px
  background: rgba(0, 0, 0, 0.6)
  animation: motion-fade var(--motion-fast) var(--ease-out)

.panel
  +p.player-panel
  width: min(420px, 100%)
  max-height: 100%
  overflow: auto
  padding: 18px 20px 20px
  border-radius: var(--radius-lg)

header
  display: flex
  align-items: center
  justify-content: space-between
  margin-bottom: 8px

h2
  margin: 0
  font-size: 1.05rem

.close
  +p.player-button

dl
  display: grid
  gap: 10px
  margin: 0
  div
    display: grid
    grid-template-columns: 7.5em 1fr
    align-items: center
    gap: 12px

dt
  display: flex
  gap: 6px

dd
  margin: 0
  color: var(--color-text-muted)

kbd
  min-width: 2em
  padding: 3px 7px
  border: 1px solid var(--color-border-strong)
  border-bottom-width: 2px
  border-radius: var(--radius-sm)
  background: rgba(255, 255, 255, 0.06)
  font-family: inherit
  font-size: 0.8rem
  text-align: center
</style>
