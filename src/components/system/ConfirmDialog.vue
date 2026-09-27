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

    <!-- Focus starts on the safe answer: Cancel when confirming would destroy
         something, so a reflexive Enter does nothing harmful. -->
    <template #footer>
      <button
        type="button"
        class="btn btn-secondary"
        :autofocus="state.destructive"
        @click="settleConfirm(false)"
      >
        {{ state.cancelLabel }}
      </button>
      <button
        type="submit"
        class="btn"
        :class="state.destructive ? 'btn-destructive' : 'btn-primary'"
        :autofocus="!state.destructive"
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
