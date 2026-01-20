<template>
  <div class="Libraries">
    <!-- MOVIES SECTION -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Movies
        </h2>
        <a
          class="btn"
          @click="libraryAdd('movies')"
        >
          <font-awesome-icon icon="plus" /> Add movie library
        </a>
      </div>
      
      <!-- Configuration -->
      <div class="settings-section-gap">
        <div class="setting-row">
          <label class="checkbox-container">
            Re-index on Startup
            <input
              v-model="moviesConfig.doReIndex"
              type="checkbox"
              @change="saveMoviesConfig"
            >
            <span class="checkmark" />
          </label>
        </div>
        <div class="setting-row">
          <label class="checkbox-container">
            Index Broken Files
            <input
              v-model="moviesConfig.indexBroken"
              type="checkbox"
              @change="saveMoviesConfig"
            >
            <span class="checkmark" />
          </label>
        </div>
          
        <div class="form-group">
          <label>Identifiers</label>
          <TagInput
            v-model="moviesConfig.movieIdentifiers"
            :options="capabilities.movies.identifiers"
            @input="saveMoviesConfig"
          />
        </div>
        <div class="form-group">
          <label>Updaters</label>
          <TagInput
            v-model="moviesConfig.movieUpdaters"
            :options="capabilities.movies.updaters"
            @input="saveMoviesConfig"
          />
        </div>
      </div>

      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th width="50">
                #
              </th>
              <th>Path</th>
              <th width="100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="movies.length === 0">
              <td
                colspan="3"
                class="settings-table-center"
              >
                No movie libraries configured.
              </td>
            </tr>
            <tr
              v-for="(library, index) in movies"
              :key="index"
            >
              <td class="id">
                {{ index + 1 }}
              </td>
              <td>{{ library.path }}</td>
              <td class="actions">
                <a
                  title="Delete library path"
                  @click="deleteMovieLibrary(library.path)"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TV SHOWS SECTION -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          TV Shows
        </h2>
        <a
          class="btn"
          @click="libraryAdd('tvshows')"
        >
          <font-awesome-icon icon="plus" /> Add TV show library
        </a>
      </div>

      <!-- Configuration -->
      <div class="settings-section-gap">
        <div class="setting-row">
          <label class="checkbox-container">
            Re-index on Startup
            <input
              v-model="tvConfig.doReIndex"
              type="checkbox"
              @change="saveTvConfig"
            >
            <span class="checkmark" />
          </label>
        </div>
        <div class="setting-row">
          <label class="checkbox-container">
            Index Broken Files
            <input
              v-model="tvConfig.indexBroken"
              type="checkbox"
              @change="saveTvConfig"
            >
            <span class="checkmark" />
          </label>
        </div>
        <div class="setting-row">
          <label class="checkbox-container">
            Ignore Series Mismatch
            <input
              v-model="tvConfig.ignoreSeriesMismatch"
              type="checkbox"
              @change="saveTvConfig"
            >
            <span class="checkmark" />
          </label>
        </div>
          
        <div class="resize-grid">
          <div class="form-group">
            <label>Series Identifiers</label>
            <TagInput
              v-model="tvConfig.seriesIdentifiers"
              :options="capabilities.tvshows.seriesIdentifiers"
              @input="saveTvConfig"
            />
          </div>
          <div class="form-group">
            <label>Episode Identifiers</label>
            <TagInput
              v-model="tvConfig.episodeIdentifiers"
              :options="capabilities.tvshows.episodeIdentifiers"
              @input="saveTvConfig"
            />
          </div>
        </div>
        <div class="resize-grid">
          <div class="form-group">
            <label>Series Updaters</label>
            <TagInput
              v-model="tvConfig.seriesUpdaters"
              :options="capabilities.tvshows.seriesUpdaters"
              @input="saveTvConfig"
            />
          </div>
          <div class="form-group">
            <label>Episode Updaters</label>
            <TagInput
              v-model="tvConfig.episodeUpdaters"
              :options="capabilities.tvshows.episodeUpdaters"
              @input="saveTvConfig"
            />
          </div>
        </div>
      </div>

      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th width="50">
                #
              </th>
              <th>Path</th>
              <th width="100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="shows.length === 0">
              <td
                colspan="3"
                class="settings-table-center"
              >
                No TV show libraries configured.
              </td>
            </tr>
            <tr
              v-for="(library, index) in shows"
              :key="index"
            >
              <td class="id">
                {{ index + 1 }}
              </td>
              <td>{{ library.path }}</td>
              <td class="actions">
                <a
                  title="Delete library path"
                  @click="deleteSeriesLibrary(library.path)"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
  import TagInput from './TagInput'

  fontawesome.library.add(faTrash, faPlus)

  export default {
    name: 'Libraries',
    components: {
      FontAwesomeIcon,
      TagInput
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
            movieIdentifiers: [],
            movieUpdaters: []
        },
        tvConfig: {
            doReIndex: false,
            indexBroken: false,
            ignoreSeriesMismatch: true,
            seriesIdentifiers: [],
            episodeIdentifiers: [],
            seriesUpdaters: [],
            episodeUpdaters: []
        },
        capabilities: {
            movies: { identifiers: [], updaters: [] },
            tvshows: { seriesIdentifiers: [], episodeIdentifiers: [], seriesUpdaters: [], episodeUpdaters: [] }
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
              // Load capabilities
              this.capabilities = await oblectoClient.system.getCapabilities()

              const movies = await oblectoClient.settings.getSection('movies')
              const tv = await oblectoClient.settings.getSection('tvshows')
              
              this.moviesConfig = {
                  ...movies,
                  movieIdentifiers: movies.movieIdentifiers || [],
                  movieUpdaters: movies.movieUpdaters || []
              }

              this.tvConfig = {
                  ...tv,
                  seriesIdentifiers: tv.seriesIdentifiers || [],
                  episodeIdentifiers: tv.episodeIdentifiers || [],
                  seriesUpdaters: tv.seriesUpdaters || [],
                  episodeUpdaters: tv.episodeUpdaters || []
              }
          } catch (e) {
              console.error('Failed to load library config', e)
          }
      },
      async saveMoviesConfig() {
          const payload = {
              doReIndex: this.moviesConfig.doReIndex,
              indexBroken: this.moviesConfig.indexBroken,
              movieIdentifiers: this.moviesConfig.movieIdentifiers,
              movieUpdaters: this.moviesConfig.movieUpdaters
          }
          try {
              await oblectoClient.settings.updateSection('movies', payload)
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
              seriesIdentifiers: this.tvConfig.seriesIdentifiers,
              episodeIdentifiers: this.tvConfig.episodeIdentifiers,
              seriesUpdaters: this.tvConfig.seriesUpdaters,
              episodeUpdaters: this.tvConfig.episodeUpdaters
          }
          try {
              await oblectoClient.settings.updateSection('tvshows', payload)
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
