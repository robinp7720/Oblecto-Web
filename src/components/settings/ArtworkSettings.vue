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
        <p class="description">
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
  </div>
</template>

<script>
  import oblectoClient from '@/oblectoClient'

  export default {
    name: 'ArtworkSettings',
    data () {
      return {
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
        try {
          const config = await oblectoClient.settings.getAll()
          this.assets = config.assets || this.assets
          this.artwork = config.artwork || this.artwork
          this.tmdb = config.themoviedb || { key: '' }
          this.tvdb = config.tvdb || { key: '' }
          this.fanartTv = config['fanart.tv'] || { key: '' }
        } catch (e) {
          console.error('Failed to load settings', e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to load settings' })
        }
      },
      async saveSettings () {
         try {
           await oblectoClient.settings.update({
              assets: this.assets,
              artwork: this.artwork,
              themoviedb: this.tmdb,
              tvdb: this.tvdb,
              'fanart.tv': this.fanartTv
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
  color: var(--color-text-muted)
  font-size: 0.9em
  margin-top: 5px
  margin-left: 28px

.resize-grid
  display: flex
  gap: 20px
  margin-bottom: 10px
  
  .form-group
    flex: 1

/* Checkbox (Same as IndexerSettings) */
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
