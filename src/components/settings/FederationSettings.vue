<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 class="settings-section-title">
        Federation
      </h2>
      <p class="settings-description">
        Connect multiple Oblecto servers to share libraries and streaming capabilities.
      </p>
      
      <div class="setting-row">
        <label class="checkbox-container">
          Enable Federation
          <input
            v-model="federation.enable"
            type="checkbox"
            @change="saveSettings"
          >
          <span class="checkmark" />
        </label>
      </div>

      <div class="resize-grid">
        <div class="form-group">
          <label>Data Port</label>
          <input
            v-model.number="federation.dataPort"
            type="number"
            @change="saveSettings"
          >
        </div>
        <div class="form-group">
          <label>Media Port</label>
          <input
            v-model.number="federation.mediaPort"
            type="number"
            @change="saveSettings"
          >
        </div>
      </div>

      <div class="form-group">
        <label>Private Key Path</label>
        <input
          v-model="federation.key"
          type="text"
          placeholder="/etc/oblecto/id_rsa"
          @change="saveSettings"
        >
        <p class="settings-description settings-description-tight">
          Path to the RSA private key for identity.
        </p>
      </div>
    </div>

    <AutosaveBar :state="save" />
  </div>
</template>

<script>
  import oblectoClient from '@/oblectoClient'
  import AutosaveBar from '@/components/settings/AutosaveBar.vue'
  import { createSaveState } from '@/composables/useSaveState'

  export default {
    name: 'FederationSettings',
    components: {
      AutosaveBar
    },
    data () {
      return {
        save: createSaveState(),
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
        await this.save.run(
          async () => {
            const config = await oblectoClient.settings.getAll()
            this.federation = config.federation || this.federation
          },
          { busy: 'Loading…', ok: '', error: 'Could not load federation settings' }
        )
      },
      async saveSettings () {
        await this.save.run(
          () => oblectoClient.settings.update({ federation: this.federation }),
          { error: 'Could not save federation settings' }
        )
      }
    }
  }
</script>
