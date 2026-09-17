<template>
  <!-- These pages write every change straight back to the server. That used to
       be invisible except for a toast per keystroke-group; saying so once, in a
       bar that stays on screen, explains the behaviour and reports the result
       in the same place. -->
  <div class="autosave-bar">
    <p class="autosave-note">
      Changes are saved as you make them.
    </p>
    <SaveState :state="state" />
  </div>
</template>

<script setup>
import SaveState from '@/components/system/SaveState.vue'

defineProps({
  state: { type: Object, required: true }
})
</script>

<style scoped lang="sass">
.autosave-bar
  position: sticky
  bottom: 0
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: space-between
  gap: 12px
  margin-top: 4px
  padding: 12px 16px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-md)
  background: var(--color-surface-glass)
  backdrop-filter: var(--glass-blur)

.autosave-note
  margin: 0
  color: var(--color-text-faint)
  font-size: 0.8rem
</style>
