<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 class="settings-section-title">Seedbox Setup</h2>
      <p class="settings-description">
        Configure remote seedboxes for automated downloads and media imports.
      </p>
      <p class="description settings-description settings-description-tight">
        Each seedbox can be enabled individually, with its own import rules.
      </p>
    </div>

    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">Seedbox Connections</h2>
        <a class="btn" @click="resetForm">
          <font-awesome-icon icon="plus" /> New Seedbox
        </a>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label>Name</label>
          <input type="text" v-model="seedboxForm.name" placeholder="My Seedbox">
        </div>
        <div class="form-group">
          <label>Storage Driver</label>
          <select v-model="seedboxForm.storageDriver">
            <option value="ssh">SSH</option>
            <option value="ftp">FTP</option>
            <option value="ftps">FTPS</option>
          </select>
        </div>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label>Host</label>
          <input type="text" v-model="seedboxForm.storageDriverOptions.host" placeholder="seedbox.example.com">
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="seedboxForm.storageDriverOptions.username" placeholder="seeduser">
        </div>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="seedboxForm.storageDriverOptions.password" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label>Secure Connection</label>
          <label class="checkbox-container">
            Use Secure Connection
            <input type="checkbox" v-model="seedboxForm.storageDriverOptions.secure">
            <span class="checkmark"></span>
          </label>
        </div>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label>Movie Directory</label>
          <input type="text" v-model="seedboxForm.mediaImport.movieDirectory" placeholder="/downloads/finished/movie">
        </div>
        <div class="form-group">
          <label>Series Directory</label>
          <input type="text" v-model="seedboxForm.mediaImport.seriesDirectory" placeholder="/downloads/finished/tv">
        </div>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label class="checkbox-container">
            Automatic Import
            <input type="checkbox" v-model="seedboxForm.automaticImport">
            <span class="checkmark"></span>
          </label>
          <p class="description">Automatically import media found in the seedbox directories.</p>
        </div>
        <div class="form-group">
          <label class="checkbox-container">
            Delete On Import
            <input type="checkbox" v-model="seedboxForm.deleteOnImport">
            <span class="checkmark"></span>
          </label>
          <p class="description">Remove files from the seedbox after import completes.</p>
        </div>
      </div>

      <div class="setting-row">
        <label class="checkbox-container">
          Enabled
          <input type="checkbox" v-model="seedboxForm.enabled">
          <span class="checkmark"></span>
        </label>
      </div>

      <div class="form-actions">
        <a class="btn" @click="saveSeedbox">
          {{ editingIndex === null ? 'Add Seedbox' : 'Save Changes' }}
        </a>
        <a class="btn btn-secondary" v-if="editingIndex !== null" @click="resetForm">
          Cancel
        </a>
      </div>
    </div>

    <div class="settings-card">
      <h2 class="settings-section-title">Configured Seedboxes</h2>

      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th width="50">#</th>
              <th>Name</th>
              <th>Host</th>
              <th>Driver</th>
              <th>Movie Dir</th>
              <th>Series Dir</th>
              <th>Status</th>
              <th width="120">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="seedboxes.length === 0">
              <td colspan="8" class="settings-table-center">No seedboxes configured.</td>
            </tr>
            <tr v-for="(seedbox, index) in seedboxes" :key="seedbox.id || index">
              <td class="id">{{ index + 1 }}</td>
              <td>{{ seedbox.name || 'Untitled' }}</td>
              <td>{{ seedbox.storageDriverOptions.host || '-' }}</td>
              <td>{{ (seedbox.storageDriver || 'ssh').toUpperCase() }}</td>
              <td>{{ seedbox.mediaImport.movieDirectory || '-' }}</td>
              <td>{{ seedbox.mediaImport.seriesDirectory || '-' }}</td>
              <td>{{ seedbox.enabled ? 'Enabled' : 'Disabled' }}</td>
              <td class="actions">
                <a title="Edit seedbox" @click="editSeedbox(index)">
                  <font-awesome-icon :icon="editIcon" />
                </a>
                <a title="Remove seedbox" @click="deleteSeedbox(index)">
                  <font-awesome-icon :icon="deleteIcon" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import faEdit from '@fortawesome/fontawesome-free-solid/faEdit'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faPlus, faTrash, faEdit)

  const emptySeedbox = () => ({
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
  })

  export default {
    name: 'SeedboxSettings',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        seedboxes: [],
        seedboxForm: emptySeedbox(),
        editingIndex: null
      }
    },
    computed: {
      deleteIcon () {
        return faTrash
      },
      editIcon () {
        return faEdit
      }
    },
    async created () {
      this.refresh()
    },
    methods: {
      async refresh () {
        try {
          const config = await oblectoClient.settings.getSection('seedboxes')
          const seedboxList = Array.isArray(config)
            ? config
            : (config?.seedboxes || config?.items || [])

          this.seedboxes = seedboxList.map(seedbox => ({
            ...emptySeedbox(),
            ...seedbox,
            storageDriver: seedbox?.storageDriver || 'ssh',
            storageDriverOptions: {
              ...emptySeedbox().storageDriverOptions,
              ...(seedbox?.storageDriverOptions || {})
            },
            mediaImport: {
              ...emptySeedbox().mediaImport,
              ...(seedbox?.mediaImport || {})
            }
          }))
        } catch (e) {
          console.error('Failed to load seedbox settings', e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to load seedbox settings' })
        }
      },
      async saveSettings () {
        try {
          await oblectoClient.settings.updateSection('seedboxes', this.seedboxes)
          this.$notify({ type: 'success', title: 'Saved', text: 'Seedbox settings saved successfully' })
        } catch (e) {
          console.error('Failed to save seedbox settings', e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to save seedbox settings' })
        }
      },
      async saveSeedbox () {
        if (!this.seedboxForm.name || !this.seedboxForm.storageDriverOptions.host) {
          this.$notify({ type: 'error', title: 'Missing info', text: 'Name and host are required.' })
          return
        }

        const entry = {
          ...emptySeedbox(),
          ...this.seedboxForm,
          storageDriverOptions: {
            ...emptySeedbox().storageDriverOptions,
            ...(this.seedboxForm.storageDriverOptions || {})
          },
          mediaImport: {
            ...emptySeedbox().mediaImport,
            ...(this.seedboxForm.mediaImport || {})
          }
        }

        if (this.editingIndex === null) {
          this.seedboxes.push(entry)
        } else {
          this.$set(this.seedboxes, this.editingIndex, entry)
        }

        this.resetForm()
        await this.saveSettings()
      },
      editSeedbox (index) {
        const seedbox = this.seedboxes[index]
        this.seedboxForm = {
          ...emptySeedbox(),
          ...seedbox
        }
        this.editingIndex = index
      },
      async deleteSeedbox (index) {
        const seedbox = this.seedboxes[index]
        if (!confirm(`Remove seedbox "${seedbox.name || seedbox.storageDriverOptions.host}"?`)) {
          return
        }
        this.seedboxes.splice(index, 1)
        await this.saveSettings()
      },
      resetForm () {
        this.seedboxForm = emptySeedbox()
        this.editingIndex = null
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"

.setting-row
  margin-bottom: 20px

.description
  color: var(--color-text-muted)
  font-size: 0.9em
  margin-top: 5px
  margin-left: 28px

.resize-grid
  display: flex
  gap: 20px
  margin-bottom: 10px

  .form-group
    flex: 1

.form-actions
  display: flex
  gap: 10px

.checkbox-container
  display: block
  position: relative
  padding-left: 30px
  margin-bottom: 5px
  cursor: pointer
  font-size: 16px
  user-select: none

  input
    position: absolute
    opacity: 0
    cursor: pointer
    height: 0
    width: 0

  .checkmark
    position: absolute
    top: 2px
    left: 0
    height: 18px
    width: 18px
    background-color: rgba(255, 255, 255, 0.08)
    border: 1px solid var(--color-border)
    border-radius: 6px

  &:hover input ~ .checkmark
    background-color: rgba(255, 255, 255, 0.16)

  input:checked ~ .checkmark
    background-color: var(--color-accent)
    border-color: var(--color-accent)

  input:checked ~ .checkmark:after
    display: block

  .checkmark:after
    content: ""
    position: absolute
    display: none
    left: 6px
    top: 2px
    width: 3px
    height: 8px
    border: solid white
    border-width: 0 2px 2px 0
    transform: rotate(45deg)
</style>
