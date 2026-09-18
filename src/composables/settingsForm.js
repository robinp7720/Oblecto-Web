import { nextTick } from 'vue'
import { focusSetting } from '@/components/settings/registry'
import oblectoClient from '@/oblectoClient'
import { createSaveState } from './useSaveState'
import { confirm } from './useConfirm'

const clone = value => JSON.parse(JSON.stringify(value))
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Each page maps editable models to API sections. Requests contain changed
// top-level fields only; nested image widths remain complete for shallow merge.
export function settingsForm (sections) {
  return {
    data: () => ({
      save: createSaveState(),
      form: { ready: false, loading: false, saving: false, baseline: {}, fields: {}, requested: null }
    }),
    computed: {
      settingsValues () {
        return Object.fromEntries(Object.entries(sections).map(([model, section]) => [section, this[model]]))
      },
      settingsDirty () { return this.form.ready && !equal(this.settingsValues, this.form.baseline) }
    },
    mounted () {
      this.unloadSettings = event => {
        if (this.settingsDirty || this.form.saving) { event.preventDefault(); event.returnValue = '' }
      }
      window.addEventListener('beforeunload', this.unloadSettings)
      // Router guards in Options API mixins are not extracted by Vue Router.
      // Register explicitly and remove the guard when this page unmounts.
      this.removeSettingsGuard = this.$router.beforeEach(async (to, from) => {
        if (to.name === from.name || (!this.settingsDirty && !this.form.saving)) return true
        return confirm({ title: 'Leave with unsaved changes?', message: this.form.saving ? 'A save is still in progress. Wait for it to finish before leaving to confirm the result.' : 'Some changes have not been saved. Leave this page and discard them?', confirmLabel: 'Leave page' })
      })
    },
    beforeUnmount () {
      this.form.requested = null
      window.removeEventListener('beforeunload', this.unloadSettings)
      this.removeSettingsGuard?.()
    },
    methods: {
      async loadSettings () {
        if (this.form.loading) return
        this.form.loading = true
        this.form.ready = false
        const loaded = await this.save.run(async () => {
          const config = await oblectoClient.settings.getAll()
          for (const [model, section] of Object.entries(sections)) {
            this[model] = { ...clone(this[model]), ...config[section] }
          }
          this.form.baseline = clone(this.settingsValues)
          this.form.fields = {}
          this.form.ready = true
          await nextTick()
          focusSetting(this.$route.hash)
        }, { busy: 'Loading settings…', ok: '', error: 'Could not load settings' })
        this.form.loading = false
        return loaded
      },
      validateSettings () {
        const fields = {}
        for (const [section, values] of Object.entries(this.settingsValues)) {
          for (const [key, value] of Object.entries(values)) {
            if (equal(value, this.form.baseline[section]?.[key])) continue
            if (section === 'artwork') {
              for (const [size, width] of Object.entries(value)) {
                if (!Number.isSafeInteger(width) || width <= 0) fields[`${section}.${key}.${size}`] = 'Enter a positive whole number of pixels.'
              }
            }
            if (section === 'assets' && key.endsWith('Location') && (typeof value !== 'string' || !value.trim() || value.includes('\0'))) fields[`${section}.${key}`] = 'Enter a non-empty path without null characters.'
            if (section === 'federation' && key.endsWith('Port') && (!Number.isInteger(value) || value < 1 || value > 65535)) fields[`${section}.${key}`] = 'Enter a port from 1 to 65535.'
          }
        }
        this.form.fields = fields
        return !Object.keys(fields).length
      },
      async saveSettings () {
        if (!this.form.ready) return
        if (!this.validateSettings()) { this.save.fail('Check the highlighted settings.'); return }
        this.form.requested = clone(this.settingsValues)
        if (this.form.saving) return
        this.form.saving = true
        try {
          while (this.form.requested) {
            const snapshot = this.form.requested
            this.form.requested = null
            const updates = {}
            for (const [section, values] of Object.entries(snapshot)) {
              const changed = Object.fromEntries(Object.entries(values).filter(([key, value]) => !equal(value, this.form.baseline[section]?.[key])))
              if (Object.keys(changed).length) updates[section] = changed
            }
            if (!Object.keys(updates).length) continue
            const success = await this.save.run(async () => {
              try { await oblectoClient.settings.update(updates) }
              catch (error) { this.form.fields = error.response?.data?.fields || {}; throw error }
              this.form.baseline = snapshot
            })
            if (!success) { this.form.requested = null; break }
          }
        } finally { this.form.saving = false }
      },
      retrySettings () { return this.form.ready ? this.saveSettings() : this.loadSettings() },
      revertSettings () {
        if (this.form.saving) return
        for (const [model, section] of Object.entries(sections)) this[model] = clone(this.form.baseline[section])
        this.form.fields = {}
        this.save.reset()
      }
    }
  }
}
