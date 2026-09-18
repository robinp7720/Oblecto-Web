<template>
  <AppDialog
    :open="open"
    title="Edit user"
    :subtitle="user ? `Changes the details of ${user.username}.` : ''"
    size="md"
    @update:open="$emit('update:open', $event)"
    @submit="saveUser"
  >
    <div class="form-grid">
      <div
        v-for="field in fields"
        :key="field.key"
        class="form-group"
        :class="{ 'is-invalid': Boolean(errors[field.key]) }"
      >
        <label :for="`edit-user-${field.key}`">{{ field.label }}</label>
        <input
          :id="`edit-user-${field.key}`"
          v-model.trim="form[field.key]"
          :type="field.type"
          :autocomplete="field.autocomplete"
          :aria-describedby="errors[field.key] ? `edit-user-${field.key}-error` : undefined"
        >
        <p
          v-if="errors[field.key]"
          :id="`edit-user-${field.key}-error`"
          class="form-hint form-error"
        >
          {{ errors[field.key] }}
        </p>
      </div>
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
        Save
      </button>
    </template>
  </AppDialog>
</template>

<script setup>
import { reactive, watch } from 'vue'
import AppDialog from '@/components/system/AppDialog.vue'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'
import oblectoClient from '@/oblectoClient'

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'saved'])

const fields = [
  { key: 'name', label: 'Name', type: 'text', autocomplete: 'off' },
  { key: 'username', label: 'Username', type: 'text', autocomplete: 'off' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'off' }
]

const save = createSaveState()
const form = reactive({ name: '', username: '', email: '' })
const errors = reactive({})

watch(() => props.open, open => {
  if (!open || !props.user) return

  for (const field of fields) {
    form[field.key] = props.user[field.key] || ''
    delete errors[field.key]
  }

  save.reset()
})

async function saveUser () {
  if (!props.user) return

  for (const field of fields) delete errors[field.key]
  if (!form.username) errors.username = 'A username is required.'
  if (Object.keys(errors).length) return

  // Only what changed, so an untouched field is never overwritten.
  const changes = Object.fromEntries(fields
    .map(field => [field.key, form[field.key]])
    .filter(([key, value]) => value !== (props.user[key] || '')))

  if (!Object.keys(changes).length) {
    emit('update:open', false)
    return
  }

  let updated = null
  const ok = await save.run(
    async () => { updated = await oblectoClient.userManager.updateUser(props.user.id, changes) },
    { busy: 'Saving…', ok: 'Saved', error: `Could not update ${props.user.username}` }
  )

  if (!ok) return

  emit('saved', updated)
  emit('update:open', false)
}
</script>
