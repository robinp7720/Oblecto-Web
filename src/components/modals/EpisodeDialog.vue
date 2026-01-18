<template>
  <modal
    name="EpisodeDialog"
    @before-open="beforeOpen"
  >
    <h3>{{ episode.episodeName }}</h3>
    <tabs :options="{ useUrlFragment: false }">
      <tab name="Data" />
      <tab name="Files">
        <ul>
          <li
            v-for="(file, index) in episode.Files"
            :key="file.id"
          >
            <span>{{ file.path }}</span>
          </li>
        </ul>
      </tab>
    </tabs>
  </modal>
</template>

<script>
  export default {
    name: 'EpisodeDialog',
    data () {
      return {
        episode: {}
      }
    },
    methods: {
      async beforeOpen (event) {
        this.episode = {}
        this.episode = (await this.axios.get('/episode/' + event.params.episode.id + `/info`)).data
      }
    }
  }
</script>

<style scoped lang="sass">
  @use "sass:color"
  .container
    padding: 10px

  h3
    width: 100%
    color: white
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(color.adjust(#696060, $lightness: -20%), 0.75)

  ul
    list-style: none
    padding: 0
    margin: 0
    li
      span
        display: inline-block
        width: 100%
        padding: 10px 20px
        color: white
        text-decoration: none

        -webkit-transition: background-color 0.1s
        -moz-transition: background-color 0.1s
        -ms-transition: background-color 0.1s
        -o-transition: background-color 0.1s
        transition: background-color 0.1s
      span:hover
        background-color: rgba(0,0,0,0.1)
        box-shadow: 0 0 2px 2px rgba(color.adjust(#696060, $lightness: -20%), 0.2)

</style>
