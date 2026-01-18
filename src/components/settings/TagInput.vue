<template>
  <div class="tag-input">
    <div class="tags-container">
      <div v-for="(tag, index) in value" :key="index" class="tag">
        {{ tag }}
        <span class="remove" @click="removeTag(tag)">×</span>
      </div>
      <div v-if="availableOptions.length > 0" class="add-tag-wrapper">
        <select v-model="selectedOption" @change="addTag" class="add-select">
          <option value="" disabled selected>+ Add...</option>
          <option v-for="opt in availableOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagInput',
  props: {
    value: {
      type: Array,
      required: true
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedOption: ""
    }
  },
  computed: {
    availableOptions() {
      return this.options.filter(opt => !this.value.includes(opt))
    }
  },
  methods: {
    addTag() {
      if (this.selectedOption) {
        const newValue = [...this.value, this.selectedOption]
        this.$emit('input', newValue)
        this.selectedOption = ""
      }
    },
    removeTag(tag) {
      const newValue = this.value.filter(t => t !== tag)
      this.$emit('input', newValue)
    }
  }
}
</script>

<style scoped lang="sass">
@use "sass:color"

// design guide tokens
$border-radius: var(--radius-sm)
$text-color: var(--color-text)
$text-muted: var(--color-text-muted)
$input-bg: rgba(255, 255, 255, 0.12)
$tag-bg: rgba(255, 255, 255, 0.08)

.tag-input
  width: 100%

.tags-container
  display: flex
  flex-wrap: wrap
  gap: 10px
  align-items: center
  background-color: rgba(255, 255, 255, 0.08)
  padding: 8px
  border-radius: $border-radius
  min-height: 42px
  border: 1px solid rgba(255, 255, 255, 0.08)

.tag
  background-color: $tag-bg
  color: $text-color
  padding: 4px 12px
  border-radius: $border-radius
  font-size: 14px
  display: flex
  align-items: center
  user-select: none
  border: 1px solid rgba(0,0,0,0.2)

  .remove
    margin-left: 10px
    cursor: pointer
    font-weight: bold
    color: $text-muted
    font-size: 18px
    line-height: 1
    &:hover
      color: #fff

.add-select
  background-color: $input-bg
  color: $text-color
  border: 1px solid transparent
  border-radius: $border-radius
  padding: 4px 10px
  font-size: 14px
  cursor: pointer
  outline: none
  width: auto
  appearance: none
  text-align: center
  font-family: var(--font-body)
  
  &:hover
    background-color: rgba(255, 255, 255, 0.18)

  option
    background-color: #2f2a2d
    color: var(--color-text)
</style>
