<template>
  <div class="list-container">
    <div
      v-if="title"
      class="titlebar"
    >
      <h3 class="title">
        {{ title }} <span
          v-if="badge !== undefined"
          class="badge"
        >{{ badge }}</span>
      </h3>
    </div>
    <div class="list-inner">
      <Scroller>
        <slot />
      </Scroller>
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'

import Scroller from '@/components/Scroller'

export default {
  name: 'ListContainer',
  components: { FontAwesomeIcon, Scroller },
  props: { 'title': String, 'badge': Number }
}
</script>

<style scoped lang="sass">
.list-container
  padding: 0 10px

.titlebar
  overflow: hidden

  padding: 30px 0 18px
  border-bottom: 1px solid rgba(255, 255, 255, 0.06)
  margin-bottom: 6px

  .title
    padding: 0
    margin: 0

    float: left

    font:
      family: var(--font-display)
      size: 22px
      weight: 600
    letter-spacing: 0.02em
    color: var(--color-text)

  .scroll-buttons
    float: right
    font-size: 20px

    .scroll-button
      margin: 0 10px

</style>
