<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 class="settings-section-title">
        General Configuration
      </h2>
      
      <div class="setting-row">
        <label class="checkbox-container">
          Run Indexer on Startup
          <input
            v-model="indexer.runAtBoot"
            type="checkbox"
            @change="saveSettings"
          >
          <span class="checkmark" />
        </label>
        <p class="checkbox-description">
          Automatically scan for new files when the server starts.
        </p>
      </div>

      <div class="setting-row">
        <label class="checkbox-container">
          Run Cleaner on Startup
          <input
            v-model="cleaner.runAtBoot"
            type="checkbox"
            @change="saveSettings"
          >
          <span class="checkmark" />
        </label>
        <p class="checkbox-description">
          Automatically check for removed files when the server starts.
        </p>
      </div>

      <div class="setting-row">
        <label class="checkbox-container">
          Calculate File Hashes
          <input
            v-model="files.doHash"
            type="checkbox"
            @change="saveSettings"
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
          Video Filetypes
        </h2>
        <button
          type="button"
          class="btn"
          @click="openFiletypeDialog"
        >
          <font-awesome-icon icon="plus" /> Add filetype
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

    <AutosaveBar :state="save" />

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
          Add filetype
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
  import oblectoClient from '@/oblectoClient'
  import AutosaveBar from '@/components/settings/AutosaveBar.vue'
  import AppDialog from '@/components/system/AppDialog.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'

  fontawesome.library.add(faPlus, faTrash)

  export default {
    name: 'IndexerSettings',
    components: {
      AutosaveBar,
      AppDialog,
      FontAwesomeIcon
    },
    data () {
      return {
        save: createSaveState(),
        showFiletypeDialog: false,
        newFiletype: '',
        filetypeError: '',
        videoFiletypes: [],
        indexer: { runAtBoot: false },
        cleaner: { runAtBoot: false },
        files: { doHash: false }
      }
    },
    computed: {
      deleteIcon () {
        return faTrash
      }
    },
    async created () {
      this.refresh()
    },
    methods: {
      async refresh () {
        await this.save.run(
          async () => {
            const config = await oblectoClient.settings.getAll()
            this.videoFiletypes = config.fileExtensions?.video || []
            this.indexer = config.indexer || { runAtBoot: false }
            this.cleaner = config.cleaner || { runAtBoot: false }
            this.files = config.files || { doHash: false }
          },
          { busy: 'Loading…', ok: '', error: 'Could not load indexer settings' }
        )
      },
      async saveSettings () {
        await this.save.run(
          () => oblectoClient.settings.update({
            indexer: this.indexer,
            cleaner: this.cleaner,
            files: this.files
          }),
          { error: 'Could not save indexer settings' }
        )
      },
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
      async updateFiletypes (videoList, labels) {
        const ok = await this.save.run(
          () => oblectoClient.settings.updateSection('fileExtensions', { video: videoList }),
          labels
        )

        if (ok) this.videoFiletypes = videoList

        return ok
      }
    }
  }
</script>
