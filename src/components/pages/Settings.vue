<template>
  <div class="settings">
    <ul class="settings-nav">
      <li class="settings-nav-item"><router-link :to="{ name: 'SettingsMaintenance'}" class="nav-link">Maintance</router-link></li>
      <li class="settings-nav-item"><router-link :to="{ name: 'SettingsUsers'}" class="nav-link">Users</router-link></li>
      <li class="settings-nav-item"><router-link :to="{ name: 'SettingsLibraries'}" class="nav-link">Libraries</router-link></li>
      <li class="settings-nav-item"><router-link :to="{ name: 'IndexerSettings'}" class="nav-link">Indexer Settings</router-link></li>
      <li class="settings-nav-item"><router-link :to="{ name: 'SettingsSets'}" class="nav-link">Sets</router-link></li>
    </ul>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Settings'
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
