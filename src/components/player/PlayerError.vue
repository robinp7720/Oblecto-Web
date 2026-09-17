<template>
  <div
    class="error"
    role="alert"
  >
    <PlayerIcon
      name="alert"
      class="glyph"
    />
    <p class="message">
      {{ message }}
    </p>
    <div class="actions">
      <button
        type="button"
        class="primary"
        @click="$emit('retry')"
      >
        Retry
      </button>
      <button
        v-if="canChooseSource"
        type="button"
        class="secondary"
        @click="$emit('choose-source')"
      >
        Choose another source
      </button>
    </div>
  </div>
</template>

<script setup>
import PlayerIcon from './PlayerIcon.vue'

defineProps({
  message: { type: String, required: true },
  canChooseSource: { type: Boolean, default: false }
})

defineEmits(['retry', 'choose-source'])
</script>

<style scoped lang="sass">
@use '@/assets/sass/player' as p

.error
  +p.player-panel
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  display: grid
  justify-items: center
  gap: 14px
  width: min(420px, calc(100vw - 32px))
  padding: 28px 24px
  border-radius: var(--radius-lg)
  text-align: center

.glyph
  font-size: 32px
  color: var(--color-accent)

.message
  margin: 0
  color: var(--color-text-muted)
  line-height: 1.5

.actions
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 10px

button
  min-height: 46px
  padding: 12px 24px
  border: 0
  border-radius: var(--radius-sm)
  font-size: 0.95rem
  font-weight: 700
  cursor: pointer

.primary
  background: var(--color-brand-coral)
  color: #141414
  &:hover
    background: var(--color-brand-orange)

.secondary
  border: 1px solid var(--color-border-strong)
  background: rgba(40, 40, 40, 0.8)
  color: var(--color-text)
  &:hover
    background: #383838
</style>
