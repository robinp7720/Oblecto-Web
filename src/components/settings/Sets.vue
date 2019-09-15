<template>
  <div class="sets">
  <button @click="newMovieSet">New Movie Set</button>

  </div>
</template>

<script>
  export default {
    name: 'Sets',
    methods: {
      async newMovieSet () {
        this.$modal.show('NewMovieSet')
      }
    }
  }
</script>

<style scoped lang="sass">
  hr
    border-color: rgba(0,0,0,0.5)
    width: 100%
    display: block
    float: left

  button
    background-color: rgba(0,0,0,0.5)
    border: rgba(0,0,0,0.8) 1px solid
    color: rgba(255,255,255,0.5)

    display: block
    float: left

    padding: 10px
    margin: 2px

    -webkit-border-radius: 3px
    -moz-border-radius: 3px
    border-radius: 3px
    cursor: pointer

  button:hover
    background-color: rgba(0,0,0,0.9)
</style>
