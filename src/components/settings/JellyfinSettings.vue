<template>
  <div class="wrapper">
    <fieldset
      class="settings-fields"
      :disabled="!form.ready"
    >
      <div class="settings-card">
        <h2 class="settings-section-title">
          Connection
        </h2>
        <p class="settings-description">
          Jellyfin apps on phones, TVs and computers can sign in to Oblecto and play from it. Changes to these take effect after a server restart.
        </p>

        <div class="setting-row">
          <label class="checkbox-container">
            Let Jellyfin apps connect
            <input
              id="setting-jellyfin-enabled"
              v-model="jellyfin.enabled"
              :aria-invalid="Boolean(form.fields['jellyfin.enabled'])"
              type="checkbox"
              @change="saveField('jellyfin.enabled')"
            >
            <span class="checkmark" />
          </label>
        </div>

        <div class="resize-grid">
          <div class="form-group">
            <label for="setting-jellyfin-port">Port</label>
            <input
              id="setting-jellyfin-port"
              v-model.number="jellyfin.port"
              :aria-invalid="Boolean(form.fields['jellyfin.port'])"
              :aria-describedby="'setting-jellyfin-port-error setting-jellyfin-port-hint'"
              type="number"
              @change="checkSettings"
            >
            <p
              v-if="form.fields['jellyfin.port']"
              id="setting-jellyfin-port-error"
              class="form-error"
            >
              {{ form.fields['jellyfin.port'] }}
            </p>
            <p
              id="setting-jellyfin-port-hint"
              class="form-hint"
            >
              Jellyfin apps look for 8096.
            </p>
          </div>
          <div class="form-group">
            <label for="setting-jellyfin-host">Listen on</label>
            <input
              id="setting-jellyfin-host"
              v-model.trim="jellyfin.host"
              :aria-invalid="Boolean(form.fields['jellyfin.host'])"
              :aria-describedby="'setting-jellyfin-host-error setting-jellyfin-host-hint'"
              type="text"
              autocapitalize="off"
              spellcheck="false"
              @change="checkSettings"
            >
            <p
              v-if="form.fields['jellyfin.host']"
              id="setting-jellyfin-host-error"
              class="form-error"
            >
              {{ form.fields['jellyfin.host'] }}
            </p>
            <p
              id="setting-jellyfin-host-hint"
              class="form-hint"
            >
              0.0.0.0 for every network, 127.0.0.1 for this machine only.
            </p>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <h2 class="settings-section-title">
          How Jellyfin apps show this server
        </h2>
        <p class="settings-description">
          These apply straight away. Administrators can also change them from a Jellyfin app's dashboard.
        </p>

        <div class="form-group">
          <label for="setting-jellyfin-serverName">Server name</label>
          <input
            id="setting-jellyfin-serverName"
            v-model="jellyfin.serverName"
            :aria-invalid="Boolean(form.fields['jellyfin.serverName'])"
            :aria-describedby="'setting-jellyfin-serverName-error'"
            type="text"
            maxlength="100"
            @change="checkSettings"
          >
          <p
            v-if="form.fields['jellyfin.serverName']"
            id="setting-jellyfin-serverName-error"
            class="form-error"
          >
            {{ form.fields['jellyfin.serverName'] }}
          </p>
        </div>

        <div class="form-group">
          <label for="setting-jellyfin-loginDisclaimer">Text under the sign-in form</label>
          <textarea
            id="setting-jellyfin-loginDisclaimer"
            v-model="jellyfin.loginDisclaimer"
            :aria-invalid="Boolean(form.fields['jellyfin.loginDisclaimer'])"
            :aria-describedby="'setting-jellyfin-loginDisclaimer-error'"
            rows="3"
            maxlength="1000"
            @change="checkSettings"
          />
          <p
            v-if="form.fields['jellyfin.loginDisclaimer']"
            id="setting-jellyfin-loginDisclaimer-error"
            class="form-error"
          >
            {{ form.fields['jellyfin.loginDisclaimer'] }}
          </p>
        </div>

        <div class="form-group">
          <label for="setting-jellyfin-customCss">Custom CSS for the Jellyfin web client</label>
          <textarea
            id="setting-jellyfin-customCss"
            v-model="jellyfin.customCss"
            class="code"
            :aria-invalid="Boolean(form.fields['jellyfin.customCss'])"
            :aria-describedby="'setting-jellyfin-customCss-error setting-jellyfin-customCss-hint'"
            rows="8"
            autocapitalize="off"
            spellcheck="false"
            @change="checkSettings"
          />
          <p
            v-if="form.fields['jellyfin.customCss']"
            id="setting-jellyfin-customCss-error"
            class="form-error"
          >
            {{ form.fields['jellyfin.customCss'] }}
          </p>
          <p
            id="setting-jellyfin-customCss-hint"
            class="form-hint"
          >
            Only the Jellyfin web client uses it. Oblecto's own web app is not affected.
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

  export default {
    name: 'JellyfinSettings',
    components: {
      SettingsFormStatus
    },
    mixins: [settingsForm({ jellyfin: 'jellyfin' })],
    data () {
      return {
        jellyfin: {
          enabled: true,
          port: 8096,
          host: '0.0.0.0',
          serverName: 'Oblecto',
          loginDisclaimer: '',
          customCss: ''
        }
      }
    },
    created () {
      this.loadSettings()
    }
  }
</script>

<style lang="sass" scoped>
  textarea
    resize: vertical

  .code
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace
    font-size: 0.9em
</style>
