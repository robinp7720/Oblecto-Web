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
          :class="{invalid: attempted && path === ''}"
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
        libraryType: 'movie',
        attempted: false
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
        this.attempted = false
      },
      opened () {
        this.$refs.pathInput.focus()
      },
      async addLibrary () {
        this.attempted = true
        if (!this.path) {
          this.$notify({
            group: 'system',
            title: 'Missing path',
            text: 'Please provide a library path',
            type: 'error'
          })
          return
        }
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

  .body
    padding: 10px

  h3
    width: 100%
    color: var(--color-text)
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(255, 255, 255, 0.06)

    box-shadow: var(--shadow-soft)

  label
    display: block
    margin: 5px
    margin-left: 0

  input
    margin-bottom: 12px
    border-radius: 12px
    padding: 12px 14px
    width: 100%
    border: 1px solid transparent
    background-color: rgba(255, 255, 255, 0.12)
    color: var(--color-text)
    transition: border-color 0.2s, background-color 0.2s
    &:focus
      outline: none
      border-color: var(--color-accent-soft)
      background-color: rgba(255, 255, 255, 0.18)
  .invalid
    border-color: var(--color-accent-soft)

  .footer
    background-color: rgba(255, 255, 255, 0.06)

    box-shadow: var(--shadow-soft)
    padding: 10px

    overflow: hidden

    button
      float: right
      background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong))
      border: none
      color: #1b1616
      padding: 10px 22px
      border-radius: 999px
      font-weight: 700
      letter-spacing: 0.04em
      cursor: pointer
      box-shadow: 0 12px 20px rgba(12, 10, 12, 0.35)
      transition: transform 0.2s, box-shadow 0.2s
      &:hover
        transform: translateY(-1px)
        box-shadow: 0 16px 26px rgba(12, 10, 12, 0.45)


</style>
