<template>
  <div class="container">
    <div class="form" @keyup.enter="submit">
      <label for="username">Username</label>
      <input type="text" id="username" v-model="credentials.username">
      <label for="password">Password</label>
      <input type="text" id="password" v-model="credentials.password">
      <button type="submit" @click="submit">Login</button>
    </div>
  </div>
</template>

<script>
  import WatchPanel from '@/components/WatchPanel'
  import ShowList from '@/components/itemLists/ShowList'
  import SearchResults from '@/components/SearchResults'

  export default {
    name: 'Main',
    components: {
      WatchPanel: WatchPanel,
      'search-results': SearchResults,
      ShowList: ShowList
    },
    data () {
      return {
        credentials: {
          username: '',
          password: ''
        }
      }
    },
    methods: {
      submit () {
        let this_ = this
        let credentials = {
          username: this.credentials.username,
          password: this.credentials.password
        }

        if (this.$auth.isAuthenticated()) {
          this.$auth.logout()
        }

        this.$auth.login(credentials).then(function (response) {
          this_.response = response
          this_.$socket.emit('authenticate', {token: response.data['access_token']})
          console.log(response.data['access_token'])
          this_.$router.push({name: 'Main'})
        }).catch(function () {
          this_.$notify({
            group: 'system',
            title: 'Error occurred',
            text: 'An error occured during login',
            type: 'error'
          })
        })
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
    width: 100%
    max-width: 500px
    background-color: rgba(0,0,0,0.3)
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
</style>
