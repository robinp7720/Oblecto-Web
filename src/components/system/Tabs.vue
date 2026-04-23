<template>
  <div class="tabs">
    <div class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="tabs-nav-button"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>
    <div class="tabs-body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  data () {
    return {
      tabs: [],
      activeTab: null
    }
  },
  methods: {
    registerTab (name) {
      if (!this.tabs.includes(name)) {
        this.tabs.push(name)
      }

      if (!this.activeTab) {
        this.activeTab = name
      }
    }
  },
  provide () {
    return {
      tabsController: this
    }
  }
}
</script>

<style scoped lang="sass">
.tabs
  display: grid
  gap: 14px

.tabs-nav
  display: flex
  gap: 8px
  flex-wrap: wrap

.tabs-nav-button
  border: 1px solid var(--color-border)
  border-radius: 999px
  background: rgba(255, 255, 255, 0.08)
  color: var(--color-text)
  padding: 8px 14px
  cursor: pointer

  &.active
    background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong))
    color: #1b1616
    border-color: transparent
</style>
