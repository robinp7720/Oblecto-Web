<template>
  <div class="wrapper">
    <!-- Movie Sets -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Movie Sets
        </h2>
        <button
          type="button"
          class="btn"
          @click="openDialog('movie')"
        >
          <font-awesome-icon icon="plus" /> New movie set
        </button>
      </div>
      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th width="50">
                #
              </th>
              <th>Name</th>
              <th>Overview</th>
              <th width="100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="movieSets.length === 0">
              <td
                colspan="4"
                class="settings-table-center"
              >
                No movie sets found.
              </td>
            </tr>
            <tr
              v-for="(set, index) in movieSets"
              :key="set.id"
            >
              <td class="id">
                {{ index + 1 }}
              </td>
              <td>{{ set.setName }}</td>
              <td>{{ set.overview || '-' }}</td>
              <td class="actions">
                <button
                  type="button"
                  title="Delete this set"
                  :aria-label="`Delete ${set.setName}`"
                  @click="deleteSet(set, 'movie')"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-card-actions">
        <SaveState :state="status" />
      </div>
    </div>

    <!-- Series Sets -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          TV Show Sets
        </h2>
        <button
          type="button"
          class="btn"
          @click="openDialog('series')"
        >
          <font-awesome-icon icon="plus" /> New TV show set
        </button>
      </div>
      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th width="50">
                #
              </th>
              <th>Name</th>
              <th>Overview</th>
              <th width="100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="seriesSets.length === 0">
              <td
                colspan="4"
                class="settings-table-center"
              >
                No TV show sets found.
              </td>
            </tr>
            <tr
              v-for="(set, index) in seriesSets"
              :key="set.id"
            >
              <td class="id">
                {{ index + 1 }}
              </td>
              <td>{{ set.setName }}</td>
              <td>{{ set.overview || '-' }}</td>
              <td class="actions">
                <button
                  type="button"
                  title="Delete this set"
                  :aria-label="`Delete ${set.setName}`"
                  @click="deleteSet(set, 'series')"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-card-actions">
        <SaveState :state="status" />
      </div>
    </div>

    <AppDialog
      v-model:open="showDialog"
      :title="dialogType === 'movie' ? 'New movie set' : 'New TV show set'"
      subtitle="A set groups titles together so they can be browsed as one collection."
      size="sm"
      @submit="createSet"
    >
      <div
        class="form-group"
        :class="{ 'is-invalid': Boolean(nameError) }"
      >
        <label for="set-name">Name</label>
        <input
          id="set-name"
          ref="nameInput"
          v-model.trim="newSet.name"
          type="text"
          placeholder="Collection name"
        >
        <p
          v-if="nameError"
          class="form-hint form-error"
        >
          {{ nameError }}
        </p>
      </div>

      <div class="form-group">
        <label for="set-overview">Overview</label>
        <input
          id="set-overview"
          v-model.trim="newSet.overview"
          type="text"
          placeholder="What this collection is for"
        >
      </div>

      <div class="setting-row">
        <label class="checkbox-container">
          Public
          <input
            v-model="newSet.public"
            type="checkbox"
          >
          <span class="checkmark" />
        </label>
        <p class="checkbox-description">
          Public sets are visible to every user on this server.
        </p>
      </div>

      <template #status>
        <SaveState :state="createStatus" />
      </template>

      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="showDialog = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="createStatus.status === 'busy'"
        >
          Create set
        </button>
      </template>
    </AppDialog>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'
  import AppDialog from '@/components/system/AppDialog.vue'
  import SaveState from '@/components/system/SaveState.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'

  fontawesome.library.add(faPlus, faTrash)

  export default {
    name: 'Sets',
    components: {
      FontAwesomeIcon,
      AppDialog,
      SaveState
    },
    data () {
      return {
        movieSets: [],
        seriesSets: [],
        showDialog: false,
        dialogType: 'movie', // 'movie' or 'series'
        nameError: '',
        status: createSaveState(),
        createStatus: createSaveState(),
        newSet: {
          name: '',
          overview: '',
          public: true
        }
      }
    },
    computed: {
      deleteIcon () {
        return faTrash
      }
    },
    async created () {
      this.refresh()
    },
    methods: {
      async refresh () {
        // An empty `ok` keeps a successful load silent; only failure is news.
        await this.status.run(
          async () => {
            const [movieSets, seriesSets] = await Promise.all([
              oblectoClient.movieLibrary.getSets(),
              oblectoClient.seriesLibrary.getSets()
            ])
            this.movieSets = movieSets
            this.seriesSets = seriesSets
          },
          { busy: 'Loading sets…', ok: '', error: 'Could not load sets' }
        )
      },
      async openDialog (type) {
        this.dialogType = type
        this.nameError = ''
        this.newSet = { name: '', overview: '', public: true }
        this.createStatus.reset()
        this.showDialog = true

        await this.$nextTick()
        this.$refs.nameInput?.focus()
      },
      async createSet () {
        if (!this.newSet.name) {
          this.nameError = 'A name is required.'
          return
        }

        this.nameError = ''

        const payload = {
          name: this.newSet.name,
          overview: this.newSet.overview,
          public: this.newSet.public
        }

        const ok = await this.createStatus.run(
          () => (this.dialogType === 'movie'
            ? oblectoClient.sets.createMovieSet(payload)
            : oblectoClient.sets.createSeriesSet(payload)),
          { busy: 'Creating…', ok: 'Set created', error: 'Could not create this set' }
        )

        if (!ok) return

        this.showDialog = false
        this.refresh()
      },
      async deleteSet (set, type) {
        const confirmed = await confirm({
          title: `Delete ${set.setName}?`,
          message: 'The set is removed. The movies or shows inside it stay in the library.',
          confirmLabel: 'Delete set',
          destructive: true
        })

        if (!confirmed) return

        const ok = await this.status.run(
          () => (type === 'movie'
            ? oblectoClient.sets.deleteMovieSet(set.id)
            : oblectoClient.sets.deleteSeriesSet(set.id)),
          { busy: 'Deleting…', ok: `Deleted ${set.setName}`, error: `Could not delete ${set.setName}` }
        )

        if (ok) this.refresh()
      }
    }
  }
</script>
