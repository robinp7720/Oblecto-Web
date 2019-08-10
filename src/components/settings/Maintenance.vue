<template>
  <div class="maintenance">
  <button @click="index('all')">Full re-index</button>
  <button @click="index('tvshows')">Re-index tvshows</button>
  <button @click="index('movies')">Re-index movies</button>
  <hr>
  <button>Full cleanup</button>
  <button @click="clean('files')">Clean up files database</button>
  <button @click="clean('episodes')">Cleanup episodes without linked files</button>
  <button @click="clean('movies')">Cleanup movies without linked files</button>
  <button @click="clean('tvshows')">Remove TV Shows without episodes</button>
  <hr>
  <button>Download new artwork</button>
  <button @click="DownloadTVShowArt">Download artwork for TV Shows and Episodes</button>
  <button @click="DownloadMovieArt">Download artwork for Movies</button>
  </div>
</template>

<script>
  export default {
    name: 'Maintenance',
    methods: {
      async DownloadTVShowArt () {
        await this.axios.get('/settings/maintenance/tvshows/download/art')
        this.$notify({
          group: 'system',
          title: 'A TV Show artwork update has been requested',
          text: 'Missing artwork will be downloaded',
          type: 'warning'
        })
      },

      async DownloadMovieArt () {
        await this.axios.get('/settings/maintenance/movies/download/art')
        this.$notify({
          group: 'system',
          title: 'A movie artwork update has been requested',
          text: 'Missing artwork will be downloaded',
          type: 'warning'
        })
      },
      async index (type) {
        await this.axios.get('/settings/maintenance/index/' + type)
        this.$notify({
          group: 'system',
          title: 'Library update requested successfully',
          text: 'A library index update has been started',
          type: 'warning'
        })
      },
      async clean (type) {
        await this.axios.get('/settings/maintenance/clean/' + type)
        this.$notify({
          group: 'system',
          title: 'Library cleansing requested successfully',
          text: 'A library cleansing has been started',
          type: 'warning'
        })
      }
    }
  }
</script>

<style scoped lang="sass">
  hr
    border-color: rgba(0,0,0,0.5)
    width: 100%
    display: block
    float: left

  button
    background-color: rgba(0,0,0,0.5)
    border: rgba(0,0,0,0.8) 1px solid
    color: rgba(255,255,255,0.5)

    display: block
    float: left

    padding: 10px
    margin: 2px

    -webkit-border-radius: 3px
    -moz-border-radius: 3px
    border-radius: 3px
    cursor: pointer

  button:hover
    background-color: rgba(0,0,0,0.9)
</style>
