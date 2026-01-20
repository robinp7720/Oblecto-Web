<template>
  <div class="wrapper">
    <!-- Movie Sets -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Movie Sets
        </h2>
        <a
          class="btn"
          @click="openModal('movie')"
        >
          <font-awesome-icon icon="plus" /> New Movie Set
        </a>
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
                <a
                  title="Delete set"
                  @click="deleteSet(set.id, 'movie')"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Series Sets -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          TV Show Sets
        </h2>
        <a
          class="btn"
          @click="openModal('series')"
        >
          <font-awesome-icon icon="plus" /> New TV Show Set
        </a>
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
                <a
                  title="Delete set"
                  @click="deleteSet(set.id, 'series')"
                >
                  <font-awesome-icon :icon="deleteIcon" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Simple Modal for creating sets -->
    <div
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-content settings-card">
        <h3>New {{ modalType === 'movie' ? 'Movie' : 'TV Show' }} Set</h3>
        <div class="form-group">
          <label>Name</label>
          <input
            v-model="newSet.name"
            type="text"
            placeholder="Collection Name"
          >
        </div>
        <div class="form-group">
          <label>Overview</label>
          <input
            v-model="newSet.overview"
            type="text"
            placeholder="Description"
          >
        </div>
        <div class="form-group">
          <label class="checkbox-container">
            Public
            <input
              v-model="newSet.public"
              type="checkbox"
            >
            <span class="checkmark" />
          </label>
        </div>
        <div class="settings-inline-actions">
          <a
            class="btn btn-secondary"
            @click="closeModal"
          >Cancel</a>
          <a
            class="btn"
            @click="createSet"
          >Create</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faPlus, faTrash)

  export default {
    name: 'Sets',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        movieSets: [],
        seriesSets: [],
        showModal: false,
        modalType: 'movie', // 'movie' or 'series'
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
      async refresh() {
        try {
          const [movieSets, seriesSets] = await Promise.all([
             oblectoClient.movieLibrary.getSets(),
             oblectoClient.seriesLibrary.getSets()
          ])
          this.movieSets = movieSets
          this.seriesSets = seriesSets
        } catch (e) {
          console.error("Failed to fetch sets", e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to load sets' })
        }
      },
      openModal(type) {
        this.modalType = type
        this.newSet = { name: '', overview: '', public: true }
        this.showModal = true
      },
      closeModal() {
        this.showModal = false
      },
      async createSet() {
        if (!this.newSet.name) {
             this.$notify({ type: 'error', title: 'Error', text: 'Name is required' })
             return
        }

        try {
          const payload = {
             name: this.newSet.name,
             overview: this.newSet.overview,
             public: this.newSet.public
          }
          if (this.modalType === 'movie') {
            await oblectoClient.sets.createMovieSet(payload)
          } else {
            await oblectoClient.sets.createSeriesSet(payload)
          }
          
          this.$notify({ type: 'success', title: 'Success', text: 'Set created' })
          this.closeModal()
          this.refresh()
        } catch (e) {
          console.error("Failed to create set", e)
          this.$notify({ type: 'error', title: 'Error', text: 'Failed to create set' })
        }
      },
      async deleteSet(id, type) {
        if (!confirm('Are you sure you want to delete this set?')) return

        try {
          if (type === 'movie') {
            await oblectoClient.sets.deleteMovieSet(id)
          } else {
            await oblectoClient.sets.deleteSeriesSet(id)
          }
          this.$notify({ type: 'success', title: 'Success', text: 'Set deleted' })
          this.refresh()
        } catch (e) {
           console.error("Failed to delete set", e)
           this.$notify({ type: 'error', title: 'Error', text: 'Failed to delete set' })
        }
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"

.modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0,0,0,0.7)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000

.modal-content
  width: 400px
  max-width: 90%

// Reusing settings.sass styles but ensuring locally scoped overrides if needed
.checkbox-container
  display: block
  position: relative
  padding-left: 30px
  margin-bottom: 5px
  cursor: pointer
  font-size: 16px
  user-select: none

  input
    position: absolute
    opacity: 0
    cursor: pointer
    height: 0
    width: 0

  .checkmark
    position: absolute
    top: 2px
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
