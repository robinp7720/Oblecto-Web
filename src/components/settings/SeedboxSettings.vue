<template>
  <div class="wrapper">
    <fieldset
      class="settings-fields"
      :disabled="!ready || save.status === 'busy'"
    >
      <div
        v-if="status"
        class="settings-card"
      >
        <div class="settings-header-row">
          <h2 class="settings-title-plain">
            Import Status
          </h2>
          <button
            type="button"
            class="btn"
            @click="refreshStatus"
          >
            <font-awesome-icon icon="sync" /> Refresh
          </button>
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

      <div
        v-if="activeImports.length > 0 || importHistory.length > 0"
        class="settings-card"
      >
        <div class="settings-header-row">
          <h2 class="settings-title-plain">
            Transfers
          </h2>
          <button
            v-if="importHistory.length > 0"
            type="button"
            class="btn btn-secondary"
            @click="clearImportHistory"
          >
            Clear finished
          </button>
        </div>

        <p
          v-if="activeImports.length === 0"
          class="settings-description"
        >
          Nothing is transferring right now.
        </p>
        <div class="transfers-list">
          <div
            v-for="importItem in activeImports"
            :key="importItem.origin"
            class="transfer-item"
          >
            <div class="transfer-info">
              <span class="transfer-name">{{ importItem.origin }}</span>
              <span class="transfer-status">
                <span
                  v-if="importItem.event === 'import_error'"
                  class="error"
                >{{ importItem.error }}</span>
                <span v-else>{{ (importItem.progress * 100).toFixed(1) }}%</span>
              </span>
            </div>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{ width: (importItem.progress * 100) + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- Finished imports used to be announced with a toast and then lost.
           They stay here for the session instead, where someone watching an
           import is already looking. -->
        <ul
          v-if="importHistory.length > 0"
          class="import-history"
        >
          <li
            v-for="entry in importHistory"
            :key="`${entry.origin}-${entry.finishedAt}`"
            :class="entry.event === 'import_error' ? 'is-error' : 'is-done'"
          >
            <span class="history-origin">{{ entry.origin }}</span>
            <span class="history-detail">{{ entry.event === 'import_error' ? entry.error || 'Import failed' : 'Imported' }}</span>
          </li>
        </ul>
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
                type="button"
                class="btn"
                @click="triggerImport('movies')"
              >
                Import movies
              </button>
              <button
                type="button"
                class="btn"
                @click="triggerImport('tvshows')"
              >
                Import TV shows
              </button>
            </div>
          </div>
        </div>

        <div class="settings-card-actions">
          <SaveState :state="importStatus" />
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-header-row">
          <h2 class="settings-section-title">
            Configured Seedboxes
          </h2>
          <button
            type="button"
            class="btn"
            @click="openDialog()"
          >
            <font-awesome-icon icon="plus" /> Add seedbox
          </button>
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
                  <button
                    type="button"
                    title="Edit this seedbox"
                    :aria-label="`Edit ${seedbox.name || 'seedbox'}`"
                    @click="openDialog(index)"
                  >
                    <font-awesome-icon :icon="editIcon" />
                  </button>
                  <button
                    type="button"
                    title="Remove this seedbox"
                    :aria-label="`Remove ${seedbox.name || 'seedbox'}`"
                    @click="deleteSeedbox(index)"
                  >
                    <font-awesome-icon :icon="deleteIcon" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="settings-card-actions">
          <SaveState :state="save" />
        </div>
      </div>
    </fieldset>
    <button
      v-if="!ready && save.status === 'error'"
      class="btn"
      @click="refresh"
    >
      Retry loading seedboxes
    </button>
    <SeedboxDialog
      :save-state="save"
      :open="dialogIndex !== null"
      :seedbox="dialogSeedbox"
      @update:open="value => { if (!value) dialogIndex = null }"
      @save="applySeedbox"
    />
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
  import { mapActions, mapState } from 'pinia'
  import { useSeedboxStore } from '@/stores/seedbox'
  import SeedboxDialog from '@/components/modals/SeedboxDialog'
  import SaveState from '@/components/system/SaveState.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'

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
      FontAwesomeIcon,
      SeedboxDialog,
      SaveState
    },
    data () {
      return {
        ready: false,
        seedboxes: [],
        importSource: 'all',
        status: null,
        // Index of the seedbox being edited, -1 for a new one, null when closed.
        dialogIndex: null,
        save: createSaveState(),
        importStatus: createSaveState()
      }
    },
    computed: {
      ...mapState(useSeedboxStore, ['activeImports', 'importHistory']),
      dialogSeedbox () {
        return this.dialogIndex === null || this.dialogIndex < 0
          ? null
          : this.seedboxes[this.dialogIndex]
      },
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
      ...mapActions(useSeedboxStore, ['clearImportHistory']),
      async refresh () {
        this.ready = false
        await this.save.run(async () => {
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

          this.ready = true
          this.refreshStatus()
        }, { busy: 'Loading seedboxes…', ok: '', error: 'Could not load seedbox settings' })
      },
      async refreshStatus () {
        try {
          const status = await oblectoClient.status.getSeedboxStatus()
          if (status?.queue) this.status = status
        } catch (e) {
          console.error('Failed to get seedbox status', e)
        }
      },
      async saveSettings (next, labels = {}) {
        return this.save.run(
          () => oblectoClient.settings.updateSection('seedboxes', next),
          { error: 'Could not save seedbox settings', ...labels }
        )
      },
      openDialog (index = -1) {
        if (!this.ready || this.save.status === 'busy') return
        this.save.reset()
        this.dialogIndex = index
      },
      async applySeedbox (seedbox) {
        if (this.save.status === 'busy') return
        const index = this.dialogIndex
        const next = index >= 0
          ? this.seedboxes.map((entry, i) => (i === index ? seedbox : entry))
          : [...this.seedboxes, seedbox]
        const ok = await this.saveSettings(next, { ok: index >= 0 ? 'Seedbox updated' : 'Seedbox added' })
        if (ok) { this.seedboxes = next; this.dialogIndex = null }
      },
      async deleteSeedbox (index) {
        if (this.save.status === 'busy') return
        const seedbox = this.seedboxes[index]
        const label = seedbox.name || seedbox.storageDriverOptions.host || 'this seedbox'

        const confirmed = await confirm({
          title: `Remove ${label}?`,
          message: 'Oblecto stops connecting to this host. Files already imported stay in the library, and nothing on the seedbox is touched.',
          confirmLabel: 'Remove seedbox',
          destructive: true
        })

        if (!confirmed) return

        const next = this.seedboxes.filter((entry, i) => i !== index)

        const ok = await this.saveSettings(next, { busy: 'Removing…', ok: `Removed ${label}` })

        if (ok) this.seedboxes = next
      },
      async triggerImport (type) {
        const sourceLabel = this.importSource === 'all' ? 'all seedboxes' : this.importSource

        await this.importStatus.run(
          () => oblectoClient.system.triggerImport(this.importSource, type),
          {
            busy: 'Starting…',
            ok: `Import started from ${sourceLabel}. Progress appears under Transfers.`,
            error: 'Could not start this import'
          }
        )
      }
    }
  }
</script>

<style scoped lang="sass">
.import-history
  display: grid
  gap: 8px
  margin: 16px 0 0
  padding: 0
  list-style: none

  li
    display: flex
    justify-content: space-between
    gap: 12px
    padding: 8px 12px
    border-radius: var(--radius-sm)
    background: rgba(255, 255, 255, 0.03)
    font-size: 0.85rem

  .history-origin
    min-width: 0
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  .history-detail
    flex-shrink: 0
    color: var(--color-text-muted)

  .is-done .history-detail
    color: #6fce8c

  .is-error .history-detail
    color: #ff8f7a

.import-grid
  align-items: flex-end

.value
  padding: 10px 0
  color: var(--color-text)
  font-weight: 500

.transfers-list
  display: flex
  flex-direction: column
  gap: 15px
  margin-top: 15px

.transfer-item
  background: rgba(255, 255, 255, 0.03)
  padding: 12px
  border-radius: 8px
  border: 1px solid rgba(255, 255, 255, 0.05)

.transfer-info
  display: flex
  justify-content: space-between
  margin-bottom: 8px
  font-size: 0.9em

.transfer-name
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  max-width: 70%
  color: var(--color-text)

.transfer-status
  color: var(--color-text-muted)

  .error
    color: #ff4d4d

.progress-bar-bg
  height: 6px
  background: rgba(255, 255, 255, 0.1)
  border-radius: 999px
  overflow: hidden

.progress-bar-fill
  height: 100%
  background: var(--color-accent)
  transition: width 0.3s ease

  &.error
    background: #ff4d4d
</style>
