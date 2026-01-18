<template>
  <modal
    name="EpisodeDialog"
    @before-open="beforeOpen"
  >
    <div class="container">
      <div class="heading">
        <h3>{{ episode.episodeName }}</h3>
      </div>
      <div class="body">
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
      </div>
    </div>
  </modal>
</template>

<script>
  import oblectoClient from '@/oblectoClient'

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
        this.episode = await oblectoClient.episodeLibrary.getInfo(event.params.episode.id)
      }
    }
  }
</script>

<style scoped lang="sass">
  h3
    width: 100%
    color: var(--color-text)
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(255, 255, 255, 0.06)

    box-shadow: var(--shadow-soft)

  ul
    list-style: none
    padding: 0
    margin: 0
    li
      span
        display: inline-block
        width: 100%
        padding: 10px 20px
        color: var(--color-text)
        text-decoration: none

        -webkit-transition: background-color 0.1s
        -moz-transition: background-color 0.1s
        -ms-transition: background-color 0.1s
        -o-transition: background-color 0.1s
        transition: background-color 0.1s
      span:hover
        background-color: rgba(255, 255, 255, 0.08)
        box-shadow: 0 0 12px rgba(12, 10, 12, 0.25)

</style>
