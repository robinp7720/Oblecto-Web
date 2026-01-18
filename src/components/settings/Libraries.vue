<template>
  <div class="Libraries">
    <!-- MOVIES SECTION -->
    <div class="settings-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <h2 style="margin: 0; border: none; padding: 0;">Movies</h2>
        <a class="btn" @click="libraryAdd('movies')">
          <font-awesome-icon icon="plus" /> Add movie library
        </a>
      </div>
      
      <!-- Configuration -->
      <div style="margin-bottom: 20px;">
          <div class="setting-row">
            <label class="checkbox-container">
              Re-index on Startup
              <input type="checkbox" v-model="moviesConfig.doReIndex" @change="saveMoviesConfig">
              <span class="checkmark"></span>
            </label>
          </div>
          <div class="setting-row">
            <label class="checkbox-container">
              Index Broken Files
              <input type="checkbox" v-model="moviesConfig.indexBroken" @change="saveMoviesConfig">
              <span class="checkmark"></span>
            </label>
          </div>
          
          <div class="form-group">
            <label>Identifiers (comma separated)</label>
            <input type="text" v-model="moviesConfig.movieIdentifiersInput" @change="saveMoviesConfig" placeholder="tmdb">
          </div>
          <div class="form-group">
             <label>Updaters (comma separated)</label>
             <input type="text" v-model="moviesConfig.movieUpdatersInput" @change="saveMoviesConfig" placeholder="tmdb">
          </div>
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

    <!-- TV SHOWS SECTION -->
    <div class="settings-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <h2 style="margin: 0; border: none; padding: 0;">TV Shows</h2>
        <a class="btn" @click="libraryAdd('tvshows')">
          <font-awesome-icon icon="plus" /> Add TV show library
        </a>
      </div>

      <!-- Configuration -->
      <div style="margin-bottom: 20px;">
          <div class="setting-row">
            <label class="checkbox-container">
              Re-index on Startup
              <input type="checkbox" v-model="tvConfig.doReIndex" @change="saveTvConfig">
              <span class="checkmark"></span>
            </label>
          </div>
          <div class="setting-row">
            <label class="checkbox-container">
              Index Broken Files
              <input type="checkbox" v-model="tvConfig.indexBroken" @change="saveTvConfig">
              <span class="checkmark"></span>
            </label>
          </div>
           <div class="setting-row">
            <label class="checkbox-container">
              Ignore Series Mismatch
              <input type="checkbox" v-model="tvConfig.ignoreSeriesMismatch" @change="saveTvConfig">
              <span class="checkmark"></span>
            </label>
          </div>
          
          <div class="resize-grid">
              <div class="form-group">
                <label>Series Identifiers</label>
                <input type="text" v-model="tvConfig.seriesIdentifiersInput" @change="saveTvConfig" placeholder="tmdb">
              </div>
              <div class="form-group">
                 <label>Episode Identifiers</label>
                 <input type="text" v-model="tvConfig.episodeIdentifiersInput" @change="saveTvConfig" placeholder="tmdb">
              </div>
          </div>
          <div class="resize-grid">
              <div class="form-group">
                <label>Series Updaters</label>
                <input type="text" v-model="tvConfig.seriesUpdatersInput" @change="saveTvConfig" placeholder="tmdb, tvdb">
              </div>
              <div class="form-group">
                 <label>Episode Updaters</label>
                 <input type="text" v-model="tvConfig.episodeUpdatersInput" @change="saveTvConfig" placeholder="tmdb, tvdb">
              </div>
          </div>
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
  import oblectoClient from '@/oblectoClient'

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
        moviesConfig: {
            doReIndex: false,
            indexBroken: false,
            movieIdentifiersInput: '',
            movieUpdatersInput: ''
        },
        tvConfig: {
            doReIndex: false,
            indexBroken: false,
            ignoreSeriesMismatch: true,
            seriesIdentifiersInput: '',
            episodeIdentifiersInput: '',
            seriesUpdatersInput: '',
            episodeUpdatersInput: ''
        }
      }
    },
    async created () {
      this.updateAll() // Vuex action for paths
      this.loadConfig()
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
      },
      async loadConfig() {
          try {
              const movies = (await oblectoClient.axios.get('/api/v1/settings/movies')).data
              const tv = (await oblectoClient.axios.get('/api/v1/settings/tvshows')).data
              
              this.moviesConfig = {
                  ...movies,
                  movieIdentifiersInput: (movies.movieIdentifiers || []).join(', '),
                  movieUpdatersInput: (movies.movieUpdaters || []).join(', ')
              }

              this.tvConfig = {
                  ...tv,
                  seriesIdentifiersInput: (tv.seriesIdentifiers || []).join(', '),
                  episodeIdentifiersInput: (tv.episodeIdentifiers || []).join(', '),
                  seriesUpdatersInput: (tv.seriesUpdaters || []).join(', '),
                  episodeUpdatersInput: (tv.episodeUpdaters || []).join(', ')
              }
          } catch (e) {
              console.error('Failed to load library config', e)
          }
      },
      async saveMoviesConfig() {
          const payload = {
              doReIndex: this.moviesConfig.doReIndex,
              indexBroken: this.moviesConfig.indexBroken,
              movieIdentifiers: this.moviesConfig.movieIdentifiersInput.split(',').map(s => s.trim()).filter(s => s),
              movieUpdaters: this.moviesConfig.movieUpdatersInput.split(',').map(s => s.trim()).filter(s => s)
          }
          try {
              await oblectoClient.axios.patch('/api/v1/settings/movies', payload)
              this.$notify({ type: 'success', title: 'Saved', text: 'Movie settings saved' })
          } catch(e) {
              this.$notify({ type: 'error', title: 'Error', text: 'Failed to save movie settings' })
          }
      },
      async saveTvConfig() {
           const payload = {
              doReIndex: this.tvConfig.doReIndex,
              indexBroken: this.tvConfig.indexBroken,
              ignoreSeriesMismatch: this.tvConfig.ignoreSeriesMismatch,
              seriesIdentifiers: this.tvConfig.seriesIdentifiersInput.split(',').map(s => s.trim()).filter(s => s),
              episodeIdentifiers: this.tvConfig.episodeIdentifiersInput.split(',').map(s => s.trim()).filter(s => s),
              seriesUpdaters: this.tvConfig.seriesUpdatersInput.split(',').map(s => s.trim()).filter(s => s),
              episodeUpdaters: this.tvConfig.episodeUpdatersInput.split(',').map(s => s.trim()).filter(s => s)
          }
          try {
              await oblectoClient.axios.patch('/api/v1/settings/tvshows', payload)
              this.$notify({ type: 'success', title: 'Saved', text: 'TV settings saved' })
          } catch(e) {
              this.$notify({ type: 'error', title: 'Error', text: 'Failed to save TV settings' })
          }
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"

.setting-row
  margin-bottom: 15px

.resize-grid
  display: flex
  gap: 20px
  
  .form-group
    flex: 1

.checkbox-container
  display: block
  position: relative
  padding-left: 30px
  margin-bottom: 5px
  cursor: pointer
  font-size: 14px
  user-select: none
  color: #ddd

  input
    position: absolute
    opacity: 0
    cursor: pointer
    height: 0
    width: 0

  .checkmark
    position: absolute
    top: 0
    left: 0
    height: 18px
    width: 18px
    background-color: #333
    border: 1px solid #555
    border-radius: 3px

  &:hover input ~ .checkmark
    background-color: #444

  input:checked ~ .checkmark
    background-color: #2196F3
    border-color: #2196F3

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
