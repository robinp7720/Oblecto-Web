<template>
  <div class="UserManager">
    <div class="settings-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <h2 style="margin: 0; border: none; padding: 0;">Users</h2>
        <a class="btn" @click="userAdd">
          <font-awesome-icon icon="plus" /> Add user
        </a>
      </div>
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
</template>

<script>
  import userEntry from '@/components/settings/UserManagement/userEntry'
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import fontawesome from '@fortawesome/fontawesome'

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
      this.users = (await this.axios.get(`/users`)).data
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
