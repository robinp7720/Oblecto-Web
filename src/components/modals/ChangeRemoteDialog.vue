<template>
  <modal name="ChangeRemoteDialog" @before-open="beforeOpen" :adaptive=true>
      <h3>Choose Playback device</h3>
    <ul>
      <li v-for="(remote, index) in remotes"
          v-bind:key="index">
        <span v-on:click="setRemote(remote.clientId)">{{ remote.clientName }}</span>
      </li>
    </ul>
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
  .container
    padding: 10px

  h3
    width: 100%
    color: white
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(0,0,0,0.3)

    box-shadow: 0px 0px 5px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.75)

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

        cursor: pointer

        -webkit-transition: background-color 0.1s
        -moz-transition: background-color 0.1s
        -ms-transition: background-color 0.1s
        -o-transition: background-color 0.1s
        transition: background-color 0.1s
      span:hover
        background-color: rgba(0,0,0,0.1)
        box-shadow: 0px 0px 2px 2px rgba(darken(darken(#696060,17) + #000000,6), 0.2)

</style>
