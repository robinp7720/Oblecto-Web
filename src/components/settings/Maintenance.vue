<template>
  <div class="maintenance">
    <div class="settings-card">
      <h3>Library Indexing</h3>
      <div class="actions-group">
        <button class="btn" @click="index('all')">
          <font-awesome-icon icon="sync" /> Full re-index
        </button>
        <button class="btn" @click="index('series')">
          <font-awesome-icon icon="tv" /> Re-index series
        </button>
        <button class="btn" @click="index('movies')">
          <font-awesome-icon icon="film" /> Re-index movies
        </button>
      </div>
    </div>

    <div class="settings-card">
      <h3>Library Cleanup</h3>
      <div class="actions-group">
        <button class="btn btn-secondary" @click="clean('files')">
          <font-awesome-icon icon="broom" /> Clean up files database
        </button>
        <button class="btn btn-secondary" @click="clean('episodes')">
          <font-awesome-icon icon="broom" /> Cleanup episodes without linked files
        </button>
        <button class="btn btn-secondary" @click="clean('movies')">
          <font-awesome-icon icon="broom" /> Cleanup movies without linked files
        </button>
        <button class="btn btn-secondary" @click="clean('series')">
          <font-awesome-icon icon="broom" /> Remove Series without episodes
        </button>
      </div>
    </div>

    <div class="settings-card">
      <h3>Artwork</h3>
      <div class="actions-group">
        <button class="btn" @click="DownloadTVShowArt">
          <font-awesome-icon icon="image" /> Download artwork for TV Shows and Episodes
        </button>
        <button class="btn" @click="DownloadMovieArt">
          <font-awesome-icon icon="image" /> Download artwork for Movies
        </button>
      </div>
    </div>

    <div class="settings-card">
      <h3>Metadata Updates</h3>
      <div class="actions-group">
        <button class="btn" @click="update('episodes')">
          <font-awesome-icon icon="sync" /> Update episode entries
        </button>
        <button class="btn" @click="update('movies')">
          <font-awesome-icon icon="sync" /> Update movie entries
        </button>
        <button class="btn" @click="update('series')">
          <font-awesome-icon icon="sync" /> Update series entries
        </button>
        <button class="btn" @click="update('files')">
          <font-awesome-icon icon="sync" /> Update file entries
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faSync from '@fortawesome/fontawesome-free-solid/faSync'
  import faTv from '@fortawesome/fontawesome-free-solid/faTv'
  import faFilm from '@fortawesome/fontawesome-free-solid/faFilm'
  import faBroom from '@fortawesome/fontawesome-free-solid/faBroom'
  import faImage from '@fortawesome/fontawesome-free-solid/faImage'
  import fontawesome from '@fortawesome/fontawesome'

  fontawesome.library.add(faSync, faTv, faFilm, faBroom, faImage)

  export default {
    name: 'Maintenance',
    components: {
      FontAwesomeIcon
    },
    methods: {
      async triggerMaintenance (action, target) {
        await this.axios.post('/api/v1/system/maintenance', {
          action,
          target
        })
        this.$notify({
          group: 'system',
          title: 'Maintenance task started',
          text: `Action: ${action}, Target: ${target}`,
          type: 'success'
        })
      },
      async DownloadTVShowArt () {
        await this.triggerMaintenance('update_artwork', 'series')
      },

      async DownloadMovieArt () {
        await this.triggerMaintenance('update_artwork', 'movies')
      },
      async index (type) {
        await this.triggerMaintenance('scan', type)
      },
      async clean (type) {
        await this.triggerMaintenance('clean', type)
      },
      async update (type) {
        await this.triggerMaintenance('update_metadata', type)
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"

.actions-group
  display: flex
  flex-wrap: wrap
  gap: 10px

  button
    margin: 0 !important
    display: flex
    align-items: center
    gap: 8px
</style>
