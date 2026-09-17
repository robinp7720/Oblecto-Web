<template>
  <span class="brand-logo"><img
    :src="mark"
    alt=""
  ><span>Oblecto</span></span>
</template>
<script setup>
import mark from '@/assets/oblecto-mark.png'
</script>
<style scoped lang="sass">
.brand-logo
  display: inline-flex
  align-items: center
  gap: 9px
  color: var(--color-brand-turquoise)
  font-weight: 700
  font-size: 1.45rem
  letter-spacing: -0.045em
  img
    width: 42px
    height: 30px
    object-fit: contain
@media (max-width: 400px)
  .brand-logo
    font-size: 1.2rem
    gap: 6px
    img
      width: 32px
</style>
