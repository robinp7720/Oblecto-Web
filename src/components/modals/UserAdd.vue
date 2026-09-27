<template>
  <AppDialog
    :open="open"
    :dirty="dirty"
    title="Add user"
    subtitle="Creates an account that can sign in to this server."
    size="md"
    @update:open="$emit('update:open', $event)"
    @submit="addUser"
  >
    <div class="form-grid">
      <div
        v-for="field in fields"
        :key="field.key"
        class="form-group"
        :class="{ 'is-invalid': Boolean(errors[field.key]) }"
      >
        <label :for="`user-${field.key}`">{{ field.label }}</label>
        <input
          :id="`user-${field.key}`"
          v-model="form[field.key]"
          :type="field.type"
          :autocomplete="field.autocomplete"
          :aria-describedby="errors[field.key] ? `user-${field.key}-error` : undefined"
        >
        <p
          v-if="errors[field.key]"
          :id="`user-${field.key}-error`"
          class="form-hint form-error"
        >
          {{ errors[field.key] }}
        </p>
      </div>
    </div>

    <label class="checkbox-container">
      Show on the sign-in screen
      <input
        v-model="publicProfile"
        type="checkbox"
      >
      <span class="checkmark" />
    </label>

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
        Add user
      </button>
    </template>
  </AppDialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppDialog from '@/components/system/AppDialog.vue'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'
import oblectoClient from '@/oblectoClient'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'created'])

const fields = [
  { key: 'name', label: 'Name', type: 'text', autocomplete: 'name' },
  { key: 'username', label: 'Username', type: 'text', autocomplete: 'off' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  // Not trimmed: spaces are part of a password, and the account has to accept
  // exactly what the admin typed and hands on.
  { key: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', raw: true }
]

const save = createSaveState()
const form = reactive({ name: '', username: '', email: '', password: '' })
const errors = reactive({})
const publicProfile = ref(false)
const dirty = computed(() => fields.some(field => form[field.key] !== ''))

watch(() => props.open, open => {
  if (!open) return

  fields.forEach(field => {
    form[field.key] = ''
    delete errors[field.key]
  })
  publicProfile.value = false
  save.reset()
})

async function addUser () {
  // Validate per field so the message lands on the input that is wrong,
  // instead of a single "please fill out all fields" toast.
  let valid = true
  const value = field => field.raw ? form[field.key] : form[field.key].trim()

  fields.forEach(field => {
    if (value(field)) {
      delete errors[field.key]
    } else {
      errors[field.key] = `${field.label} is required.`
      valid = false
    }
  })

  if (!valid) return

  const [name, username, email, password] = fields.map(value)
  const ok = await save.run(
    () => oblectoClient.userManager.createUser(username, password, name, email, { publicProfile: publicProfile.value }),
    { busy: 'Creating…', ok: 'User created', error: 'Could not create this user' }
  )

  if (!ok) return

  emit('created')
  emit('update:open', false)
}
</script>
