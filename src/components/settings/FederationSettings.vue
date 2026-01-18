<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #444;">Federation</h2>
      <p style="color: #ccc; margin-bottom: 20px;">
        Connect multiple Oblecto servers to share libraries and streaming capabilities.
      </p>
      
      <div class="setting-row">
        <label class="checkbox-container">
          Enable Federation
          <input type="checkbox" v-model="federation.enable" @change="saveSettings">
          <span class="checkmark"></span>
        </label>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label>Data Port</label>
          <input type="number" v-model.number="federation.dataPort" @change="saveSettings">
        </div>
        <div class="form-group">
          <label>Media Port</label>
          <input type="number" v-model.number="federation.mediaPort" @change="saveSettings">
        </div>
      </div>

      <div class="form-group">
        <label>Private Key Path</label>
        <input type="text" v-model="federation.key" @change="saveSettings" placeholder="/etc/oblecto/id_rsa">
        <p class="description" style="margin-left: 0">Path to the RSA private key for identity.</p>
      </div>

    </div>
  </div>
</template>

<script>
  import oblectoClient from '@/oblectoClient'

  export default {
    name: 'FederationSettings',
    data () {
      return {
        federation: {
            enable: false,
            dataPort: 9131,
            mediaPort: 9132,
            key: ''
        }
      }
    },
    async created () {
      this.refresh()
    },
    methods: {
      async refresh () {
        try {
          const config = await oblectoClient.settings.getAll()
          this.federation = config.federation || this.federation
        } catch (e) {
          console.error('Failed to load settings', e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to load settings' })
        }
      },
      async saveSettings () {
         try {
           await oblectoClient.settings.update({
              federation: this.federation
           })
           this.$notify({ type: 'success', title: 'Saved', text: 'Settings saved successfully' })
         } catch (e) {
           console.error('Failed to save settings', e)
           this.$notify({ type: 'error', title: 'Error', text: 'Failed to save settings' })
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
  color: #888
  font-size: 0.9em
  margin-top: 5px
  margin-left: 28px

.resize-grid
  display: flex
  gap: 20px
  margin-bottom: 10px
  
  .form-group
    flex: 1

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
    background-color: #333
    border: 1px solid #555
    border-radius: 3px

  &:hover input ~ .checkmark
    background-color: #444

  input:checked ~ .checkmark
    background-color: #2196F3
    border-color: #2196F3

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
