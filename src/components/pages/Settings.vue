<template>
  <tabs :options="{ useUrlFragment: true }">
    <tab name="Maintenance">
      <div class="container">
      <button @click="index('all')">Full re-index</button>
      <button @click="index('tvshows')">Re-index tvshows</button>
      <button @click="index('movies')">Re-index movies</button>
      <hr>
      <button>Full cleanup</button>
      <button>Clean up files database</button>
      <button>Cleanup episodes without linked files</button>
      <button>Cleanup movies without linked files</button>
      <hr>
      <button>Download new artwork</button>
      <button>Download artwork for TV Shows and Episodes</button>
      <button>Download artwork for Movies</button>
      </div>

    </tab>
    <tab name="Libraries">

    </tab>
    <tab name="Users">

    </tab>
    <tab name="APIs">

    </tab>
  </tabs>
</template>

<script>
  export default {
    name: 'Settings',
    methods: {
      index (type) {
        this.axios.get('/settings/maintenance/index/' + type)
          .then(response => {
            this.$notify({
              group: 'system',
              title: 'Library update requested successfully',
              text: 'A library index update has been started',
              type: 'warning'
            })
          })
      }
    }
  }
</script>

<style scoped lang="sass">
.container
  padding: 10px

hr
  border-color: rgba(0,0,0,0.5)

button
  background-color: rgba(0,0,0,0.5)
  border: rgba(0,0,0,0.8) 1px solid
  color: rgba(255,255,255,0.5)

  padding: 10px
  -webkit-border-radius: 3px
  -moz-border-radius: 3px
  border-radius: 3px
  cursor: pointer

button:hover
  background-color: rgba(0,0,0,0.9)
</style>
