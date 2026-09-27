<template>
  <!-- Switches save as they change; typed fields wait here for Save changes.
       SaveState is the one live region, so the outcome is announced once. -->
  <div
    class="autosave-bar"
    :class="{ dirty }"
  >
    <p
      v-if="dirty"
      class="unsaved"
    >
      Unsaved changes
    </p>
    <SaveState :state="state" />
    <div class="bar-actions">
      <button
        v-if="state.status === 'error'"
        type="button"
        class="btn"
        :disabled="form.loading || form.saving"
        @click="$emit('retry')"
      >
        Retry
      </button>
      <button
        v-if="dirty"
        type="button"
        class="btn btn-secondary"
        :disabled="form.saving"
        @click="$emit('revert')"
      >
        Revert
      </button>
      <button
        v-if="dirty"
        type="button"
        class="btn btn-primary"
        :disabled="form.saving || !form.ready"
        @click="$emit('save')"
      >
        Save changes
      </button>
    </div>
  </div>
</template>
<script setup>
import SaveState from '@/components/system/SaveState.vue'
defineProps({ state: { type: Object, required: true }, form: { type: Object, required: true }, dirty: Boolean })
defineEmits(['retry', 'revert', 'save'])
</script>
<style scoped lang="sass">
.unsaved
  margin: 0
  font-weight: 700
.bar-actions
  display: flex
  flex-wrap: wrap
  gap: 10px
  margin-left: auto
</style>
