<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="direction === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'" />
  </svg>
</template>

<script setup>
defineProps({ direction: { type: String, default: 'right' } })
</script>

<style scoped>
svg {
  display: block;
  flex-shrink: 0;
}
</style>
