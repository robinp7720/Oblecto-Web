<template>
  <transition-group
    name="staggered-fade"
    tag="ul"
    class="scroller"
    ref="scroller"
    v-bind:css="true"
    v-on:before-enter="beforeEnter"
    v-on:enter="enter"
    v-on:leave="leave"
  >
    <slot></slot>
  </transition-group>
</template>

<script>
import Velocity from 'velocity-animate'

export default {
  name: 'Scroller',
  methods: {
    beforeEnter: function (el) {
      el.style.opacity = 0
      el.style.width = 0
    },
    enter: function (el, done) {
      let delay = el.dataset.index * 150
      setTimeout(function () {
        Velocity(
          el,
          { opacity: 1, width: '357px' },
          { complete: done }
        )
      }, delay)
    },
    leave: function (el, done) {
      let delay = el.dataset.index * 150
      setTimeout(function () {
        Velocity(
          el,
          { opacity: 0, width: 0 },
          { complete: done }
        )
      }, delay)
    }
  }
}
</script>

<style scoped lang="sass">
.scroller
  overflow: hidden
  overflow-x: visible
  white-space: nowrap
  padding: 5px 0

.staggered-fade-move
  transition: transform 1s

</style>
