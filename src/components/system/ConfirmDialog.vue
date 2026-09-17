<template>
  <AppDialog
    v-model:open="state.open"
    :title="state.title"
    size="sm"
    @close="settleConfirm(false)"
    @submit="settleConfirm(true)"
  >
    <p
      v-if="state.message"
      class="confirm-message"
    >
      {{ state.message }}
    </p>

    <template #footer>
      <button
        type="button"
        class="btn btn-secondary"
        @click="settleConfirm(false)"
      >
        {{ state.cancelLabel }}
      </button>
      <button
        type="submit"
        class="btn"
        :class="{ 'btn-destructive': state.destructive }"
      >
        {{ state.confirmLabel }}
      </button>
    </template>
  </AppDialog>
</template>

<script setup>
import AppDialog from '@/components/system/AppDialog.vue'
import { confirmState as state, settleConfirm } from '@/composables/useConfirm'
</script>

<style scoped lang="sass">
.confirm-message
  margin: 0
  color: var(--color-text-muted)
  line-height: 1.6
</style>
