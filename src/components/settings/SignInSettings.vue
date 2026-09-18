<template>
  <div class="wrapper">
    <fieldset
      class="settings-fields"
      :disabled="!form.ready"
    >
      <div class="settings-card">
        <h2 class="settings-section-title">
          Local network
        </h2>
        <p class="settings-description">
          These only apply to devices on the same network as the server. Everyone else always sees the username and password form.
        </p>

        <div class="setting-row">
          <label class="checkbox-container">
            Show profiles on the sign-in screen
            <input
              id="setting-authentication-profilePicker"
              v-model="authentication.profilePicker"
              :aria-invalid="Boolean(form.fields['authentication.profilePicker'])"
              type="checkbox"
              @change="saveSettings"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Pick a profile picture instead of typing a username. Choose who appears under Users.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Password-less sign-in on the local network
            <input
              id="setting-authentication-localPasswordlessLogin"
              v-model="authentication.localPasswordlessLogin"
              :aria-invalid="Boolean(form.fields['authentication.localPasswordlessLogin'])"
              type="checkbox"
              @change="saveSettings"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Users with “No password on local network” ticked under Users sign in with one click. Anyone on your network can then use their account.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Accounts without a password can sign in
            <input
              id="setting-authentication-allowPasswordlessLogin"
              v-model="authentication.allowPasswordlessLogin"
              :aria-invalid="Boolean(form.fields['authentication.allowPasswordlessLogin'])"
              type="checkbox"
              @change="saveSettings"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Lets accounts that never had a password set sign in by username, from the local network only.
          </p>
        </div>

        <div class="form-group">
          <label for="setting-authentication-localSubnets">Additional local subnets</label>
          <input
            id="setting-authentication-localSubnets"
            :value="authentication.localSubnets.join(', ')"
            :aria-invalid="Boolean(form.fields['authentication.localSubnets'])"
            :aria-describedby="'setting-authentication-localSubnets-error setting-authentication-localSubnets-hint'"
            type="text"
            placeholder="100.64.0.0/10"
            autocapitalize="off"
            spellcheck="false"
            @change="setSubnets($event.target.value)"
          >
          <p
            v-if="form.fields['authentication.localSubnets']"
            id="setting-authentication-localSubnets-error"
            class="form-error"
          >
            {{ form.fields['authentication.localSubnets'] }}
          </p>
          <p
            id="setting-authentication-localSubnets-hint"
            class="form-hint"
          >
            Home and private addresses (192.168.x.x, 10.x.x.x, …) are always local. Add others, such as a VPN, separated by commas.
          </p>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Behind a reverse proxy
            <input
              id="setting-authentication-trustProxy"
              v-model="authentication.trustProxy"
              :aria-invalid="Boolean(form.fields['authentication.trustProxy'])"
              type="checkbox"
              @change="saveSettings"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            Use the address the proxy reports (X-Forwarded-For). Only turn this on if a proxy sits in front of Oblecto, or anyone can pretend to be local.
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
    />
  </div>
</template>

<script>
  import SettingsFormStatus from '@/components/settings/SettingsFormStatus.vue'
  import { settingsForm } from '@/composables/settingsForm'

  export default {
    name: 'SignInSettings',
    components: {
      SettingsFormStatus
    },
    mixins: [settingsForm({ authentication: 'authentication' })],
    data () {
      return {
        authentication: {
          profilePicker: true,
          localPasswordlessLogin: false,
          allowPasswordlessLogin: false,
          trustProxy: false,
          localSubnets: []
        }
      }
    },
    created () {
      this.loadSettings()
    },
    methods: {
      setSubnets (text) {
        this.authentication.localSubnets = text.split(/[\s,]+/).filter(Boolean)
        this.saveSettings()
      }
    }
  }
</script>
