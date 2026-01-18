<template>
  <modal
    name="UserAdd"
    height="auto"
    @before-open="beforeOpen"
  >
    <div class="container">
      <div class="heading">
        <h3>Add user</h3>
      </div>
      <div class="body">
        <label for="name">Name:</label>
        <input
          id="name"
          v-model="name"
          type="text"
          :class="{invalid: name === ''}"
        >
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="username"
          type="text"
          :class="{invalid: username === ''}"
        >
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="text"
          :class="{invalid: email === ''}"
        >
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :class="{invalid: password === ''}"
        >
      </div>
      <div class="footer">
        <button
          class="success"
          @click="addUser"
        >
          Add user
        </button>
      </div>
    </div>
  </modal>
</template>

<script>
  import oblectoClient from '@/oblectoClient'

  export default {
    name: 'UserAdd',
    data () {
      return {
        name: '',
        username: '',
        email: '',
        password: ''
      }
    },
    methods: {
      beforeOpen (event) {
      },
      async addUser () {
        try {
          await oblectoClient.userManager.createUser(this.username, this.password, this.name, this.email)

          this.$notify({
            group: 'system',
            title: 'User has been created successfully',
            text: 'You can now login with the username: ' + this.name,
            type: 'success'
          })
        } catch (e) {
          this.$notify({
            group: 'system',
            title: 'User could not be created',
            text: 'Maybe not all fields are filled?',
            type: 'error'
          })
        }
      }
    }
  }
</script>

<style scoped lang="sass">
  @use "sass:color"

  .body
    padding: 10px

  h3
    width: 100%
    color: white
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(color.adjust(#696060, $lightness: -20%), 0.75)

  label
    display: block
    margin: 5px
    margin-left: 0

  input
    margin-bottom: 10px
    border-radius: 0
    padding: 10px
    width: 100%
    border: 2px #a8cca1 solid
  .invalid
    border-color: #ff9f78

  .footer
    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(color.adjust(#696060, $lightness: -20%), 0.75)
    padding: 10px

    overflow: hidden

    button
      float: right

      background-color: rgba(0,0,0,0.5)
      border: rgba(0,0,0,0.8) 1px solid
      color: rgba(255,255,255,0.5)

      padding: 10px
      -webkit-border-radius: 3px
      -moz-border-radius: 3px
      border-radius: 3px
      cursor: pointer


</style>
