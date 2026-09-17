<template>
  <div
    v-show="isActive"
    class="tab-panel"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Tab',
  inject: ['tabsController'],
  props: {
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    isActive () {
      return this.tabsController.activeTab === this.name
    }
  },
  mounted () {
    this.tabsController.registerTab(this.name)
  }
}
</script>
