<template>
  <div id="app">
    <ShowDialogModal/>
    <ShowModifyModal/>
    <UserAddModal/>
    <MovieDialogModal/>

    <notifications group="system" />

    <nav-bar
      v-if="$router.history.current.name !== 'PlayEpisode' &&
      $router.history.current.name !== 'login' &&
      $router.history.current.name !== 'PlayMovie'"/>

    <div class="watching" v-if="$router.history.current.name !== 'PlayEpisode' && $router.history.current.name !== 'login' && $router.history.current.name !== 'PlayMovie'">
      <WatchPanel/>
    </div>

    <playBar/>

    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
  </div>
</template>

<script>
  import NavBar from '@/components/NavBar'
  import WatchPanel from '@/components/WatchPanel'
  import playBar from '@/components/playBar'

  // Modals
  import ShowDialogModal from '@/components/modals/ShowDialog'
  import ShowModifyModal from '@/components/modals/ShowModify'
  import UserAddModal from '@/components/modals/UserAdd'
  import MovieDialogModal from '@/components/modals/MovieDialog'

  export default {
    name: 'app',
    components: {
      WatchPanel: WatchPanel,
      'nav-bar': NavBar,
      ShowDialogModal,
      ShowModifyModal,
      UserAddModal,
      MovieDialogModal,
      playBar
    },
    created () {

    },
    methods: {
    }
  }
</script>

<style lang="sass">
  #app
    background: #696060 /* Old browsers */
    background: -moz-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    background-position: top
    background-attachment: fixed
    background-repeat: round
    -webkit-background-size: cover
    background-size: cover

    padding-top: 415px
    padding-bottom: 70px

    min-height: 100vh

    color: #eee

  .v--modal
    background: #696060 /* Old browsers */
    background: -moz-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */


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
