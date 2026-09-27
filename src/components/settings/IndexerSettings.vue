<template>
  <div class="wrapper">
    <fieldset
      class="settings-fields"
      :disabled="!form.ready"
    >
      <div class="settings-card">
        <h2 class="settings-section-title">
          General configuration
        </h2>

        <div class="setting-row">
          <label class="checkbox-container">
            Run indexer on startup
            <input
              id="setting-indexer-runAtBoot"
              v-model="indexer.runAtBoot"
              :aria-invalid="Boolean(form.fields['indexer.runAtBoot'])"
              :aria-describedby="'setting-indexer-runAtBoot-error'"
              type="checkbox"
              @change="saveField('indexer.runAtBoot')"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Automatically scan for new files when the server starts.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Run cleaner on startup
            <input
              id="setting-cleaner-runAtBoot"
              v-model="cleaner.runAtBoot"
              :aria-invalid="Boolean(form.fields['cleaner.runAtBoot'])"
              :aria-describedby="'setting-cleaner-runAtBoot-error'"
              type="checkbox"
              @change="saveField('cleaner.runAtBoot')"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Automatically check for removed files when the server starts.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Calculate file hashes
            <input
              id="setting-files-doHash"
              v-model="files.doHash"
              :aria-invalid="Boolean(form.fields['files.doHash'])"
              :aria-describedby="'setting-files-doHash-error'"
              type="checkbox"
              @change="saveField('files.doHash')"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Calculate MD5 hashes for files to detect duplicates and changes. (Slower)
          </p>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-header-row">
          <h2 class="settings-title-plain">
            Video file types
          </h2>
          <button
            id="setting-video-extensions"
            type="button"
            class="btn"
            @click="openFiletypeDialog"
          >
            <font-awesome-icon icon="plus" /> Add file type
          </button>
        </div>
        <p class="settings-description">
          Only files with one of these extensions are picked up by a scan.
        </p>
        <div class="settings-table-scroll">
          <table class="settings-table">
            <thead>
              <tr>
                <th width="50">
                  #
                </th>
                <th>Filetype</th>
                <th width="100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="videoFiletypes.length === 0">
                <td
                  colspan="3"
                  class="settings-table-center"
                >
                  No video filetypes configured.
                </td>
              </tr>
              <tr
                v-for="(filetype, index) in videoFiletypes"
                :key="index"
              >
                <td class="id">
                  {{ index + 1 }}
                </td>
                <td>{{ filetype }}</td>
                <td class="actions">
                  <button
                    type="button"
                    title="Remove this filetype"
                    :aria-label="`Remove .${filetype}`"
                    @click="deleteFiletype(filetype)"
                  >
                    <FontAwesomeIcon :icon="deleteIcon" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </fieldset>
    <SettingsFormStatus
      :state="save"
      :form="form"
      :dirty="settingsDirty"
      @retry="retrySettings"
      @revert="revertSettings"
      @save="saveSettings()"
    />

    <AppDialog
      v-model:open="showFiletypeDialog"
      title="Add video filetype"
      subtitle="Extensions are stored without a leading dot and matched case-insensitively."
      size="sm"
      @submit="addFiletype"
    >
      <div
        class="form-group"
        :class="{ 'is-invalid': Boolean(filetypeError) }"
      >
        <label for="new-filetype">Extension</label>
        <input
          id="new-filetype"
          v-model="newFiletype"
          type="text"
          placeholder="mkv"
          autocapitalize="off"
          spellcheck="false"
        >
        <p
          v-if="filetypeError"
          class="form-hint form-error"
        >
          {{ filetypeError }}
        </p>
      </div>

      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="showFiletypeDialog = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
        >
          Add file type
        </button>
      </template>
    </AppDialog>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import fontawesome from '@fortawesome/fontawesome'
  import SettingsFormStatus from '@/components/settings/SettingsFormStatus.vue'
  import { settingsForm } from '@/composables/settingsForm'
  import AppDialog from '@/components/system/AppDialog.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'

  fontawesome.library.add(faPlus, faTrash)

  export default {
    name: 'IndexerSettings',
    components: {
      SettingsFormStatus,
      AppDialog,
      FontAwesomeIcon
    },
    mixins: [settingsForm({ indexer: 'indexer', cleaner: 'cleaner', files: 'files', extensions: 'fileExtensions' })],
    data () {
      return {
        save: createSaveState(),
        showFiletypeDialog: false,
        newFiletype: '',
        filetypeError: '',
        extensions: { video: [] },
        indexer: { runAtBoot: false },
        cleaner: { runAtBoot: false },
        files: { doHash: false }
      }
    },
    computed: {
      videoFiletypes () { return this.extensions.video },
      deleteIcon () {
        return faTrash
      }
    },
    async created () {
      this.refresh()
    },
    methods: {
      async refresh () { await this.loadSettings() },
      openFiletypeDialog () {
        this.newFiletype = ''
        this.filetypeError = ''
        this.showFiletypeDialog = true
      },
      async addFiletype () {
        // Normalised here so ".MKV", "MKV" and ".mkv" cannot all end up in the
        // list as separate entries.
        const ext = this.newFiletype.trim().toLowerCase().replace(/^\.+/, '')

        if (!ext) {
          this.filetypeError = 'Enter a file extension, for example mkv.'
          return
        }

        if (this.videoFiletypes.includes(ext)) {
          this.filetypeError = `${ext} is already in the list.`
          return
        }

        this.filetypeError = ''

        const ok = await this.updateFiletypes([...this.videoFiletypes, ext], {
          busy: 'Adding…',
          ok: `Added .${ext}`,
          error: `Could not add .${ext}`
        })

        if (ok) this.showFiletypeDialog = false
      },
      async deleteFiletype (filetype) {
        const confirmed = await confirm({
          title: `Stop indexing .${filetype} files?`,
          message: 'Existing entries stay in the library, but files with this extension are skipped by future scans.',
          confirmLabel: 'Remove extension',
          destructive: true
        })

        if (!confirmed) return

        await this.updateFiletypes(
          this.videoFiletypes.filter(f => f !== filetype),
          { busy: 'Removing…', ok: `Removed .${filetype}`, error: `Could not remove .${filetype}` }
        )
      },
      async updateFiletypes (videoList) {
        this.extensions.video = videoList
        await this.saveField('fileExtensions.video')
        return this.save.status !== 'error'
      }

    }
  }
</script>
