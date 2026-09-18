<template>
  <div>
    <p class="settings-description">
      Provider key changes take effect for indexing after a server restart. Connection tests use the saved key immediately.
    </p>
    <fieldset
      class="settings-fields"
      :disabled="!form.ready"
    >
      <div
        v-for="provider in providers"
        :key="provider.section"
        class="settings-card"
      >
        <h2 class="settings-section-title">
          {{ provider.label }}
        </h2>
        <div class="form-group">
          <label :for="`provider-${provider.section}`">{{ provider.label }} API key</label>
          <input
            :id="`provider-${provider.section}`"
            v-model="keys[provider.section].key"
            :type="revealed[provider.section] ? 'text' : 'password'"
            autocomplete="off"
            spellcheck="false"
            @input="results[provider.section] = null"
            @change="saveSettings"
          >
        </div>
        <div class="settings-inline-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :aria-pressed="Boolean(revealed[provider.section])"
            @click="revealed[provider.section] = !revealed[provider.section]"
          >
            {{ revealed[provider.section] ? 'Hide' : 'Reveal' }} {{ provider.label }} key
          </button>
          <button
            type="button"
            class="btn"
            :disabled="settingsDirty || form.saving || testing[provider.section]"
            @click="test(provider.section)"
          >
            Test {{ provider.label }} connection
          </button>
        </div>
        <p role="status">
          {{ testing[provider.section] ? 'Testing connection…' : results[provider.section]?.message }}
        </p>
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
import oblectoClient from '@/oblectoClient'
import { settingsForm } from '@/composables/settingsForm'
import SettingsFormStatus from './SettingsFormStatus.vue'
export default {
  components: { SettingsFormStatus },
  mixins: [settingsForm({ tmdb: 'themoviedb', tvdb: 'tvdb', fanart: 'fanart.tv' })],
  data: () => ({
    tmdb: { key: '' }, tvdb: { key: '' }, fanart: { key: '' }, revealed: {}, results: {}, testing: {},
    providers: [{ section: 'themoviedb', label: 'TMDB' }, { section: 'tvdb', label: 'TVDB' }, { section: 'fanart.tv', label: 'Fanart.tv' }]
  }),
  computed: { keys () { return { themoviedb: this.tmdb, tvdb: this.tvdb, 'fanart.tv': this.fanart } } },
  created () { this.loadSettings() },
  methods: {
    async test (provider) {
      this.testing[provider] = true
      const key = this.keys[provider].key
      try {
        const result = await oblectoClient.settings.testProvider(provider)
        if (key === this.keys[provider].key) this.results[provider] = result
      } catch { this.results[provider] = { message: 'Could not run the connection test. Try again.' } }
      finally { this.testing[provider] = false }
    }
  }
}
</script>
