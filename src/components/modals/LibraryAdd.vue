<template>
  <modal
    name="LibraryAdd"
    height="auto"
    @before-open="beforeOpen"
    @opened="opened"
  >
    <div class="container">
      <div class="heading">
        <h3>Add {{ libraryType }} library</h3>
      </div>
      <div class="body">
        <label for="name">Path:</label>
        <input
          id="name"
          ref="pathInput"
          v-model="path"
          type="text"
          :class="{invalid: path === ''}"
          @keyup.enter="addLibrary"
        >
      </div>
      <div class="footer">
        <button
          class="success"
          @click="addLibrary"
        >
          Add library
        </button>
      </div>
    </div>
  </modal>
</template>

<script>
  import { mapActions } from 'vuex'
  import oblectoClient from '@/oblectoClient'

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
        this.path = ''
      },
      opened () {
        this.$refs.pathInput.focus()
      },
      async addLibrary () {
        try {
          await oblectoClient.libraries.addPath(this.libraryType, this.path)

          this.$notify({
            group: 'system',
            title: 'Library path has been successfully added',
            text: 'The library will be indexed on next update',
            type: 'success'
          })

          this.updateAll()

          this.$modal.hide('LibraryAdd')
          this.path = ''
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
