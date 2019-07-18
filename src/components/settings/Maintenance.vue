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
    name: 'Maintenance'
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
