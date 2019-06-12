<template>
  <nav class="nav-bar">
    <div class="container">
      <div class="nav-left">
        <div class="brand"><router-link :to="{ name: 'Main'}" class="brand-link"><img v-bind:src="host + '/web/logo.png'" alt=""></router-link></div>
<div class="links">
  <router-link :to="{ name: 'TVShows'}" class="nav-link">TV Shows</router-link>
  <router-link :to="{ name: 'Movies'}" class="nav-link">Movies</router-link>
</div>
      </div>
      <div class="search">
        <form action="" class="search" id="search-form" v-on:submit.prevent="search">
          <input type="text" id="search-input" class="input-text" v-model="searchText">
          <button type="submit"><FontAwesomeIcon
            :icon="iconSearch"/></button>
        </form>
      </div>
      <div class="nav-right">
        <router-link :to="{ name: 'Settings'}" class="nav-link"><FontAwesomeIcon
          :icon="iconSettings"/></router-link>
        <a v-on:click="logout" class="nav-link"><FontAwesomeIcon
          :icon="iconLogout"/></a>
      </div>
    </div>
  </nav>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import { mapState } from 'vuex'

  import faCog from '@fortawesome/fontawesome-free-solid/faCog'
  import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'
  import faLogout from '@fortawesome/fontawesome-free-solid/faSignOutAlt'

  export default {
    name: 'NavBar',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        searchText: ''
      }
    },
    computed: {
      iconSettings () {
        return faCog
      },
      iconLogout () {
        return faLogout
      },
      iconSearch () {
        return faSearch
      },
      ...mapState([
        'host'
      ])
    },
    methods: {
      search: function (event) {
        this.$router.push({ name: 'Search', params: { search: this.searchText } })
      },
      logout: function (event) {
        this.$socket.disconnect()
        this.$auth.logout()

        this.$store.dispatch('logout')

        this.$router.push({ name: 'login' })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .nav-bar
    top: 0
    height: 50px
    width: 100%
    position: fixed

    z-index: 3

    background-color: darken(#696060,17) + #000000
    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

    .search
      @media screen and (max-width: 800px)
        display: none
      display: inline-block
      width: 100%
      position: relative
      button
        background: none
        outline: none
        border: none
        padding: 0

        position: absolute

        color: rgba(255,255,255,0.8)

        top: 17px
        right: 8px

      .input-text
        margin: 10px 0
        height: 30px
        padding: 5px
        -webkit-border-radius: 3px
        -moz-border-radius: 3px
        border-radius: 3px
        width: 100%

        background-color: rgba(255,255,255,0.3)

        border: none

    .container
      column-count: 3
      height: 100%
      @media screen and (max-width: 800px)
        column-count: 1


    .nav-link
      display: inline-block
      height: 100%
      line-height: 50px
      padding: 0 15px
      font:
        family: Roboto
        size: 14px
      text:
        decoration: none
      color: #eee
  .nav-right
    text-align: right

  .nav-left
    height: 100%
    vertical-align: center
    float: left
    .links
      float: left
    .brand
      font-weight: bold
      padding: 15px 5px
      height: 100%
      display: inline-block

      float: left
      margin: 0 15px
      img
        height: 100%

</style>
