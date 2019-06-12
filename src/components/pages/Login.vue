<template>
  <div class="container">
    <div class="form" @keyup.enter="submit">
      <div class="logo">
        <img v-bind:src="host + '/web/logo.png'" alt="">
      </div>
      <label for="username">Username</label>
      <input type="text" id="username" v-model="credentials.username">
      <label for="password">Password</label>
      <input id="password" type="password" v-model="credentials.password">
      <div class="bottom">
        <span class="server-indicator">{{ host }} <a v-on:click="changeHost" class="nav-link">Change</a></span>
      <button type="submit" @click="submit">Login</button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'Login',
    data () {
      return {
        credentials: {
          username: '',
          password: ''
        }
      }
    },
    computed: mapState([
      'host'
    ]),
    methods: {
      async changeHost () {
        this.$store.dispatch('updateHost', prompt('New host?'))
      },
      async submit () {
        let credentials = {
          username: this.credentials.username,
          password: this.credentials.password
        }

        if (this.$auth.isAuthenticated()) {
          this.$socket.disconnect()
          this.$auth.logout()
        }

        try {
          // Send the login credentials to the backend server
          // If the credentials are incorrect, the client will not be issued an JWT token
          // and the client will be redirected back to here
          let response = await this.$auth.login(credentials)

          // Authenticate the socket.io connection to the server
          // This allows the server to update the client in realtime
          this.$socket.emit('authenticate', { token: response.data['access_token'] })

          this.$store.dispatch('updateAll')

          // After the login proceduce is complete, send the user to the homepage
          this.$router.push({ name: 'Main' })
        } catch (e) {
          // If an error has occurred during the login process, send an error message to the client
          this.$notify({
            group: 'system',
            title: 'Error occurred',
            text: 'An error occured during login',
            type: 'error'
          })
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .container
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%

    display: flex
    align-items: center
    justify-content: center
    .form
      box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000, 6), 0.75)

      width: 100%
      max-width: 500px
      background-color: rgba(0, 0, 0, 0.3)
      -webkit-border-radius: 6px
      -moz-border-radius: 6px
      border-radius: 6px

      padding: 20px 30px
      label
        display: block
        color: #f2f2f2
        padding: 5px
        font:
          family: Roboto
          size: 1.2em
      input
        display: block
        width: 100%
        padding: 10px
        -webkit-border-radius: 6px
        -moz-border-radius: 6px
        border-radius: 6px
        border: #ccc solid 1px
        outline: none
      button
        -webkit-border-radius: 6px
        -moz-border-radius: 6px
        border-radius: 6px
        background: #ccc
        padding: 10px 30px
        border: none
        margin-top: 20px
        float: right

  .server-indicator
    float: left
    padding: 10px  0
    border: none
    margin-top: 20px

  .logo
    img
      display: block
      width: 50%
      margin: 20px auto
</style>
