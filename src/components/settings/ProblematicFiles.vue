<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #444;">Problematic Files</h2>
      <p v-if="files.length === 0" style="color: #999; text-align: center;">No problematic files found.</p>
      
      <table v-else class="settings-table">
        <thead>
          <tr>
            <th>Path</th>
            <th>Error</th>
            <th width="120">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in files" :key="file.id">
            <td style="word-break: break-all; max-width: 300px;">{{ file.path }}</td>
            <td>
               <div class="error-msg">
                  {{ file.error }}
               </div>
            </td>
            <td class="actions">
              <a class="btn-icon" @click="retryFile(file)" title="Retry Indexing">
                 <font-awesome-icon icon="sync" :spin="file.retrying" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
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
        const res = await oblectoClient.axios.get('/files/problematic')
        this.files = res.data.map(f => ({...f, retrying: false}))
      } catch (e) {
        console.error('Failed to load problematic files', e)
        this.$notify({ type: 'error', title: 'Error', text: 'Failed to load files' })
      }
    },
    async retryFile(file) {
      if (file.retrying) return;
      
      file.retrying = true;
      try {
        await oblectoClient.axios.post(`/files/${file.id}/retry`);
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
  color: #ff6b6b
  font-size: 0.9em
  white-space: pre-wrap
  max-height: 100px
  overflow-y: auto
  background: rgba(0,0,0,0.2)
  padding: 5px
  border-radius: 3px

.btn-icon
  cursor: pointer
  color: #ccc
  font-size: 1.2em
  &:hover
    color: #fff
</style>