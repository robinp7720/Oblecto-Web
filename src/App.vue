<template>
  <div id="app">
    <ShowDialogModal/>
    <ShowModifyModal/>
    <UserAddModal/>
    <MovieDialogModal/>
    <EpisodeDialogModal/>
    <LibraryAdd/>
    <NewMovieSet/>
    <PasswordChange/>

    <notifications group="system" classes="system-notification" position="bottom center" />

    <NavBar v-if="$router.history.current.name !== 'login' && loaded"/>

    <WatchPanel  v-if="$router.history.current.name !== 'login' && loaded"/>


    <playBar v-if="$router.history.current.name !== 'login' && loaded"/>


    <transition name="long-fade" mode="out">
      <LoadingPage v-if="$router.history.current.name !== 'login' && !loaded"></LoadingPage>
    </transition>

    <transition name="fade" mode="out-in" v-if="$router.history.current.name === 'login' || loaded">
      <router-view />
    </transition>

  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import NavBar from '@/components/NavBar'
  import WatchPanel from '@/components/WatchPanel'
  import playBar from '@/components/playBar'
  import LoadingPage from '@/components/LoadingPage'

  // Modals
  import ShowDialogModal from '@/components/modals/ShowDialog'
  import ShowModifyModal from '@/components/modals/ShowModify'
  import UserAddModal from '@/components/modals/UserAdd'
  import MovieDialogModal from '@/components/modals/MovieDialog'
  import EpisodeDialogModal from '@/components/modals/EpisodeDialog'
  import LibraryAdd from '@/components/modals/LibraryAdd'
  import NewMovieSet from '@/components/modals/NewMovieSet'
  import PasswordChange from '@/components/modals/PasswordChange'

  export default {
    name: 'app',
    components: {
      WatchPanel: WatchPanel,
      NavBar,
      ShowDialogModal,
      PasswordChange,
      ShowModifyModal,
      UserAddModal,
      MovieDialogModal,
      EpisodeDialogModal,
      NewMovieSet,
      LibraryAdd,
      playBar,
      LoadingPage
    },
    computed: mapState({
      loaded: state => state.initialLoaded
    }),
    created () {

    },
    beforeCreate () {
      this.$store.dispatch('updateAll')
    },
    methods: {
    }
  }
</script>

<style lang="sass">
  .system-notification
    background: #272222 !important
    padding: 7px 10px
    border: 1px solid #423a3a
    margin-bottom: 4px

    .notification-title
      font:
        size: 0.8em

    .notification-content
      font:
        size: 0.9em

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

    @media screen and (max-width: 700px)
      padding-top: 375px

  .v--modal
    background: #696060 /* Old browsers */
    background: -moz-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */


  @media screen and (max-height: 1200px)
    #app
      padding-top: 0

  ul
    margin: 0
    padding: 0

  .fade-enter-active, .fade-leave-active
    transition: opacity .2s ease

  .long-fade-enter-active, .long-fade-leave-active
    transition: opacity .7s ease

  .fade-enter, .fade-leave-active
    opacity: 0
  .long-fade-enter, .long-fade-leave-active
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
