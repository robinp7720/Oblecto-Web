<template>
  <div class="Libraries">
    <fieldset
      class="settings-fields"
      :disabled="!form.ready"
    >
      <!-- MOVIES SECTION -->
      <div class="settings-card">
        <div class="settings-header-row">
          <h2 class="settings-title-plain">
            Movies
          </h2>
          <button
            id="setting-movie-folders"
            type="button"
            class="btn"
            @click="libraryAdd('movies')"
          >
            <font-awesome-icon icon="plus" /> Add movie library
          </button>
        </div>

        <!-- Configuration -->
        <details class="settings-section-gap">
          <summary>Advanced indexing options</summary>
          <p class="settings-description">
            Identifiers match files to titles. Updaters fetch descriptions and other metadata. Changes to these services take effect after a server restart.
          </p>

          <div class="form-group">
            <label for="setting-movies-movieIdentifiers">Identifiers</label>
            <TagInput
              id="setting-movies-movieIdentifiers"
              v-model="moviesConfig.movieIdentifiers"
              aria-label="Identifiers"
              :options="capabilities.movies.identifiers"
              @update:model-value="saveMoviesConfig"
            />
            <p
              v-if="form.fields['movies.movieIdentifiers']"
              id="setting-movies-movieIdentifiers-error"
              class="form-error"
            >
              {{ form.fields['movies.movieIdentifiers'] }}
            </p>
          </div>
          <div class="form-group">
            <label for="setting-movies-movieUpdaters">Updaters</label>
            <TagInput
              id="setting-movies-movieUpdaters"
              v-model="moviesConfig.movieUpdaters"
              aria-label="Updaters"
              :options="capabilities.movies.updaters"
              @update:model-value="saveMoviesConfig"
            />
            <p
              v-if="form.fields['movies.movieUpdaters']"
              id="setting-movies-movieUpdaters-error"
              class="form-error"
            >
              {{ form.fields['movies.movieUpdaters'] }}
            </p>
          </div>
        </details>

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
            TV shows
          </h2>
          <button
            id="setting-tv-folders"
            type="button"
            class="btn"
            @click="libraryAdd('tvshows')"
          >
            <font-awesome-icon icon="plus" /> Add TV show library
          </button>
        </div>

        <!-- Configuration -->
        <details class="settings-section-gap">
          <summary>Advanced indexing options</summary>
          <p class="settings-description">
            Identifiers match files to titles. Updaters fetch descriptions and other metadata. Changes to these services take effect after a server restart.
          </p>

          <div class="resize-grid">
            <div class="form-group">
              <label for="setting-tvshows-seriesIdentifiers">Series identifiers</label>
              <TagInput
                id="setting-tvshows-seriesIdentifiers"
                v-model="tvConfig.seriesIdentifiers"
                aria-label="Series identifiers"
                :options="capabilities.tvshows.seriesIdentifiers"
                @update:model-value="saveTvConfig"
              />
              <p
                v-if="form.fields['tvshows.seriesIdentifiers']"
                id="setting-tvshows-seriesIdentifiers-error"
                class="form-error"
              >
                {{ form.fields['tvshows.seriesIdentifiers'] }}
              </p>
            </div>
            <div class="form-group">
              <label for="setting-tvshows-episodeIdentifiers">Episode identifiers</label>
              <TagInput
                id="setting-tvshows-episodeIdentifiers"
                v-model="tvConfig.episodeIdentifiers"
                aria-label="Episode identifiers"
                :options="capabilities.tvshows.episodeIdentifiers"
                @update:model-value="saveTvConfig"
              />
              <p
                v-if="form.fields['tvshows.episodeIdentifiers']"
                id="setting-tvshows-episodeIdentifiers-error"
                class="form-error"
              >
                {{ form.fields['tvshows.episodeIdentifiers'] }}
              </p>
            </div>
          </div>
          <div class="resize-grid">
            <div class="form-group">
              <label for="setting-tvshows-seriesUpdaters">Series updaters</label>
              <TagInput
                id="setting-tvshows-seriesUpdaters"
                v-model="tvConfig.seriesUpdaters"
                aria-label="Series updaters"
                :options="capabilities.tvshows.seriesUpdaters"
                @update:model-value="saveTvConfig"
              />
              <p
                v-if="form.fields['tvshows.seriesUpdaters']"
                id="setting-tvshows-seriesUpdaters-error"
                class="form-error"
              >
                {{ form.fields['tvshows.seriesUpdaters'] }}
              </p>
            </div>
            <div class="form-group">
              <label for="setting-tvshows-episodeUpdaters">Episode updaters</label>
              <TagInput
                id="setting-tvshows-episodeUpdaters"
                v-model="tvConfig.episodeUpdaters"
                aria-label="Episode updaters"
                :options="capabilities.tvshows.episodeUpdaters"
                @update:model-value="saveTvConfig"
              />
              <p
                v-if="form.fields['tvshows.episodeUpdaters']"
                id="setting-tvshows-episodeUpdaters-error"
                class="form-error"
              >
                {{ form.fields['tvshows.episodeUpdaters'] }}
              </p>
            </div>
          </div>
        </details>

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
    </fieldset>
    <SettingsFormStatus
      :state="save"
      :form="form"
      :dirty="settingsDirty"
      @retry="loadConfig"
      @revert="revertSettings"
    />
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
  import { settingsForm } from '@/composables/settingsForm'
  import SettingsFormStatus from './SettingsFormStatus.vue'
  import { confirm } from '@/composables/useConfirm'

  fontawesome.library.add(faTrash, faPlus)

  export default {
    name: 'Libraries',
    components: {
      FontAwesomeIcon,
      TagInput,
      LibraryAdd,
      SaveState,
      SettingsFormStatus
    },
    mixins: [settingsForm({ moviesConfig: 'movies', tvConfig: 'tvshows' })],
    data () {
      return {
        showAdd: false,
        addType: 'movies',
        moviesSave: createSaveState(),
        tvSave: createSaveState(),
        moviesConfig: {
            movieIdentifiers: [],
            movieUpdaters: []
        },
        tvConfig: {
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
      async loadConfig () {
        if (this.form.ready) return this.saveSettings()
        try {
          await this.updateAll()
          this.capabilities = await oblectoClient.system.getCapabilities()
          await this.loadSettings()
        } catch {
          this.save.fail('Could not load libraries or available metadata services. Retry to edit settings.')
        }
      },
      saveMoviesConfig () { return this.saveSettings() },
      saveTvConfig () { return this.saveSettings() }
    }
  }
</script>
