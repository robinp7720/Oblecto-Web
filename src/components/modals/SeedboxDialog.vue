<template>
  <AppDialog
    :open="open"
    :title="isNew ? 'Add seedbox' : 'Edit seedbox'"
    subtitle="Oblecto connects to this host and imports finished downloads from the directories below."
    size="lg"
    @update:open="value => { if (saveState.status !== 'busy') $emit('update:open', value) }"
    @submit="submit"
  >
    <fieldset
      class="settings-fields"
      :disabled="saveState.status === 'busy'"
    >
      <div class="form-grid">
        <div
          class="form-group"
          :class="{ 'is-invalid': Boolean(errors.name) }"
        >
          <label for="seedbox-name">Name</label>
          <input
            id="seedbox-name"
            v-model.trim="form.name"
            type="text"
            placeholder="My seedbox"
          >
          <p
            v-if="errors.name"
            class="form-hint form-error"
          >
            {{ errors.name }}
          </p>
        </div>

        <div class="form-group">
          <label for="seedbox-driver">Storage driver</label>
          <select
            id="seedbox-driver"
            v-model="form.storageDriver"
          >
            <option value="ssh">
              SSH
            </option>
            <option value="ftp">
              FTP
            </option>
            <option value="ftps">
              FTPS
            </option>
          </select>
        </div>

        <div
          class="form-group"
          :class="{ 'is-invalid': Boolean(errors.host) }"
        >
          <label for="seedbox-host">Host</label>
          <input
            id="seedbox-host"
            v-model.trim="form.storageDriverOptions.host"
            type="text"
            placeholder="seedbox.example.com"
          >
          <p
            v-if="errors.host"
            class="form-hint form-error"
          >
            {{ errors.host }}
          </p>
        </div>

        <div class="form-group">
          <label for="seedbox-username">Username</label>
          <input
            id="seedbox-username"
            v-model.trim="form.storageDriverOptions.username"
            type="text"
            autocomplete="off"
          >
        </div>

        <div class="form-group">
          <label for="seedbox-password">Password</label>
          <input
            id="seedbox-password"
            v-model="form.storageDriverOptions.password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
          >
        </div>

        <div class="form-group">
          <label for="seedbox-movie-dir">Movie directory</label>
          <input
            id="seedbox-movie-dir"
            v-model.trim="form.mediaImport.movieDirectory"
            type="text"
            placeholder="/downloads/finished/movie"
          >
        </div>

        <div class="form-group">
          <label for="seedbox-series-dir">Series directory</label>
          <input
            id="seedbox-series-dir"
            v-model.trim="form.mediaImport.seriesDirectory"
            type="text"
            placeholder="/downloads/finished/tv"
          >
        </div>
      </div>

      <div class="toggles">
        <div class="setting-row">
          <label class="checkbox-container">
            Enabled
            <input
              v-model="form.enabled"
              type="checkbox"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Disabled seedboxes are kept but never contacted.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Secure connection
            <input
              v-model="form.storageDriverOptions.secure"
              type="checkbox"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Verify TLS when connecting to this host.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Automatic import
            <input
              v-model="form.automaticImport"
              type="checkbox"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Import media found in the directories above without being asked.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Delete on import
            <input
              v-model="form.deleteOnImport"
              type="checkbox"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Remove files from the seedbox once they have been imported.
          </p>
        </div>
      </div>
    </fieldset>
    <template #status>
      <SaveState :state="saveState" />
    </template>
    <template #footer>
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="saveState.status === 'busy'"
        @click="$emit('update:open', false)"
      >
        Cancel
      </button>
      <button
        :disabled="saveState.status === 'busy'"
        type="submit"
        class="btn btn-primary"
      >
        {{ isNew ? 'Add seedbox' : 'Save changes' }}
      </button>
    </template>
  </AppDialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import SaveState from '@/components/system/SaveState.vue'
import AppDialog from '@/components/system/AppDialog.vue'

const props = defineProps({
  saveState: { type: Object, default: () => ({ status: 'idle', message: '' }) },
  open: { type: Boolean, default: false },
  // null while adding a new seedbox.
  seedbox: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'save'])

function emptySeedbox () {
  return {
    name: '',
    storageDriver: 'ssh',
    storageDriverOptions: {
      host: '',
      username: '',
      password: '',
      secure: true
    },
    mediaImport: {
      movieDirectory: '',
      seriesDirectory: ''
    },
    automaticImport: true,
    deleteOnImport: false,
    enabled: true
  }
}

const form = reactive(emptySeedbox())
const errors = reactive({})

const isNew = computed(() => !props.seedbox)

watch(() => props.open, open => {
  if (!open) return

  const base = emptySeedbox()
  const source = props.seedbox || {}

  Object.assign(form, base, source, {
    storageDriver: source.storageDriver || base.storageDriver,
    storageDriverOptions: { ...base.storageDriverOptions, ...(source.storageDriverOptions || {}) },
    mediaImport: { ...base.mediaImport, ...(source.mediaImport || {}) }
  })

  delete errors.name
  delete errors.host
})

function submit () {
  if (props.saveState.status === 'busy') return
  errors.name = form.name ? '' : 'A name is required.'
  errors.host = form.storageDriverOptions.host ? '' : 'A host is required.'

  if (errors.name || errors.host) return

  // The parent owns persistence: it holds the full seedbox list that has to be
  // written back as one settings section.
  emit('save', JSON.parse(JSON.stringify(form)))
}
</script>

<style scoped lang="sass">
.toggles
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))
  gap: 4px 24px
  margin-top: 8px
  padding-top: 16px
  border-top: 1px solid var(--color-border)
</style>
