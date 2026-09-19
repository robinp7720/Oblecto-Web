<template>
  <div class="playback-control">
    <div class="playback-button">
      <button
        type="button"
        class="play"
        :aria-label="deviceName ? `${label} on ${deviceName}` : label"
        @click="$emit('play')"
      >
        <span aria-hidden="true">▶</span>
        <span class="copy">
          <span
            class="label"
            :title="label"
          >{{ label }}</span>
          <span
            v-if="deviceName"
            class="destination"
            :title="deviceName"
          >{{ deviceName }}</span>
        </span>
      </button>
      <div
        class="device-toggle"
        :title="`Play on ${deviceName || 'this device'}`"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        <!-- A native select keeps the small trigger keyboard and touch friendly. -->
        <select
          :value="remote.targetDeviceId"
          aria-label="Playback device"
          @change="setTarget($event.target.value)"
        >
          <option value="local">
            This device
          </option>
          <option
            v-for="device in playbackTargets"
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ device.name }}
          </option>
        </select>
      </div>
    </div>
    <span
      v-if="remote.lastError"
      class="device-error"
      role="status"
    >{{ remote.lastError }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { remote, playbackTargets, activeDevice, setTarget } from '@/remote/state'

defineProps({ label: { type: String, default: 'Play' } })
defineEmits(['play'])
const deviceName = computed(() => activeDevice.value?.name || '')
</script>

<style scoped lang="sass">
.playback-control
  flex: 0 0 auto
  width: max-content
  min-width: 0
  max-width: 100%
  align-self: center
.playback-button
  display: inline-grid
  // Reserve the arrow in intrinsic sizing as well as the final layout.
  grid-template-columns: minmax(0, 1fr) calc(var(--control-size) + 1px)
  width: max-content
  max-width: 100%
  border-radius: var(--radius-sm)
  background: var(--color-brand-coral)
  color: #141414
  transition: transform var(--motion-fast) var(--ease-out)
  &:has(.play:active)
    transform: scale(0.97)
.play
  display: flex
  align-items: center
  justify-content: center
  gap: 10px
  min-width: 0
  min-height: 48px
  padding: 10px 18px
  border: 0
  border-radius: var(--radius-sm) 0 0 var(--radius-sm)
  background: transparent
  color: inherit
  font-size: 1rem
  font-weight: 700
  cursor: pointer
  &:hover
    background: rgba(0, 0, 0, 0.08)
.play > span[aria-hidden]
  flex-shrink: 0
.label
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
.copy
  display: grid
  min-width: 0
  text-align: left
.destination
  max-width: 18ch
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  font-size: 0.7rem
  font-weight: 400
  line-height: 1.3
.device-toggle
  position: relative
  display: grid
  place-items: center
  min-height: var(--control-size)
  border-left: 1px solid rgba(20, 20, 20, 0.2)
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0
  &:hover
    background: rgba(0, 0, 0, 0.08)
  &:focus-within
    outline: 2px solid white
    outline-offset: 3px
  select
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    opacity: 0
    cursor: pointer
.device-error
  display: block
  margin-top: 8px
  max-width: 40ch
  color: var(--color-text-muted)
  font-size: 0.8rem
</style>
