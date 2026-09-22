<template>
  <!-- Silent while everything works. The old build toasted "Connection to
       Oblecto succeeded" and "Authentication success" on every page load; a
       connection only deserves the user's attention when it is broken. -->
  <div
    class="connection-status"
    role="status"
    aria-live="polite"
  >
    <span
      v-if="connection.status !== 'connected'"
      class="connection-pill"
      :class="`connection-pill--${connection.status}`"
      :title="connection.detail ? `${label} — ${connection.detail}` : label"
    >
      <span
        class="connection-dot"
        aria-hidden="true"
      />
      <!-- On narrow screens the label is clipped to the dot so it cannot push
           the avatar onto its own row. It stays in the DOM, so assistive tech
           still reads it and the title attribute still shows it. -->
      <span class="connection-label">{{ label }}</span>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConnectionStore } from '@/stores/connection'

const connection = useConnectionStore()

const label = computed(() => (
  connection.status === 'offline' ? 'Server offline' : 'Reconnecting…'
))
</script>

<style scoped lang="sass">
.connection-status
  display: flex
  align-items: center

.connection-pill
  display: inline-flex
  align-items: center
  gap: 8px
  padding: 6px 12px
  border-radius: 999px
  border: 1px solid var(--color-border)
  background: var(--color-surface)
  color: var(--color-text-muted)
  font-size: 0.75rem
  white-space: nowrap

.connection-dot
  width: 7px
  height: 7px
  border-radius: 999px
  background: currentColor

.connection-pill--connecting
  color: #e3c169

  .connection-dot
    animation: connection-pulse 1.1s ease-in-out infinite

.connection-pill--offline
  color: #ff8f7a
  border-color: rgba(255, 143, 122, 0.4)

@keyframes connection-pulse
  0%, 100%
    opacity: 0.35
  50%
    opacity: 1

@media (max-width: 760px)
  .connection-pill
    padding: 8px

  .connection-label
    position: absolute
    width: 1px
    height: 1px
    margin: -1px
    padding: 0
    overflow: hidden
    clip-path: inset(50%)
    white-space: nowrap
</style>
