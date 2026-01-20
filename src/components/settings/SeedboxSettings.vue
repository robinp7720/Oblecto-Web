<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 class="settings-section-title">
        Seedbox Setup
      </h2>
      <p class="settings-description">
        Configure remote seedboxes for automated downloads and media imports.
      </p>
      <p class="description settings-description settings-description-tight">
        Each seedbox can be enabled individually, with its own import rules.
      </p>
    </div>

    <div
      v-if="status"
      class="settings-card"
    >
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Import Status
        </h2>
        <a
          class="btn"
          @click="refreshStatus"
        >
          <font-awesome-icon icon="sync" /> Refresh
        </a>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label>Queue State</label>
          <div class="value">
            {{ status.queue.idle ? 'Idle' : 'Running' }}
          </div>
        </div>
        <div class="form-group">
          <label>Items in Queue</label>
          <div class="value">
            {{ status.queue.length }}
          </div>
        </div>
        <div class="form-group">
          <label>Active Imports</label>
          <div class="value">
            {{ status.queue.running }}
          </div>
        </div>
      </div>
    </div>



    <div class="settings-card">
      <h2 class="settings-section-title">
        Manual Import
      </h2>
      <p class="settings-description">
        Trigger a one-time import from a specific seedbox or all seedboxes.
      </p>
      <div class="resize-grid import-grid">
        <div class="form-group">
          <label>Source</label>
          <select v-model="importSource">
            <option value="all">
              All seedboxes
            </option>
            <option
              v-for="(seedbox, index) in seedboxes"
              :key="`import-${seedbox.name || seedbox.storageDriverOptions.host || index}`"
              :value="seedbox.name || String(index)"
            >
              {{ seedbox.name || seedbox.storageDriverOptions.host || `Seedbox ${index + 1}` }}
            </option>
          </select>
        </div>
        <div class="form-group import-actions">
          <label>Import Type</label>
          <div class="actions-group">
            <button
              class="btn"
              @click="triggerImport('movies')"
            >
              Import Movies
            </button>
            <button
              class="btn"
              @click="triggerImport('tvshows')"
            >
              Import TV Shows
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-section-title">
          Configured Seedboxes
        </h2>
        <a
          class="btn"
          @click="openDialog()"
        >
          <font-awesome-icon icon="plus" /> New Seedbox
        </a>
      </div>

      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th width="50">
                #
              </th>
              <th>Name</th>
              <th>Host</th>
              <th>Driver</th>
              <th>Movie Dir</th>
              <th>Series Dir</th>
              <th>Status</th>
              <th width="120">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="seedboxes.length === 0">
              <td
                colspan="8"
                class="settings-table-center"
              >
                No seedboxes configured.
              </td>
            </tr>
            <tr
              v-for="(seedbox, index) in seedboxes"
              :key="seedbox.id || index"
            >
              <td class="id">
                {{ index + 1 }}
              </td>
              <td>{{ seedbox.name || 'Untitled' }}</td>
              <td>{{ seedbox.storageDriverOptions.host || '-' }}</td>
              <td>{{ (seedbox.storageDriver || 'ssh').toUpperCase() }}</td>
              <td>{{ seedbox.mediaImport.movieDirectory || '-' }}</td>
              <td>{{ seedbox.mediaImport.seriesDirectory || '-' }}</td>
              <td>{{ seedbox.enabled ? 'Enabled' : 'Disabled' }}</td>
              <td class="actions">
                <a
                  title="Edit seedbox"
                  @click="editSeedbox(index)"
                >
                  <font-awesome-icon :icon="editIcon" />
                </a>
                <a
                  title="Remove seedbox"
                  @click="deleteSeedbox(index)"
                >
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
  import faSync from '@fortawesome/fontawesome-free-solid/faSync'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faPlus, faTrash, faEdit, faSync)

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
        importSource: 'all',
        status: null
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

          this.refreshStatus()
        } catch (e) {
          console.error('Failed to load seedbox settings', e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to load seedbox settings' })
        }
      },
      async refreshStatus () {
        try {
          this.status = await oblectoClient.status.getSeedboxStatus()
        } catch (e) {
          console.error('Failed to get seedbox status', e)
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
      openDialog (index = null) {
        const seedbox = index !== null ? this.seedboxes[index] : null
        this.$modal.show('SeedboxDialog', {
          seedbox,
          callback: async (newSeedbox) => {
            if (index !== null) {
              this.$set(this.seedboxes, index, newSeedbox)
            } else {
              this.seedboxes.push(newSeedbox)
            }
            await this.saveSettings()
          }
        })
      },
      editSeedbox (index) {
        this.openDialog(index)
      },
      async deleteSeedbox (index) {
        const seedbox = this.seedboxes[index]
        if (!confirm(`Remove seedbox "${seedbox.name || seedbox.storageDriverOptions.host}"?`)) {
          return
        }
        this.seedboxes.splice(index, 1)
        await this.saveSettings()
      },
      async triggerImport (type) {
        try {
          await oblectoClient.system.triggerImport(this.importSource, type)
          const sourceLabel = this.importSource === 'all' ? 'all seedboxes' : this.importSource
          this.$notify({
            group: 'system',
            title: 'Import started',
            text: `Importing ${type} from ${sourceLabel}.`,
            type: 'success'
          })
        } catch (e) {
          console.error('Failed to trigger import', e)
          this.$notify({
            group: 'system',
            title: 'Error',
            text: 'Failed to start seedbox import.',
            type: 'error'
          })
        }
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

.import-grid
  align-items: flex-end

.actions-group
  display: flex
  flex-wrap: wrap
  gap: 10px

  button
    margin: 0 !important
    display: inline-flex
    align-items: center
    gap: 8px

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

.value
  padding: 10px 0
  color: var(--color-text)
  font-weight: 500
</style>
