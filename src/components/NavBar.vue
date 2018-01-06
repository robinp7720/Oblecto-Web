<template>
  <nav class="nav-bar">
    <div class="container">
      <div class="brand">Oblecto</div>
      <router-link :to="{ name: 'TVShows'}" class="nav-link">TV Shows</router-link>
      <router-link :to="{ name: 'Movies'}" class="nav-link">Movies</router-link>
      <div class="nav-right">
        <router-link :to="{ name: 'Settings'}" class="nav-link">Settings</router-link>
        <div class="search">
          <form action="" class="search" id="search-form" v-on:submit.prevent="onSubmit">
            <input type="text" id="search-input" class="input-text" v-on:keyup.enter="search">
          </form>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
  export default {
    name: 'NavBar',
    methods: {
      search: function (event) {
        event.preventDefault()
        console.log('Searching for ', event.target.value)
        this.$store.dispatch('search', event.target.value)
        this.$router.push({name: 'Main'})
        console.log(this.$router.history.current.name)
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
      display: inline-block
      .input-text
        margin: 10px
        height: 30px
        padding: 5px
        -webkit-border-radius: 3px
        -moz-border-radius: 3px
        border-radius: 3px

        background-color: rgba(255,255,255,0.3)

        border: none
        @media screen and (max-width: 800px)
          width: 80px

    .brand
      font-weight: bold
    .nav-link, .brand
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
    float: right
</style>
