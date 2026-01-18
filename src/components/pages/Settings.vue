<template>
  <div class="settings-layout">
    <aside class="settings-sidebar">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link :to="{ name: 'SettingsMaintenance'}">
            <font-awesome-icon icon="wrench" class="fa-fw" /> Maintenance
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'SettingsUsers'}">
            <font-awesome-icon icon="users" class="fa-fw" /> Users
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'SettingsLibraries'}">
            <font-awesome-icon icon="folder-open" class="fa-fw" /> Libraries
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'IndexerSettings'}">
            <font-awesome-icon icon="file-video" class="fa-fw" /> Indexer Settings
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'ArtworkSettings'}">
            <font-awesome-icon icon="image" class="fa-fw" /> Artwork
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'FederationSettings'}">
            <font-awesome-icon icon="globe" class="fa-fw" /> Federation
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'SettingsSets'}">
            <font-awesome-icon icon="tags" class="fa-fw" /> Sets
          </router-link>
        </li>
      </ul>
    </aside>
    <main class="settings-content">
      <router-view />
    </main>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faWrench from '@fortawesome/fontawesome-free-solid/faWrench'
  import faUsers from '@fortawesome/fontawesome-free-solid/faUsers'
  import faFolderOpen from '@fortawesome/fontawesome-free-solid/faFolderOpen'
  import faFileVideo from '@fortawesome/fontawesome-free-solid/faFileVideo'
  import faTags from '@fortawesome/fontawesome-free-solid/faTags'
  import fontawesome from '@fortawesome/fontawesome'

  fontawesome.library.add(faWrench, faUsers, faFolderOpen, faFileVideo, faTags)

  export default {
    name: 'Settings',
    components: {
      FontAwesomeIcon
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"
</style>
