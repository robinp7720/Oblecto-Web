<template>
  <AppDialog
    :open="open"
    :dirty="password !== ''"
    title="Set password"
    :subtitle="user ? `This replaces the password for ${user.username}. They are not notified.` : ''"
    size="sm"
    @update:open="$emit('update:open', $event)"
    @submit="setPassword"
  >
    <div
      class="form-group"
      :class="{ 'is-invalid': Boolean(error) }"
    >
      <label for="new-password">New password</label>
      <input
        id="new-password"
        ref="passwordInput"
        v-model="password"
        type="password"
        autocomplete="new-password"
        :aria-describedby="error ? 'new-password-error' : undefined"
      >
      <p
        v-if="error"
        id="new-password-error"
        class="form-hint form-error"
      >
        {{ error }}
      </p>
    </div>

    <template #status>
      <SaveState :state="save" />
    </template>

    <template #footer>
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('update:open', false)"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="save.status === 'busy'"
      >
        Set password
      </button>
    </template>
  </AppDialog>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import AppDialog from '@/components/system/AppDialog.vue'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'
import oblectoClient from '@/oblectoClient'

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'changed'])

const save = createSaveState()
const password = ref('')
const error = ref('')
const passwordInput = ref(null)

watch(() => props.open, async open => {
  if (!open) return

  password.value = ''
  error.value = ''
  save.reset()

  await nextTick()
  passwordInput.value?.focus()
})

async function setPassword () {
  if (!props.user) return

  if (!password.value) {
    error.value = 'A password is required.'
    return
  }

  error.value = ''

  const ok = await save.run(
    () => oblectoClient.userManager.updateUser(props.user.id, { password: password.value }),
    { busy: 'Saving…', ok: 'Password changed', error: 'Could not change this password' }
  )

  if (!ok) return

  emit('changed')
  emit('update:open', false)
}
</script>
