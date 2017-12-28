<template>
  <div id="app">
    <showModifyModal></showModifyModal>
    <notifications group="system" />

    <nav-bar v-if="$router.history.current.name !== 'play' && $router.history.current.name !== 'login'"></nav-bar>
    <div class="watching" v-if="$router.history.current.name !== 'play' && $router.history.current.name !== 'login'">
      <WatchPanel></WatchPanel>
    </div>
    <transition name="fade" mode="out-in">
    <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  import NavBar from '@/components/NavBar'
  import WatchPanel from '@/components/WatchPanel'

  // Modals
  import showModifyModal from '@/components/modals/showModify'

  export default {
    name: 'app',
    components: {
      WatchPanel: WatchPanel,
      'nav-bar': NavBar,
      showModifyModal
    },
    created () {
      if (this.$auth.getToken()) {
        this.$socket.emit('authenticate', {token: this.$auth.getToken()})
      }
    },
    methods: {
    }
  }
</script>

<style lang="sass">
  #app
    background: #b5bdc8 /* Old browsers */
    background: -moz-linear-gradient(top, #696060 0%, #55535b 36%, #28343b 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(top, #696060 0%, #55535b 36%, #28343b 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(top, #696060 0%, #55535b 36%, #28343b 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b5bdc8', endColorstr='#28343b',GradientType=0 ) /* IE6-9 */
    background-position: top
    background-attachment: fixed
    background-repeat: round
    -webkit-background-size: cover
    background-size: cover

    padding-top: 415px

    min-height: 100vh

    color: #eee

  .v--modal
    background: #b5bdc8 /* Old browsers */
    background: -moz-linear-gradient(top, #696060 0%, #55535b 36%, #28343b 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(top, #696060 0%, #55535b 36%, #28343b 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(top, #696060 0%, #55535b 36%, #28343b 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b5bdc8', endColorstr='#28343b',GradientType=0 ) /* IE6-9 */
    background-position: top
    background-attachment: fixed
    background-repeat: round
    -webkit-background-size: cover
    background-size: cover


  @media screen and (max-height: 800px)
    #app
      padding-top: 0

  ul
    margin: 0
    padding: 0

  .fade-enter-active, .fade-leave-active
    transition: opacity .2s ease

  .fade-enter, .fade-leave-active
    opacity: 0

  .child-view
    position: absolute
    transition: all .2s cubic-bezier(.55,0,.1,1)

  .slide-left-enter, .slide-right-leave-active
    opacity: 0
    -webkit-transform: translate(30px, 0)
    transform: translate(30px, 0)

  .slide-left-leave-active, .slide-right-enter
    opacity: 0
    -webkit-transform: translate(-30px, 0)
    transform: translate(-30px, 0)


</style>
