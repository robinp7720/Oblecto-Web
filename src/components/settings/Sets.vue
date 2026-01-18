<template>
  <div class="sets">
    <div class="settings-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <h2 style="margin: 0; border: none; padding: 0;">Movie Sets</h2>
        <a class="btn" @click="newMovieSet">
          <font-awesome-icon icon="plus" /> New Movie Set
        </a>
      </div>
      <table class="settings-table">
        <thead>
          <tr>
            <th width="50">#</th>
            <th>Name</th>
            <th>Description</th>
            <th width="100">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="sets.length === 0">
            <td colspan="4" style="text-align: center; color: #999;">No movie sets found.</td>
          </tr>
          <tr v-for="(set, index) in sets" :key="set.id || index">
            <td class="id">{{ index + 1 }}</td>
            <td>{{ set.name }}</td>
            <td>{{ set.description || '-' }}</td>
            <td class="actions">
              <!-- Placeholder actions -->
              <a title="Edit set">
                <font-awesome-icon icon="edit" />
              </a>
              <a title="Delete set">
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
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import faEdit from '@fortawesome/fontawesome-free-solid/faEdit'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faPlus, faTrash, faEdit)

  export default {
    name: 'Sets',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        sets: []
      }
    },
    computed: {
      deleteIcon () {
        return faTrash
      }
    },
    async created () {
      try {
        // Attempt to fetch sets. Adjust endpoint as needed.
        // If this 404s, it will just show empty list.
        const response = await oblectoClient.axios.get('/sets')
        this.sets = response.data
      } catch (e) {
        console.error("Failed to fetch sets", e)
      }
    },
    methods: {
      async newMovieSet () {
        this.$modal.show('NewMovieSet')
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"
</style>
