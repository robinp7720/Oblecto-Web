<template>
  <modal name="NewMovieSet" @before-open="beforeOpen" height="auto">
    <div class="container">
      <div class="heading">
      <h3>Create Movie Set</h3>
      </div>
      <div class="body">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="name" v-bind:class="{invalid: name === ''}">
        <label for="name">Overview:</label>
        <input type="text" id="overview" v-model="overview" v-bind:class="{invalid: overview === ''}">
      </div>
      <div class="footer">
        <button class="success" v-on:click="addSet">Create set</button>
      </div>
    </div>
  </modal>
</template>

<script>
  export default {
    name: 'NewMovieSet',
    data () {
      return {
        name: '',
        overview: '',
        public: true
      }
    },
    methods: {
      beforeOpen (event) {
      },
      async addSet () {
        try {
          await this.axios.post('/set/movie', {
            name: this.name,
            overview: this.overview,
            public: this.public
          })

          this.$notify({
            group: 'system',
            title: 'Set has been created successfully',
            text: '',
            type: 'success'
          })
        } catch (e) {
          this.$notify({
            group: 'system',
            title: 'Set could not be created',
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
