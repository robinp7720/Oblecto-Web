<template>
  <span
    class="card-play"
    aria-hidden="true"
  >
    <PlayIcon />
  </span>
</template>

<script setup>
import PlayIcon from '@/components/icons/PlayIcon.vue'
</script>

<style scoped lang="sass">
.card-play
  position: absolute
  inset: 50% auto auto 50%
  transform: translate(-50%, -50%)
  display: flex
  align-items: center
  justify-content: center
  line-height: 1
  width: 40px
  height: 40px
  border: 1px solid #ffffff30
  border-radius: 50%
  background: #111a18a6
  color: #f0f3f0
  opacity: var(--card-play-opacity, 0)
  pointer-events: none
  transition: opacity var(--motion-fast), background-color var(--motion-fast)
  svg
    width: 18px
    height: 18px
  button:hover > &, button:focus-visible > &
    background: #17241feb

@media (hover: none), (pointer: coarse)
  .card-play
    inset: auto 12px 12px auto
    transform: none
    width: 30px
    height: 30px
    opacity: 1

@media (prefers-reduced-motion: reduce)
  .card-play
    transition: none
</style>
