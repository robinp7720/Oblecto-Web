<template>
  <div class="wrapper">
    <div class="settings-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <h2 style="margin: 0; border: none; padding: 0;">Video Filetypes</h2>
        <a class="btn" @click="filetypeAdd('video')">
          <font-awesome-icon icon="plus" /> Add Filetype
        </a>
      </div>
      <table class="settings-table">
        <thead>
          <tr>
            <th width="50">#</th>
            <th>Filetype</th>
            <th width="100">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="videoFiletypes.length === 0">
            <td colspan="3" style="text-align: center; color: #999;">No video filetypes configured.</td>
          </tr>
          <tr v-for="(filetype, index) in videoFiletypes" :key="index">
            <td class="id">{{ index + 1 }}</td>
            <td>{{ filetype }}</td>
            <td class="actions">
              <a
                title="Remove filetype"
                @click="deleteFiletype(filetype, 'video')"
              >
                <FontAwesomeIcon :icon="deleteIcon" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faPlus, faTrash)

  export default {
    name: 'IndexerSettings',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        videoFiletypes: []
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
        let config = (await oblectoClient.axios.get(`/api/v1/settings/fileExtensions`)).data
        this.videoFiletypes = config.video || []
      },
      async filetypeAdd (type) {
        // TODO: Replace with a proper modal later
        const ext = prompt("Enter new file extension (e.g. .mkv):")
        if (ext) {
          let currentList = [...this.videoFiletypes]
          if (!currentList.includes(ext)) {
             currentList.push(ext)
             await this.updateConfig(currentList)
             this.$notify({ type: 'success', title: 'Success', text: 'Filetype added' })
          }
        }
      },
      async deleteFiletype (filetype, type) {
        if(confirm(`Are you sure you want to remove ${filetype}?`)) {
           let currentList = this.videoFiletypes.filter(f => f !== filetype)
           await this.updateConfig(currentList)
           this.$notify({ type: 'success', title: 'Success', text: 'Filetype removed' })
        }
      },
      async updateConfig(videoList) {
          // Update the specific section
          await oblectoClient.axios.patch(`/api/v1/settings/fileExtensions`, {
             video: videoList
          })
          this.refresh()
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"
</style>