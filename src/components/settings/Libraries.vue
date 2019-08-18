<template>
  <div class="Libraries">
    <h2>Movies</h2>
    <table>
      <thead>
      <tr>
        <th>#</th>
        <th>Path</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(library, index) in movieLibraries">
        <td class="id">
          {{ index + 1 }}
        </td>
        <td>
          {{ library.path }}
        </td>
        <td>
          <a title="Delete library path" v-on:click="deleteMovieLibrary(library.path)">
            <FontAwesomeIcon :icon="deleteIcon"/>
          </a>
        </td>
      </tr>
      </tbody>
    </table>
    <a class="button" v-on:click="libraryAdd('movies')">Add movie library</a>
    <h2>TV Shows</h2>
    <table>
      <thead>
      <tr>
        <th>#</th>
        <th>Path</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(library, index) in seriesLibraries">
        <td class="id">
          {{ index + 1 }}
        </td>
        <td>
          {{ library.path }}
        </td>
        <td>
          <a title="Delete library path" v-on:click="deleteSeriesLibrary(library.path)">
            <FontAwesomeIcon :icon="deleteIcon"/>
          </a>
        </td>
      </tr>
      </tbody>
    </table>
    <a class="button" v-on:click="libraryAdd('tvshows')">Add TV show library</a>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'

  export default {
    name: 'Libraries',
    components: {
      FontAwesomeIcon
    },
    computed: {
      deleteIcon () {
        return faTrash
      }
    },
    data () {
      return {
        movieLibraries: {},
        seriesLibraries: {}
      }
    },
    async created () {
      this.update()
    },
    methods: {
      async update () {
        this.movieLibraries = (await this.axios.get(`/sources/movies`)).data
        this.seriesLibraries = (await this.axios.get(`/sources/tvshows`)).data
      },
      async deleteMovieLibrary (path) {
        await this.axios.delete(`/sources/movies`, {
          data: {
            path
          }
        })

        this.update()
      },
      async deleteSeriesLibrary (path) {
        await this.axios.delete(`/sources/tvshows`, {
          data: {
            path
          }
        })

        this.update()
      },
      async libraryAdd (libraryType) {
        this.$modal.show('LibraryAdd', {
          libraryType
        })
      }
    }
  }
</script>

<style scoped lang="sass">

  .button
    background-color: rgba(0,0,0,0.5)
    border: rgba(0,0,0,0.8) 1px solid
    color: rgba(255,255,255,0.5)

    padding: 10px
    -webkit-border-radius: 3px
    -moz-border-radius: 3px
    border-radius: 3px
    cursor: pointer

    display: block
    width: 100%

    max-width: 200px

    margin: 5px 0

    text-align: center

  h2
    padding-left: 40px

  table
    background: #696060
    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

    border-spacing: 0

    width: 100%

    thead
      background-color: #444042
      box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

      th
        padding: 10px

        margin: 0
        border: 0

        outline: 0
    tr:nth-child(even)
      background-color: darken(#696060, 2)

    td
      padding: 10px

    .id
      text-align: right

    .button
      background-color: rgba(0,0,0,0.5)
      border: rgba(0,0,0,0.8) 1px solid
      color: rgba(255,255,255,0.5)

      padding: 10px
      -webkit-border-radius: 3px
      -moz-border-radius: 3px
      border-radius: 3px
      cursor: pointer

      display: block
      width: 100%

      max-width: 200px

      margin: 5px 0

      text-align: center

</style>
