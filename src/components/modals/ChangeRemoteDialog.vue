<template>
  <modal
    name="ChangeRemoteDialog"
    :adaptive="true"
    @before-open="beforeOpen"
  >
    <div class="container">
      <div class="heading">
        <h3>Choose Playback device</h3>
      </div>
      <div class="body">
        <ul>
          <li
            v-for="(remote, index) in remotes"
            :key="index"
          >
            <span @click="setRemote(remote.clientId)">{{ remote.clientName }}</span>
          </li>
        </ul>
      </div>
    </div>
  </modal>
</template>

<script>
  import oblectoClient from '@/oblectoClient'
  import { mapMutations } from 'vuex'

  export default {
    name: 'ChangeRemoteDialog',
    data () {
      return {
        remotes: []
      }
    },
    methods: {
      async beforeOpen (event) {
        this.remotes = await oblectoClient.remotes.getClients()
      },
      setRemote (remote) {
        this.$modal.hide('ChangeRemoteDialog')
        this.setPlaybackRemote(remote)
      },
      ...mapMutations([
        'setPlaybackRemote'
      ])
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

        cursor: pointer

        -webkit-transition: background-color 0.1s
        -moz-transition: background-color 0.1s
        -ms-transition: background-color 0.1s
        -o-transition: background-color 0.1s
        transition: background-color 0.1s
      span:hover
        background-color: rgba(255, 255, 255, 0.08)
        box-shadow: 0 0 12px rgba(12, 10, 12, 0.25)

</style>
