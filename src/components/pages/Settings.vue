<template>
  <div class="settings">
    <ul class="settings-nav">
      <li class="settings-nav-item"><router-link :to="{ name: 'SettingsMaintenance'}" class="nav-link">Maintance</router-link></li>
      <li class="settings-nav-item"><router-link :to="{ name: 'SettingsUsers'}" class="nav-link">Users</router-link></li>
    </ul>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import UserManager from '@/components/settings/UserManager'

  export default {
    name: 'Settings',
    components: {
      UserManager: UserManager
    },
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
.container
  padding: 10px

.settings-nav
  list-style: none
  margin-top: 0
  margin-bottom: 15px
  position: relative

  overflow-x: auto

  white-space: nowrap

  .settings-nav-item
    display: inline-block
    a
      color: #999
      display: block
      text-decoration: none
      padding: 10px 20px
      font-family: Roboto
      font-size: 20px
      text-transform: capitalize
      font-weight: bold

    a.router-link-active
      color: #eee


</style>
