<template>
  <div id="app">
    <ShowDialogModal />
    <ShowModifyModal />
    <UserAddModal />
    <MovieDialogModal />
    <EpisodeDialogModal />
    <LibraryAdd />
    <NewMovieSet />
    <PasswordChange />
    <CopyText />
    <ChangeRemoteDialog />
    <SeedboxDialog />

    <notifications
      group="system"
      classes="system-notification"
      position="bottom center"
    />

    <NavBar v-if="$router.history.current.name !== 'login' && loaded" />

    <WatchPanel v-if="$router.history.current.name !== 'login' && loaded" />

    <playBar v-if="$router.history.current.name !== 'login' && loaded" />

    <transition
      name="long-fade"
      mode="out"
    >
      <LoadingPage v-if="$router.history.current.name !== 'login' && !loaded" />
    </transition>

    <transition
      v-if="$router.history.current.name === 'login' || loaded"
      name="fade"
      mode="out-in"
    >
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

  import { ScreenFormats } from '@/enums/ScreenFormats'

  // Modals
  import ShowDialogModal from '@/components/modals/ShowDialog'
  import ShowModifyModal from '@/components/modals/ShowModify'
  import UserAddModal from '@/components/modals/UserAdd'
  import MovieDialogModal from '@/components/modals/MovieDialog'
  import EpisodeDialogModal from '@/components/modals/EpisodeDialog'
  import LibraryAdd from '@/components/modals/LibraryAdd'
  import NewMovieSet from '@/components/modals/NewMovieSet'
  import PasswordChange from '@/components/modals/PasswordChange'
  import CopyText from '@/components/modals/CopyText'
  import ChangeRemoteDialog from '@/components/modals/ChangeRemoteDialog'
  import SeedboxDialog from '@/components/modals/SeedboxDialog'

  export default {
    name: 'App',
    components: {
      ChangeRemoteDialog,
      WatchPanel: WatchPanel,
      NavBar,
      ShowDialogModal,
      PasswordChange,
      ShowModifyModal,
      UserAddModal,
      MovieDialogModal,
      EpisodeDialogModal,
      CopyText,
      NewMovieSet,
      LibraryAdd,
      SeedboxDialog,
      playBar,
      LoadingPage
    },
    computed: {
      ...mapState({
        loaded: state => state.initialLoaded,
        playSizeFormat: state => state.playSizeFormat,
        playing: state => state.playing
      })
    },
    watch: {
      playing: async function (newState, oldState) {
        if (this.playSizeFormat === ScreenFormats.LARGE && this.playing.entity) {
          document.body.style.overflow = 'hidden'

          return
        }

        document.body.style.overflow = 'auto'
      },
      playSizeFormat: async function (newState, oldState) {
        if (newState === ScreenFormats.LARGE && this.playing.entity) {
          document.body.style.overflow = 'hidden'

          return
        }

        document.body.style.overflow = 'auto'
      }
    },
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
  :root
    --font-body: "Space Grotesk", "Work Sans", sans-serif
    --font-display: "Fraunces", "Cormorant Garamond", serif
    --color-bg-1: #6e605f
    --color-bg-2: #4b4850
    --color-bg-3: #1d262f
    --color-surface: #3b3437
    --color-surface-strong: #453d40
    --color-surface-glass: rgba(36, 30, 33, 0.72)
    --color-surface-card: rgba(45, 39, 43, 0.9)
    --color-text: #f4f1ee
    --color-text-muted: rgba(244, 241, 238, 0.72)
    --color-text-faint: rgba(244, 241, 238, 0.55)
    --color-accent: #d9813c
    --color-accent-strong: #f2a154
    --color-accent-soft: rgba(217, 129, 60, 0.35)
    --color-border: rgba(255, 255, 255, 0.12)
    --color-border-strong: rgba(255, 255, 255, 0.22)
    --color-shadow: rgba(16, 12, 14, 0.6)
    --color-shadow-soft: rgba(16, 12, 14, 0.35)
    --radius-sm: 8px
    --radius-md: 12px
    --radius-lg: 18px
    --shadow-soft: 0 12px 30px var(--color-shadow-soft)
    --shadow-strong: 0 18px 40px var(--color-shadow)

  html, body
    font-family: var(--font-body)
    color: var(--color-text)
    background-color: var(--color-bg-3)
    letter-spacing: 0.01em

  a
    color: inherit
    text-decoration: none

  button, input, select, textarea
    font-family: var(--font-body)

  input, select, textarea
    background-color: rgba(255, 255, 255, 0.12)
    border: 1px solid transparent
    border-radius: 12px
    color: var(--color-text)

    &:focus
      outline: none
      border-color: var(--color-accent-soft)
      background-color: rgba(255, 255, 255, 0.18)

  .container
    max-width: 1400px
    margin: 0 auto
    padding: 0 24px
    width: 100%

  .system-notification
    background: rgba(28, 23, 26, 0.95) !important
    padding: 8px 12px
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    box-shadow: 0 10px 20px rgba(10, 8, 10, 0.35)
    margin-bottom: 6px

    .notification-title
      font:
        size: 0.85em
        weight: 600

    .notification-content
      font:
        size: 0.95em

  #app
    background-image: radial-gradient(1200px 500px at 10% -10%, rgba(217, 129, 60, 0.18), transparent 60%), radial-gradient(900px 500px at 90% 0%, rgba(118, 141, 168, 0.18), transparent 60%), linear-gradient(180deg, var(--color-bg-1) 0%, var(--color-bg-2) 42%, var(--color-bg-3) 100%)
    background-position: top
    background-attachment: fixed
    background-repeat: no-repeat
    background-size: cover

    padding-top: 440px
    padding-bottom: 80px

    min-height: 100vh

    color: var(--color-text)

    @media screen and (max-width: 700px)
      padding-top: 400px

  .v--modal
    background: radial-gradient(900px 500px at 20% -10%, rgba(217, 129, 60, 0.18), transparent 55%), linear-gradient(180deg, #5d5353 0%, #3d3a42 45%, #1b242d 100%)

  .v--modal-overlay
    background: rgba(10, 8, 12, 0.6)
    backdrop-filter: blur(6px)

  .v--modal-box
    background: var(--color-surface-card) !important
    color: var(--color-text)
    border: 1px solid var(--color-border) !important
    border-radius: var(--radius-lg) !important
    box-shadow: var(--shadow-strong) !important
    overflow: hidden

    h3
      font-family: var(--font-display)
      letter-spacing: 0.02em

    label
      color: var(--color-text-muted)

    .container
      padding: 20px

    .body
      padding: 0

    .heading
      margin: -20px -20px 16px

    .heading h3
      margin: 0
      padding: 18px 20px

    .footer
      margin: 16px -20px -20px
      padding: 12px 20px 16px
      background: rgba(12, 10, 12, 0.28)
      border-top: 1px solid var(--color-border)

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
