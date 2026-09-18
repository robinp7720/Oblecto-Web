<template>
  <div class="autosave-bar">
    <p>Changes save automatically after you finish editing a field.</p>
    <SaveState :state="state" />
    <p
      v-if="dirty && state.status !== 'busy'"
      role="status"
    >
      Unsaved changes
    </p>
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
  </div>
</template>
<script setup>
import SaveState from '@/components/system/SaveState.vue'
defineProps({ state: { type: Object, required: true }, form: { type: Object, required: true }, dirty: Boolean })
defineEmits(['retry', 'revert'])
</script>
