<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 class="settings-section-title">
        Problematic Files
      </h2>
      <p
        v-if="files.length === 0"
        class="settings-empty"
      >
        No problematic files found.
      </p>

      <div
        v-else
        class="settings-table-scroll"
      >
        <table class="settings-table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Error</th>
              <th width="120">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="file in files"
              :key="file.id"
            >
              <td class="settings-table-cell-wrap">
                {{ file.path }}
              </td>
              <td>
                <div class="error-msg">
                  {{ file.error }}
                </div>
              </td>
              <td class="actions">
                <button
                  type="button"
                  title="Retry indexing this file"
                  :aria-label="`Retry indexing ${file.path}`"
                  :disabled="file.retrying"
                  @click="retryFile(file)"
                >
                  <font-awesome-icon
                    icon="sync"
                    :spin="file.retrying"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-card-actions">
        <SaveState :state="status" />
      </div>
    </div>
  </div>
</template>

<script>
import oblectoClient from '@/oblectoClient'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faSync from '@fortawesome/fontawesome-free-solid/faSync'
import fontawesome from '@fortawesome/fontawesome'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'

fontawesome.library.add(faSync)

export default {
  name: 'ProblematicFiles',
  components: {
    FontAwesomeIcon,
    SaveState
  },
  data() {
    return {
      files: [],
      status: createSaveState()
    }
  },
  async created() {
    await this.refresh()
  },
  methods: {
    async refresh () {
      // An empty `ok` keeps a successful load silent; only failure is news.
      await this.status.run(
        async () => {
          const files = await oblectoClient.files.getProblematic()
          this.files = files.map(f => ({ ...f, retrying: false }))
        },
        { busy: 'Loading…', ok: '', error: 'Could not load problematic files' }
      )
    },
    async retryFile (file) {
      if (file.retrying) return

      file.retrying = true

      const ok = await this.status.run(
        () => oblectoClient.files.retryFile(file.id),
        {
          busy: 'Scheduling retry…',
          ok: `Retry scheduled for ${file.path}`,
          error: 'Could not schedule this retry'
        }
      )

      if (ok) {
        this.files = this.files.filter(f => f.id !== file.id)
      } else {
        file.retrying = false
      }
    }
  }
}
</script>

<style scoped lang="sass">
.error-msg
  color: #ffb4a7
  font-size: 0.9em
  white-space: pre-wrap
  max-height: 100px
  overflow-y: auto
  background: rgba(255, 255, 255, 0.08)
  padding: 5px
  border-radius: 10px
</style>
