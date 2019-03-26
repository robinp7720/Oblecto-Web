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
  <a class="button" v-on:click="userAdd">Add user</a>
  </div>
</template>

<script>
  import userEntry from '@/components/settings/UserManagement/userEntry'

  export default {
    name: 'UserManager',
    components: { userEntry },
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
  table
    background: #696060
    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

    border-spacing: 0

    width: 100%

  thead
    background-color: #444042
    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

    th
      padding: 10px

      margin: 0
      border: 0

      outline: 0

  .button
    background-color: rgba(0,0,0,0.5)
    border: rgba(0,0,0,0.8) 1px solid
    color: rgba(255,255,255,0.5)

    padding: 10px
    -webkit-border-radius: 3px
    -moz-border-radius: 3px
    border-radius: 3px
    cursor: pointer

    display: block
    width: 100%

    max-width: 200px

    margin: 5px 0

    text-align: center

</style>
