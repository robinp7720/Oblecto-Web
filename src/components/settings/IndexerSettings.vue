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
        <p class="description">
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
        <p class="description">
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
        <p class="description">
          Calculate MD5 hashes for files to detect duplicates and changes. (Slower)
        </p>
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Video Filetypes
        </h2>
        <a
          class="btn"
          @click="filetypeAdd('video')"
        >
          <font-awesome-icon icon="plus" /> Add Filetype
        </a>
      </div>
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
        try {
          const config = await oblectoClient.settings.getAll()
          this.videoFiletypes = config.fileExtensions?.video || []
          this.indexer = config.indexer || { runAtBoot: false }
          this.cleaner = config.cleaner || { runAtBoot: false }
          this.files = config.files || { doHash: false }
        } catch (e) {
          console.error('Failed to load settings', e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to load settings' })
        }
      },
      async saveSettings () {
         try {
           await oblectoClient.settings.update({
              indexer: this.indexer,
              cleaner: this.cleaner,
              files: this.files
           })
           this.$notify({ type: 'success', title: 'Saved', text: 'Settings saved successfully' })
         } catch (e) {
           console.error('Failed to save settings', e)
           this.$notify({ type: 'error', title: 'Error', text: 'Failed to save settings' })
         }
      },
      async filetypeAdd (type) {
        // TODO: Replace with a proper modal later
        const ext = prompt("Enter new file extension (e.g. .mkv):")
        if (ext) {
          let currentList = [...this.videoFiletypes]
          if (!currentList.includes(ext)) {
             currentList.push(ext)
             await this.updateFiletypes(currentList)
             this.$notify({ type: 'success', title: 'Success', text: 'Filetype added' })
          }
        }
      },
      async deleteFiletype (filetype, type) {
        if(confirm(`Are you sure you want to remove ${filetype}?`)) {
           let currentList = this.videoFiletypes.filter(f => f !== filetype)
           await this.updateFiletypes(currentList)
           this.$notify({ type: 'success', title: 'Success', text: 'Filetype removed' })
        }
      },
      async updateFiletypes(videoList) {
          // Update the specific section
          await oblectoClient.settings.updateSection('fileExtensions', {
             video: videoList
          })
          this.refresh()
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

/* Simple Checkbox Styling */
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
