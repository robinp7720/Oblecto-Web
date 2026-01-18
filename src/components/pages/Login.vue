<template>
  <div class="container">
    <div
      class="form"
      @keyup.enter="submit"
    >
      <div class="logo">
        <img
          :src="host + '/web/logo.png'"
          alt=""
        >
      </div>
      <label for="username">Username</label>
      <input
        id="username"
        v-model="credentials.username"
        type="text"
      >
      <label for="password">Password</label>
      <input
        id="password"
        v-model="credentials.password"
        type="password"
      >
      <div class="bottom">
        <span class="server-indicator">{{ host }} <a
          class="nav-link"
          @click="changeHost"
        >Change</a></span>
        <button
          type="submit"
          @click="submit"
        >
          Login
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import oblectoClient from '@/oblectoClient'
  import { mapState } from 'vuex'
  import { reconnectSocket } from '@/socket'

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
        const newHost = prompt('New host?')
        if (!newHost) return
        await this.$store.dispatch('updateHost', newHost)
        reconnectSocket(this.$root, newHost)
      },
      async submit () {
        try {
          await oblectoClient.authenticate(this.credentials.username, this.credentials.password)

          this.axios.defaults.headers.common = { 'Authorization': `bearer ${oblectoClient.accessToken}` }

          // Authenticate the socket.io connection to the server
          // This allows the server to update the client in realtime
          this.$socket.emit('authenticate', { token: oblectoClient.accessToken })

          try {
            await this.$store.dispatch('updateAll')
          } catch (e) {
            console.log(e)
          }

          // After the login procedure is complete, send the user to the homepage
          this.$router.push({ name: 'Main' })
        } catch (e) {
          console.log(e)

          // If an error has occurred during the login process, send an error message to the client
          this.$notify({
            group: 'system',
            title: 'Error occurred',
            text: 'An error occurred during login',
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
      box-shadow: var(--shadow-strong)
      border: 1px solid var(--color-border)
      background: rgba(32, 28, 32, 0.78)

      width: 100%
      max-width: 500px
      border-radius: 18px
      backdrop-filter: blur(12px)

      padding: 28px 36px
      label
        display: block
        color: var(--color-text-muted)
        padding: 6px 5px
        font:
          family: var(--font-body)
          size: 1em
          weight: 600
        text-transform: uppercase
        letter-spacing: 0.08em
      input
        display: block
        width: 100%
        padding: 12px 14px
        border-radius: 12px
        border: 1px solid transparent
        outline: none
        background: rgba(255, 255, 255, 0.12)
        color: var(--color-text)
        transition: border-color 0.2s, background-color 0.2s
        &:focus
          border-color: var(--color-accent-soft)
          background: rgba(255, 255, 255, 0.18)
      button
        border-radius: 999px
        background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong))
        padding: 12px 34px
        border: none
        color: #1b1616
        font-weight: 700
        letter-spacing: 0.05em
        margin-top: 20px
        float: right
        box-shadow: 0 12px 20px rgba(12, 10, 12, 0.35)
        cursor: pointer
        transition: transform 0.2s, box-shadow 0.2s
        &:hover
          transform: translateY(-1px)
          box-shadow: 0 16px 26px rgba(12, 10, 12, 0.45)

  .server-indicator
    float: left
    padding: 10px  0
    border: none
    margin-top: 20px
    color: var(--color-text-faint)

  .logo
    img
      display: block
      width: 56%
      margin: 10px auto 18px
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.45))
</style>
