<template>
  <modal name="UserAdd" @before-open="beforeOpen" height="auto">
    <div class="container">
      <div class="heading">
      <h3>Add user</h3>
      </div>
      <div class="body">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="name" v-bind:class="{invalid: name === ''}">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" v-bind:class="{invalid: username === ''}">
        <label for="email">Email:</label>
          <input type="text" id="email" v-model="email" v-bind:class="{invalid: email === ''}">
        <label for="password">Password:</label>
          <input id="password" type="password" v-model="password" v-bind:class="{invalid: password === ''}">
      </div>
      <div class="footer">
        <button class="success" v-on:click="addUser">Add user</button>
      </div>
    </div>
  </modal>
</template>

<script>
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
          await this.axios.post('/user', {
            name: this.name,
            username: this.username,
            email: this.email,
            password: this.password
          })

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

  .body
    padding: 10px

  h3
    width: 100%
    color: white
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(darken(#696060, 20), 0.75)

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

    box-shadow: 0 0 5px 2px rgba(darken(#696060, 20), 0.75)
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
