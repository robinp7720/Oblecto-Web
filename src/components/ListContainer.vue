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
.titlebar
  overflow: hidden

  padding: 30px 20px 15px

  .title
    padding: 0
    margin: 0

    float: left

    font:
      family: roboto
      size: 20px

  .scroll-buttons
    float: right
    font-size: 20px

    .scroll-button
      margin: 0 10px

</style>
