<template>
  <div class="Libraries">
    <div class="settings-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <h2 style="margin: 0; border: none; padding: 0;">Movies</h2>
        <a class="btn" @click="libraryAdd('movies')">
          <font-awesome-icon icon="plus" /> Add movie library
        </a>
      </div>
      <table class="settings-table">
        <thead>
          <tr>
            <th width="50">#</th>
            <th>Path</th>
            <th width="100">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="movies.length === 0">
            <td colspan="3" style="text-align: center; color: #999;">No movie libraries configured.</td>
          </tr>
          <tr v-for="(library, index) in movies" :key="index">
            <td class="id">{{ index + 1 }}</td>
            <td>{{ library.path }}</td>
            <td class="actions">
              <a title="Delete library path" @click="deleteMovieLibrary(library.path)">
                <font-awesome-icon :icon="deleteIcon" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="settings-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <h2 style="margin: 0; border: none; padding: 0;">TV Shows</h2>
        <a class="btn" @click="libraryAdd('tvshows')">
          <font-awesome-icon icon="plus" /> Add TV show library
        </a>
      </div>
      <table class="settings-table">
        <thead>
          <tr>
            <th width="50">#</th>
            <th>Path</th>
            <th width="100">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="shows.length === 0">
            <td colspan="3" style="text-align: center; color: #999;">No TV show libraries configured.</td>
          </tr>
          <tr v-for="(library, index) in shows" :key="index">
            <td class="id">{{ index + 1 }}</td>
            <td>{{ library.path }}</td>
            <td class="actions">
              <a title="Delete library path" @click="deleteSeriesLibrary(library.path)">
                <font-awesome-icon :icon="deleteIcon" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'

  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import fontawesome from '@fortawesome/fontawesome'

  fontawesome.library.add(faTrash, faPlus)

  export default {
    name: 'Libraries',
    components: {
      FontAwesomeIcon
    },
    computed: {
      ...mapState('libraries', [
        'shows',
        'movies'
      ]),
      deleteIcon () {
        return faTrash
      }
    },
    data () {
      return {
        movieLibraries: {},
        seriesLibraries: {}
      }
    },
    async created () {
      this.updateAll()
    },
    methods: {
      ...mapActions('libraries', [
        'updateAll',
        'deleteMovieLibrary',
        'deleteSeriesLibrary'
      ]),
      async libraryAdd (libraryType) {
        this.$modal.show('LibraryAdd', {
          libraryType
        })
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"
</style>
