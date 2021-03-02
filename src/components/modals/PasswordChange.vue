<template>
  <modal name="PasswordChange" @before-open="beforeOpen" height="auto">
    <div class="container">
      <div class="heading">
      <h3>Change password for {{ username }}</h3>
      </div>
      <div class="body">
        <label for="password">Password:</label>
          <input id="password" type="password" v-model="password" v-bind:class="{invalid: password === ''}">
      </div>
      <div class="footer">
        <button class="success" v-on:click="setPassword">Set password</button>
      </div>
    </div>
  </modal>
</template>

<script>
  export default {
    name: 'PasswordChange',
    data () {
      return {
        userid: null,
        name: '',
        username: '',
        email: '',
        password: ''
      }
    },
    methods: {
      beforeOpen (event) {
        this.userid = event.params.id
        this.name = event.params.name
        this.username = event.params.username
        this.email = event.params.email
        this.password = ''
      },
      async setPassword () {
        if (this.userid === null) {
          return false
        }

        try {
          await this.axios.put(`/user/${this.userid}`, {
            password: this.password
          })

          this.$notify({
            group: 'system',
            title: 'Password has been changed successfully',
            text: 'You can now login with the username: ' + this.name,
            type: 'success'
          })
        } catch (e) {
          this.$notify({
            group: 'system',
            title: 'Password could not be changed',
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
