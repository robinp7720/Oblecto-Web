<template>
  <div class="Libraries">
    <!-- MOVIES SECTION -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Movies
        </h2>
        <button
          type="button"
          class="btn"
          @click="libraryAdd('movies')"
        >
          <font-awesome-icon icon="plus" /> Add movie library
        </button>
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
            @update:model-value="saveMoviesConfig"
          />
        </div>
        <div class="form-group">
          <label>Updaters</label>
          <TagInput
            v-model="moviesConfig.movieUpdaters"
            :options="capabilities.movies.updaters"
            @update:model-value="saveMoviesConfig"
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
                <button
                  type="button"
                  title="Remove this library path"
                  :aria-label="`Remove ${library.path}`"
                  @click="removeLibrary('movies', library.path)"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-card-actions">
        <SaveState :state="moviesSave" />
      </div>
    </div>

    <!-- TV SHOWS SECTION -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          TV Shows
        </h2>
        <button
          type="button"
          class="btn"
          @click="libraryAdd('tvshows')"
        >
          <font-awesome-icon icon="plus" /> Add TV show library
        </button>
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
              @update:model-value="saveTvConfig"
            />
          </div>
          <div class="form-group">
            <label>Episode Identifiers</label>
            <TagInput
              v-model="tvConfig.episodeIdentifiers"
              :options="capabilities.tvshows.episodeIdentifiers"
              @update:model-value="saveTvConfig"
            />
          </div>
        </div>
        <div class="resize-grid">
          <div class="form-group">
            <label>Series Updaters</label>
            <TagInput
              v-model="tvConfig.seriesUpdaters"
              :options="capabilities.tvshows.seriesUpdaters"
              @update:model-value="saveTvConfig"
            />
          </div>
          <div class="form-group">
            <label>Episode Updaters</label>
            <TagInput
              v-model="tvConfig.episodeUpdaters"
              :options="capabilities.tvshows.episodeUpdaters"
              @update:model-value="saveTvConfig"
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
                <button
                  type="button"
                  title="Remove this library path"
                  :aria-label="`Remove ${library.path}`"
                  @click="removeLibrary('tvshows', library.path)"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-card-actions">
        <SaveState :state="tvSave" />
      </div>
    </div>

    <LibraryAdd
      v-model:open="showAdd"
      :library-type="addType"
    />
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
  import LibraryAdd from '@/components/modals/LibraryAdd'
  import SaveState from '@/components/system/SaveState.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'

  fontawesome.library.add(faTrash, faPlus)

  export default {
    name: 'Libraries',
    components: {
      FontAwesomeIcon,
      TagInput,
      LibraryAdd,
      SaveState
    },
    data () {
      return {
        showAdd: false,
        addType: 'movies',
        moviesSave: createSaveState(),
        tvSave: createSaveState(),
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
    computed: {
      ...mapState('libraries', [
        'shows',
        'movies'
      ]),
      deleteIcon () {
        return faTrash
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
      libraryAdd (libraryType) {
        this.addType = libraryType
        this.showAdd = true
      },
      async removeLibrary (libraryType, path) {
        const confirmed = await confirm({
          title: 'Remove this library path?',
          message: `${path} stops being scanned. Nothing on disk is deleted, but titles indexed only from this path disappear from the library on the next cleanup.`,
          confirmLabel: 'Remove path',
          destructive: true
        })

        if (!confirmed) return

        const save = libraryType === 'movies' ? this.moviesSave : this.tvSave

        await save.run(
          () => (libraryType === 'movies'
            ? this.deleteMovieLibrary(path)
            : this.deleteSeriesLibrary(path)),
          { busy: 'Removing…', ok: 'Path removed', error: 'Could not remove this path' }
        )
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
              this.moviesSave.fail('Could not load library settings')
          }
      },
      async saveMoviesConfig() {
          const payload = {
              doReIndex: this.moviesConfig.doReIndex,
              indexBroken: this.moviesConfig.indexBroken,
              movieIdentifiers: this.moviesConfig.movieIdentifiers,
              movieUpdaters: this.moviesConfig.movieUpdaters
          }

          await this.moviesSave.run(
            () => oblectoClient.settings.updateSection('movies', payload),
            { error: 'Could not save movie settings' }
          )
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
          await this.tvSave.run(
            () => oblectoClient.settings.updateSection('tvshows', payload),
            { error: 'Could not save TV settings' }
          )
      }
    }
  }
</script>
