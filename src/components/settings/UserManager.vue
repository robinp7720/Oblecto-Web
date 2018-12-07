<template>
  <div class="UserManager">
    <table>
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
      <user-entry v-for="(user, index) in users"
            v-bind:user="user"
            v-bind:key="user.id"
      ></user-entry>
      </tbody>
    </table>
  <a href="" class="button">Add users</a>
  </div>
</template>

<script>
  import userEntry from '@/components/settings/UserManagement/userEntry'

  export default {
    name: 'user-manager',
    components: {userEntry},
    data () {
      return {
        users: {}
      }
    },
    async created () {
      this.users = (await this.axios.get(`/users`)).data
    }
  }
</script>

<style scoped lang="sass">
  table
    background: #696060
    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

    width: 100%

  thead
    background-color: #444042

    th
      padding: 5px

      margin: 0
      border: 0

      outline: 0

</style>
