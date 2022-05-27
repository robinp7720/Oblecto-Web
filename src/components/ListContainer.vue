<template>
  <div class="list-container">
    <div class="titlebar" v-if="title">
      <h3 class="title">{{ title }} <span class="badge" v-if="badge !== undefined">{{ badge }}</span></h3>
    </div>
    <div class="list-inner">
      <Scroller>
        <slot></slot>
      </Scroller>
    </div>
  </div>
</template>

<script>
import Scroller from '@/components/Scroller.vue';

export default {
  name: 'ListContainer',
  props: { title: String, badge: Number },
  components: { Scroller },
};
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
