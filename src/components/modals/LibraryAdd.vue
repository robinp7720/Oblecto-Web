<template>
  <modal name="LibraryAdd" @before-open="beforeOpen" height="auto">
    <div class="container">
      <div class="heading">
      <h3>Add {{ libraryType }} library</h3>
      </div>
      <div class="body">
        <label for="name">Path:</label>
        <input type="text" id="name" v-model="path" v-bind:class="{invalid: path === ''}">
      </div>
      <div class="footer">
        <button class="success" v-on:click="addLibrary">Add library</button>
      </div>
    </div>
  </modal>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    name: 'UserAdd',
    data () {
      return {
        path: '',
        libraryType: 'movie'
      }
    },
    methods: {
      ...mapActions('libraries', [
        'updateAll',
        'deleteMovieLibrary',
        'deleteSeriesLibrary'
      ]),
      beforeOpen (event) {
        this.libraryType = event.params.libraryType
      },
      async addLibrary () {
        try {
          await this.axios.put(`/sources/${this.libraryType}`, {
            path: this.path
          })

          this.$notify({
            group: 'system',
            title: 'Library path has been successfully added',
            text: 'The library will be indexed on next update',
            type: 'success'
          })

          this.updateAll()
        } catch (e) {
          this.$notify({
            group: 'system',
            title: 'Library path could not be added',
            text: 'The request to add the path has failed',
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

    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

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

    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)
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
