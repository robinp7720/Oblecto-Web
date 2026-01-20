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
                <a
                  class="btn-icon"
                  title="Retry Indexing"
                  @click="retryFile(file)"
                >
                  <font-awesome-icon
                    icon="sync"
                    :spin="file.retrying"
                  />
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
import oblectoClient from '@/oblectoClient'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faSync from '@fortawesome/fontawesome-free-solid/faSync'
import fontawesome from '@fortawesome/fontawesome'

fontawesome.library.add(faSync)

export default {
  name: 'ProblematicFiles',
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      files: []
    }
  },
  async created() {
    await this.refresh()
  },
  methods: {
    async refresh() {
      try {
        const files = await oblectoClient.files.getProblematic()
        this.files = files.map(f => ({...f, retrying: false}))
      } catch (e) {
        console.error('Failed to load problematic files', e)
        this.$notify({ type: 'error', title: 'Error', text: 'Failed to load files' })
      }
    },
    async retryFile(file) {
      if (file.retrying) return;
      
      file.retrying = true;
      try {
        await oblectoClient.files.retryFile(file.id);
        this.$notify({ type: 'success', title: 'Success', text: 'Retry scheduled' });
        
        // Remove from list
        this.files = this.files.filter(f => f.id !== file.id);
        
      } catch (e) {
        console.error('Retry failed', e);
        this.$notify({ type: 'error', title: 'Error', text: 'Retry request failed' });
        file.retrying = false;
      }
    }
  }
}
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"

.error-msg
  color: #ffb4a7
  font-size: 0.9em
  white-space: pre-wrap
  max-height: 100px
  overflow-y: auto
  background: rgba(255, 255, 255, 0.08)
  padding: 5px
  border-radius: 10px

.btn-icon
  cursor: pointer
  color: var(--color-text-muted)
  font-size: 1.2em
  &:hover
    color: var(--color-text)
</style>
