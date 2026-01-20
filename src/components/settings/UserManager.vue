<template>
  <div class="UserManager">
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Users
        </h2>
        <a
          class="btn"
          @click="userAdd"
        >
          <font-awesome-icon icon="plus" /> Add user
        </a>
      </div>
      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Group</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <user-entry
              v-for="(user, index) in users"
              :key="user.id"
              :user="user"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
  import userEntry from '@/components/settings/UserManagement/userEntry'
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faPlus)

  export default {
    name: 'UserManager',
    components: { 
      userEntry,
      FontAwesomeIcon
    },
    data () {
      return {
        users: {}
      }
    },
    async created () {
      this.users = await oblectoClient.userManager.getUsers()
    },
    methods: {
      async userAdd () {
        this.$modal.show('UserAdd')
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"
</style>
