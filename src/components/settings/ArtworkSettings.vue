<template>
  <div class="wrapper">
    <div class="settings-card">
      <h2 class="settings-section-title">
        Asset Storage
      </h2>
      
      <div class="setting-row">
        <label class="checkbox-container">
          Store assets with file
          <input
            v-model="assets.storeWithFile"
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
        <label>Show Poster Location</label>
        <input
          v-model="assets.showPosterLocation"
          type="text"
          @change="saveSettings"
        >
      </div>
      <div class="form-group">
        <label>Episode Banner Location</label>
        <input
          v-model="assets.episodeBannerLocation"
          type="text"
          @change="saveSettings"
        >
      </div>
      <div class="form-group">
        <label>Movie Poster Location</label>
        <input
          v-model="assets.moviePosterLocation"
          type="text"
          @change="saveSettings"
        >
      </div>
      <div class="form-group">
        <label>Movie Fanart Location</label>
        <input
          v-model="assets.movieFanartLocation"
          type="text"
          @change="saveSettings"
        >
      </div>
    </div>

    <div class="settings-card">
      <h2 class="settings-section-title">
        Image Resizing
      </h2>
      <p class="settings-description">
        Configure target widths (in pixels) for generated images.
      </p>

      <h3>Posters</h3>
      <div class="resize-grid">
        <div class="form-group">
          <label>Small</label>
          <input
            v-model.number="artwork.poster.small"
            type="number"
            @change="saveSettings"
          >
        </div>
        <div class="form-group">
          <label>Medium</label>
          <input
            v-model.number="artwork.poster.medium"
            type="number"
            @change="saveSettings"
          >
        </div>
        <div class="form-group">
          <label>Large</label>
          <input
            v-model.number="artwork.poster.large"
            type="number"
            @change="saveSettings"
          >
        </div>
      </div>

      <h3>Fanart</h3>
      <div class="resize-grid">
        <div class="form-group">
          <label>Small</label>
          <input
            v-model.number="artwork.fanart.small"
            type="number"
            @change="saveSettings"
          >
        </div>
        <div class="form-group">
          <label>Medium</label>
          <input
            v-model.number="artwork.fanart.medium"
            type="number"
            @change="saveSettings"
          >
        </div>
        <div class="form-group">
          <label>Large</label>
          <input
            v-model.number="artwork.fanart.large"
            type="number"
            @change="saveSettings"
          >
        </div>
      </div>

      <h3>Banners</h3>
      <div class="resize-grid">
        <div class="form-group">
          <label>Small</label>
          <input
            v-model.number="artwork.banner.small"
            type="number"
            @change="saveSettings"
          >
        </div>
        <div class="form-group">
          <label>Medium</label>
          <input
            v-model.number="artwork.banner.medium"
            type="number"
            @change="saveSettings"
          >
        </div>
        <div class="form-group">
          <label>Large</label>
          <input
            v-model.number="artwork.banner.large"
            type="number"
            @change="saveSettings"
          >
        </div>
      </div>
    </div>

    <div class="settings-card">
      <h2 class="settings-section-title">
        Metadata Providers
      </h2>
      
      <div class="form-group">
        <label>TheMovieDB Key</label>
        <input
          v-model="tmdb.key"
          type="text"
          @change="saveSettings"
        >
      </div>

      <div class="form-group">
        <label>TVDB Key</label>
        <input
          v-model="tvdb.key"
          type="text"
          @change="saveSettings"
        >
      </div>

      <div class="form-group">
        <label>Fanart.tv Key</label>
        <input
          v-model="fanartTv.key"
          type="text"
          @change="saveSettings"
        >
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
    name: 'ArtworkSettings',
    components: {
      AutosaveBar
    },
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
        tmdb: { key: '' },
        tvdb: { key: '' },
        fanartTv: { key: '' }
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
            this.assets = config.assets || this.assets
            this.artwork = config.artwork || this.artwork
            this.tmdb = config.themoviedb || { key: '' }
            this.tvdb = config.tvdb || { key: '' }
            this.fanartTv = config['fanart.tv'] || { key: '' }
          },
          { busy: 'Loading…', ok: '', error: 'Could not load artwork settings' }
        )
      },
      async saveSettings () {
        await this.save.run(
          () => oblectoClient.settings.update({
            assets: this.assets,
            artwork: this.artwork,
            themoviedb: this.tmdb,
            tvdb: this.tvdb,
            'fanart.tv': this.fanartTv
          }),
          { error: 'Could not save artwork settings' }
        )
      }
    }
  }
</script>

<style scoped lang="sass">
/* Checkbox (Same as IndexerSettings) */
</style>
