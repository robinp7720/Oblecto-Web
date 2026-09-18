<template>
  <div
    :id="availableOptions.length ? undefined : id"
    class="tag-input"
    tabindex="-1"
  >
    <div class="tags-container">
      <div
        v-for="tag in tags"
        :key="tag"
        class="tag"
      >
        {{ tag }}
        <button
          type="button"
          class="remove"
          :aria-label="`Remove ${tag}`"
          @click="removeTag(tag)"
        >
          ×
        </button>
      </div>
      <div
        v-if="availableOptions.length > 0"
        class="add-tag-wrapper"
      >
        <select
          :id="id"
          v-model="selectedOption"
          :aria-label="$attrs['aria-label']"
          class="add-select"
          @change="addTag"
        >
          <option
            value=""
            disabled
            selected
          >
            + Add...
          </option>
          <option
            v-for="opt in availableOptions"
            :key="opt"
            :value="opt"
          >
            {{ opt }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
// This was still on the Vue 2 v-model contract (`value` + `input`). Under Vue 3
// `v-model` passes `modelValue`, so `value` was always undefined and every tag
// field threw on render — which is why the identifier and updater pickers on
// Settings → Libraries came up empty.
export default {
  name: 'TagInput',
  props: {
    id: { type: String, default: undefined },
    modelValue: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      selectedOption: ''
    }
  },
  computed: {
    tags () {
      return Array.isArray(this.modelValue) ? this.modelValue : []
    },
    availableOptions () {
      return this.options.filter(opt => !this.tags.includes(opt))
    }
  },
  methods: {
    addTag () {
      if (!this.selectedOption) return

      this.$emit('update:modelValue', [...this.tags, this.selectedOption])
      this.selectedOption = ''
    },
    removeTag (tag) {
      this.$emit('update:modelValue', this.tags.filter(t => t !== tag))
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
    padding: 0
    border: 0
    background: transparent
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
