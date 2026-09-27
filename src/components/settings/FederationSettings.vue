<template>
  <div class="wrapper">
    <fieldset
      class="settings-fields"
      :disabled="!form.ready"
    >
      <div class="settings-card">
        <h2 class="settings-section-title">
          Federation
        </h2>
        <p class="settings-description">
          Connect multiple Oblecto servers to share libraries and streaming capabilities.
        </p>

        <div class="setting-row">
          <label class="checkbox-container">
            Enable federation
            <input
              id="setting-federation-enable"
              v-model="federation.enable"
              :aria-invalid="Boolean(form.fields['federation.enable'])"
              :aria-describedby="'setting-federation-enable-error'"
              type="checkbox"
              @change="saveField('federation.enable')"
            >
            <span class="checkmark" />
          </label>
        </div>

        <div class="resize-grid">
          <div class="form-group">
            <label for="setting-federation-dataPort">Data port</label>
            <input
              id="setting-federation-dataPort"
              v-model.number="federation.dataPort"
              :aria-invalid="Boolean(form.fields['federation.dataPort'])"
              :aria-describedby="'setting-federation-dataPort-error'"
              type="number"
              @change="checkSettings"
            >
            <p
              v-if="form.fields['federation.dataPort']"
              id="setting-federation-dataPort-error"
              class="form-error"
            >
              {{ form.fields['federation.dataPort'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-federation-mediaPort">Media port</label>
            <input
              id="setting-federation-mediaPort"
              v-model.number="federation.mediaPort"
              :aria-invalid="Boolean(form.fields['federation.mediaPort'])"
              :aria-describedby="'setting-federation-mediaPort-error'"
              type="number"
              @change="checkSettings"
            >
            <p
              v-if="form.fields['federation.mediaPort']"
              id="setting-federation-mediaPort-error"
              class="form-error"
            >
              {{ form.fields['federation.mediaPort'] }}
            </p>
          </div>
        </div>

        <div class="form-group">
          <label for="setting-federation-key">Private key path</label>
          <input
            id="setting-federation-key"
            v-model="federation.key"
            :aria-invalid="Boolean(form.fields['federation.key'])"
            :aria-describedby="'setting-federation-key-error'"
            type="text"
            placeholder="/etc/oblecto/id_rsa"
            @change="checkSettings"
          >
          <p
            v-if="form.fields['federation.key']"
            id="setting-federation-key-error"
            class="form-error"
          >
            {{ form.fields['federation.key'] }}
          </p>
          <p class="settings-description settings-description-tight">
            Path to the RSA private key for identity.
          </p>
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
  </div>
</template>

<script>
  import SettingsFormStatus from '@/components/settings/SettingsFormStatus.vue'
  import { settingsForm } from '@/composables/settingsForm'
  import { createSaveState } from '@/composables/useSaveState'

  export default {
    name: 'FederationSettings',
    components: {
      SettingsFormStatus
    },
    mixins: [settingsForm({ federation: 'federation' })],
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
      async refresh () { await this.loadSettings() }

    }
  }
</script>
