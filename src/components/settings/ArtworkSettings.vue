<template>
  <div class="wrapper">
    <fieldset
      class="settings-fields"
      :disabled="!form.ready"
    >
      <div class="settings-card">
        <h2 class="settings-section-title">
          Asset storage
        </h2>

        <div class="setting-row">
          <label class="checkbox-container">
            Store assets with file
            <input
              id="setting-assets-storeWithFile"
              v-model="assets.storeWithFile"
              :aria-invalid="Boolean(form.fields['assets.storeWithFile'])"
              :aria-describedby="'setting-assets-storeWithFile-error'"
              type="checkbox"
              @change="saveSettings"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            If enabled, images will be saved in the same directory as the media file.
          </p>
        </div>

        <div class="form-group">
          <label for="setting-assets-showPosterLocation">TV show poster folder</label>
          <input
            id="setting-assets-showPosterLocation"
            v-model="assets.showPosterLocation"
            :aria-invalid="Boolean(form.fields['assets.showPosterLocation'])"
            :aria-describedby="'setting-assets-showPosterLocation-error setting-assets-showPosterLocation-hint'"
            type="text"
            placeholder="/var/lib/oblecto/artwork"
            @change="saveSettings"
          >
          <p
            v-if="form.fields['assets.showPosterLocation']"
            id="setting-assets-showPosterLocation-error"
            class="form-error"
          >
            {{ form.fields['assets.showPosterLocation'] }}
          </p>
          <p
            id="setting-assets-showPosterLocation-hint"
            class="form-hint"
          >
            Folder on the server, not this device. Relative paths start from the server’s working directory.
          </p>
        </div>
        <div class="form-group">
          <label for="setting-assets-episodeBannerLocation">Episode banner folder</label>
          <input
            id="setting-assets-episodeBannerLocation"
            v-model="assets.episodeBannerLocation"
            :aria-invalid="Boolean(form.fields['assets.episodeBannerLocation'])"
            :aria-describedby="'setting-assets-episodeBannerLocation-error setting-assets-episodeBannerLocation-hint'"
            type="text"
            placeholder="/var/lib/oblecto/artwork"
            @change="saveSettings"
          >
          <p
            v-if="form.fields['assets.episodeBannerLocation']"
            id="setting-assets-episodeBannerLocation-error"
            class="form-error"
          >
            {{ form.fields['assets.episodeBannerLocation'] }}
          </p>
          <p
            id="setting-assets-episodeBannerLocation-hint"
            class="form-hint"
          >
            Folder on the server, not this device. Relative paths start from the server’s working directory.
          </p>
        </div>
        <div class="form-group">
          <label for="setting-assets-moviePosterLocation">Movie poster folder</label>
          <input
            id="setting-assets-moviePosterLocation"
            v-model="assets.moviePosterLocation"
            :aria-invalid="Boolean(form.fields['assets.moviePosterLocation'])"
            :aria-describedby="'setting-assets-moviePosterLocation-error setting-assets-moviePosterLocation-hint'"
            type="text"
            placeholder="/var/lib/oblecto/artwork"
            @change="saveSettings"
          >
          <p
            v-if="form.fields['assets.moviePosterLocation']"
            id="setting-assets-moviePosterLocation-error"
            class="form-error"
          >
            {{ form.fields['assets.moviePosterLocation'] }}
          </p>
          <p
            id="setting-assets-moviePosterLocation-hint"
            class="form-hint"
          >
            Folder on the server, not this device. Relative paths start from the server’s working directory.
          </p>
        </div>
        <div class="form-group">
          <label for="setting-assets-movieFanartLocation">Movie fanart folder</label>
          <input
            id="setting-assets-movieFanartLocation"
            v-model="assets.movieFanartLocation"
            :aria-invalid="Boolean(form.fields['assets.movieFanartLocation'])"
            :aria-describedby="'setting-assets-movieFanartLocation-error setting-assets-movieFanartLocation-hint'"
            type="text"
            placeholder="/var/lib/oblecto/artwork"
            @change="saveSettings"
          >
          <p
            v-if="form.fields['assets.movieFanartLocation']"
            id="setting-assets-movieFanartLocation-error"
            class="form-error"
          >
            {{ form.fields['assets.movieFanartLocation'] }}
          </p>
          <p
            id="setting-assets-movieFanartLocation-hint"
            class="form-hint"
          >
            Folder on the server, not this device. Relative paths start from the server’s working directory.
          </p>
        </div>
      </div>

      <div class="settings-card">
        <h2 class="settings-section-title">
          Image resizing
        </h2>
        <p class="settings-description">
          Configure target widths (in pixels) for generated images.
        </p>

        <h3>Posters</h3>
        <div class="resize-grid">
          <div class="form-group">
            <label for="setting-artwork-poster-small">Small poster width</label>
            <input
              id="setting-artwork-poster-small"
              v-model.number="artwork.poster.small"
              :aria-invalid="Boolean(form.fields['artwork.poster.small'])"
              :aria-describedby="'setting-artwork-poster-small-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.poster.small']"
              id="setting-artwork-poster-small-error"
              class="form-error"
            >
              {{ form.fields['artwork.poster.small'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-artwork-poster-medium">Medium poster width</label>
            <input
              id="setting-artwork-poster-medium"
              v-model.number="artwork.poster.medium"
              :aria-invalid="Boolean(form.fields['artwork.poster.medium'])"
              :aria-describedby="'setting-artwork-poster-medium-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.poster.medium']"
              id="setting-artwork-poster-medium-error"
              class="form-error"
            >
              {{ form.fields['artwork.poster.medium'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-artwork-poster-large">Large poster width</label>
            <input
              id="setting-artwork-poster-large"
              v-model.number="artwork.poster.large"
              :aria-invalid="Boolean(form.fields['artwork.poster.large'])"
              :aria-describedby="'setting-artwork-poster-large-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.poster.large']"
              id="setting-artwork-poster-large-error"
              class="form-error"
            >
              {{ form.fields['artwork.poster.large'] }}
            </p>
          </div>
        </div>

        <h3>Fanart</h3>
        <div class="resize-grid">
          <div class="form-group">
            <label for="setting-artwork-fanart-small">Small fanart width</label>
            <input
              id="setting-artwork-fanart-small"
              v-model.number="artwork.fanart.small"
              :aria-invalid="Boolean(form.fields['artwork.fanart.small'])"
              :aria-describedby="'setting-artwork-fanart-small-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.fanart.small']"
              id="setting-artwork-fanart-small-error"
              class="form-error"
            >
              {{ form.fields['artwork.fanart.small'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-artwork-fanart-medium">Medium fanart width</label>
            <input
              id="setting-artwork-fanart-medium"
              v-model.number="artwork.fanart.medium"
              :aria-invalid="Boolean(form.fields['artwork.fanart.medium'])"
              :aria-describedby="'setting-artwork-fanart-medium-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.fanart.medium']"
              id="setting-artwork-fanart-medium-error"
              class="form-error"
            >
              {{ form.fields['artwork.fanart.medium'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-artwork-fanart-large">Large fanart width</label>
            <input
              id="setting-artwork-fanart-large"
              v-model.number="artwork.fanart.large"
              :aria-invalid="Boolean(form.fields['artwork.fanart.large'])"
              :aria-describedby="'setting-artwork-fanart-large-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.fanart.large']"
              id="setting-artwork-fanart-large-error"
              class="form-error"
            >
              {{ form.fields['artwork.fanart.large'] }}
            </p>
          </div>
        </div>

        <h3>Banners</h3>
        <div class="resize-grid">
          <div class="form-group">
            <label for="setting-artwork-banner-small">Small banner width</label>
            <input
              id="setting-artwork-banner-small"
              v-model.number="artwork.banner.small"
              :aria-invalid="Boolean(form.fields['artwork.banner.small'])"
              :aria-describedby="'setting-artwork-banner-small-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.banner.small']"
              id="setting-artwork-banner-small-error"
              class="form-error"
            >
              {{ form.fields['artwork.banner.small'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-artwork-banner-medium">Medium banner width</label>
            <input
              id="setting-artwork-banner-medium"
              v-model.number="artwork.banner.medium"
              :aria-invalid="Boolean(form.fields['artwork.banner.medium'])"
              :aria-describedby="'setting-artwork-banner-medium-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.banner.medium']"
              id="setting-artwork-banner-medium-error"
              class="form-error"
            >
              {{ form.fields['artwork.banner.medium'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-artwork-banner-large">Large banner width</label>
            <input
              id="setting-artwork-banner-large"
              v-model.number="artwork.banner.large"
              :aria-invalid="Boolean(form.fields['artwork.banner.large'])"
              :aria-describedby="'setting-artwork-banner-large-error'"
              type="number"
              min="1"
              step="1"
              @change="saveSettings"
            >
            <p
              v-if="form.fields['artwork.banner.large']"
              id="setting-artwork-banner-large-error"
              class="form-error"
            >
              {{ form.fields['artwork.banner.large'] }}
            </p>
          </div>
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
  import { createSaveState } from '@/composables/useSaveState'

  export default {
    name: 'ArtworkSettings',
    components: {
      SettingsFormStatus
    },
    mixins: [settingsForm({ assets: 'assets', artwork: 'artwork' })],
    data () {
      return {
        save: createSaveState(),
        assets: {
            storeWithFile: false,
            episodeBannerLocation: '',
            showPosterLocation: '',
            moviePosterLocation: '',
            movieFanartLocation: ''
        },
        artwork: {
            poster: { small: 0, medium: 0, large: 0 },
            fanart: { small: 0, medium: 0, large: 0 },
            banner: { small: 0, medium: 0, large: 0 }
        },

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

<style scoped lang="sass">
/* Checkbox (Same as IndexerSettings) */
</style>
