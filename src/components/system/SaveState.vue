<template>
  <!-- Always rendered so assistive tech has a stable live region to announce
       into; only the text inside changes. -->
  <p
    class="save-state"
    :class="`save-state--${state.status}`"
    role="status"
    aria-live="polite"
  >
    <span
      v-if="state.status !== 'idle'"
      class="save-state__inner"
    >
      <span
        class="save-state__dot"
        aria-hidden="true"
      />{{ state.message }}
    </span>
  </p>
</template>

<script setup>
defineProps({
  state: { type: Object, required: true }
})
</script>

<style scoped lang="sass">
.save-state
  margin: 0
  min-height: 1.35em
  font-size: 0.85rem
  color: var(--color-text-faint)

.save-state__inner
  display: inline-flex
  align-items: center
  gap: 8px

.save-state__dot
  width: 8px
  height: 8px
  border-radius: 999px
  background: currentColor

.save-state--busy
  color: var(--color-text-muted)

  .save-state__dot
    animation: save-state-pulse 1s ease-in-out infinite

.save-state--ok
  color: var(--color-success)

.save-state--error
  color: var(--color-danger)

@keyframes save-state-pulse
  0%, 100%
    opacity: 0.3
  50%
    opacity: 1
</style>
