<template>
  <div class="notifications">
    <transition-group name="toast">
      <article
        v-for="item in notificationsState.items"
        :key="item.id"
        class="toast"
        :class="`toast-${item.type}`"
      >
        <strong v-if="item.title">{{ item.title }}</strong>
        <p>{{ item.text }}</p>
      </article>
    </transition-group>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const notificationsState = inject('notificationsState')
</script>

<style scoped lang="sass">
.notifications
  position: fixed
  right: max(20px, var(--safe-right))
  // Sits above the docked mini-player rather than behind it.
  bottom: calc(20px + var(--safe-bottom) + var(--mini-player-reserve))
  display: grid
  gap: 10px
  z-index: var(--z-toast)
  width: min(380px, calc(100vw - 32px))

.toast
  padding: 14px 16px
  border-radius: 16px
  border: 1px solid var(--color-border)
  background: rgba(24, 20, 23, 0.92)
  backdrop-filter: blur(10px)
  box-shadow: var(--shadow-soft)

  strong
    display: block
    margin-bottom: 4px

  p
    margin: 0
    color: var(--color-text-muted)

.toast-success
  border-color: rgba(95, 182, 114, 0.5)

.toast-error
  border-color: rgba(217, 87, 87, 0.5)

.toast-enter-active,
.toast-leave-active
  transition: all 0.2s ease

.toast-enter-from,
.toast-leave-to
  opacity: 0
  transform: translateY(12px)
</style>
