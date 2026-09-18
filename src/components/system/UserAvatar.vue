<template>
  <span
    class="user-avatar"
    :style="{ '--avatar-size': `${size}px`, '--avatar-hue': hue }"
    aria-hidden="true"
  >
    <img
      v-if="src && !failed"
      :src="src"
      alt=""
      draggable="false"
      @error="failed = true"
    >
    <span
      v-else
      class="initials"
    >{{ initials }}</span>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import oblectoClient from '@/oblectoClient'

// The picture a user uploaded, or their initials on a colour derived from the
// username so the same person keeps the same colour everywhere.
const props = defineProps({
  user: { type: Object, required: true },
  size: { type: Number, default: 40 }
})

const failed = ref(false)

const src = computed(() => oblectoClient.userManager.avatarUrl(props.user.id, props.user.avatar))

watch(src, () => { failed.value = false })

const initials = computed(() => {
  const words = String(props.user.name || props.user.username || '?').trim().split(/\s+/)
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)

  return letters.toUpperCase()
})

const hue = computed(() => {
  let hash = 0

  for (const char of String(props.user.username || props.user.id)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0

  return hash % 360
})
</script>

<style scoped lang="sass">
.user-avatar
  display: inline-grid
  place-items: center
  flex: none
  width: var(--avatar-size)
  height: var(--avatar-size)
  border-radius: 50%
  overflow: hidden
  background: hsl(var(--avatar-hue), 45%, 38%)
  color: #fff
  user-select: none

  img
    width: 100%
    height: 100%
    object-fit: cover

.initials
  font-weight: 800
  font-size: calc(var(--avatar-size) * 0.38)
  letter-spacing: 0.02em
</style>
