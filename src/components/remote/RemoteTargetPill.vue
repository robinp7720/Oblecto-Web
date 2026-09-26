<template>
  <!-- Play buttons across the app follow the chosen device, so while it is
       another one, the header says so and offers the way back. -->
  <div
    v-if="device"
    class="remote-target"
  >
    <span
      class="dot"
      aria-hidden="true"
    />
    <span class="label"><span class="lead">Connected to </span><strong>{{ device.name }}</strong></span>
    <button
      type="button"
      :aria-label="`Play on this device instead of ${device.name}`"
      :title="`Play on this device instead of ${device.name}`"
      @click="remote.setTarget('local')"
    >
      ×
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRemoteStore } from '@/remote/state'

const remote = useRemoteStore()
const device = computed(() => remote.isRemote ? remote.activeDevice : null)
</script>

<style scoped lang="sass">
.remote-target
  display: inline-flex
  align-items: center
  gap: 8px
  min-width: 0
  max-width: 240px
  padding: 2px 2px 2px 12px
  border: 1px solid rgba(35, 199, 205, 0.45)
  border-radius: 999px
  color: var(--color-text)
  font-size: 0.8rem

.dot
  flex: none
  width: 8px
  height: 8px
  border-radius: 50%
  background: var(--color-brand-turquoise)

.label
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

button
  flex: none
  width: 36px
  height: 36px
  border: 0
  border-radius: 50%
  background: transparent
  color: var(--color-text-muted)
  font-size: 1.1rem
  cursor: pointer
  &:hover
    background: rgba(255, 255, 255, 0.1)
    color: var(--color-text)

@media (max-width: 760px)
  .lead
    display: none
  .remote-target
    max-width: 160px
</style>
