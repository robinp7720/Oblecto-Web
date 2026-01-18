<template>
  <nav class="nav-bar">
    <div class="container">
      <div class="nav-left">
        <div class="brand">
          <router-link
            :to="{ name: 'Main'}"
            class="brand-link"
          >
            <img
              :src="host + '/web/logo.png'"
              alt=""
            >
          </router-link>
        </div>
        <div class="links">
          <router-link
            :to="{ name: 'Series'}"
            class="nav-link"
          >
            Series
          </router-link>
          <router-link
            :to="{ name: 'Movies'}"
            class="nav-link"
          >
            Movies
          </router-link>
        </div>
      </div>
      <div class="search">
        <form
          id="search-form"
          action=""
          class="search"
          @submit.prevent="search"
        >
          <input
            id="search-input"
            v-model="searchText"
            type="text"
            class="input-text"
          >
          <button type="submit">
            <FontAwesomeIcon
              :icon="iconSearch"
            />
          </button>
        </form>
      </div>
      <div class="nav-right">
        <router-link
          :to="{ name: 'SettingsHome'}"
          class="nav-link"
        >
          <FontAwesomeIcon
            :icon="iconSettings"
          />
        </router-link>
        <a
          class="nav-link"
          @click="changeRemote"
        >
          <FontAwesomeIcon
            :icon="iconRemote"
          />
        </a>
        <a
          class="nav-link"
          @click="logout"
        >
          <FontAwesomeIcon
            :icon="iconLogout"
          />
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { mapState } from 'vuex'

import faCog from '@fortawesome/fontawesome-free-solid/faCog'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'
import faLogout from '@fortawesome/fontawesome-free-solid/faSignOutAlt'
import faBroadCast from '@fortawesome/fontawesome-free-solid/faBroadcastTower'

export default {
  name: 'NavBar',
  components: {
    FontAwesomeIcon
  },
  data () {
    return {
      searchText: ''
    }
  },
  computed: {
    iconSettings () {
      return faCog
    },
    iconLogout () {
      return faLogout
    },
    iconSearch () {
      return faSearch
    },
    iconRemote () {
      return faBroadCast
    },
    ...mapState([
      'host'
    ])
  },
  methods: {
    search: function (event) {
      this.$router.push({ name: 'Search', params: { search: this.searchText } })
    },
    changeRemote: function (event) {
      event.preventDefault()
      this.$modal.show('ChangeRemoteDialog')
    },
    logout: function (event) {
      this.$socket.disconnect()

      this.$store.dispatch('logout')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.nav-bar
  top: 0
  height: 64px
  width: 100%
  position: fixed

  z-index: 3

  background: linear-gradient(135deg, rgba(40, 34, 37, 0.95), rgba(52, 46, 50, 0.88))
  border-bottom: 1px solid var(--color-border)
  box-shadow: 0 12px 30px rgba(12, 10, 12, 0.35)
  backdrop-filter: blur(10px)

  .search
    @media screen and (max-width: 900px)
      display: none
    display: inline-block
    width: 100%
    position: relative
    max-width: 420px
    margin: 0 20px

    button
      background: none
      outline: none
      border: none
      padding: 0
      position: absolute
      color: var(--color-text-muted)
      top: 18px
      right: 12px

    .input-text
      margin: 14px 0
      height: 36px
      padding: 6px 36px 6px 12px
      border-radius: 999px
      width: 100%
      background-color: rgba(255, 255, 255, 0.12)
      border: 1px solid transparent
      color: var(--color-text)
      transition: border-color 0.2s, background-color 0.2s

      &:focus
        border-color: var(--color-accent-soft)
        background-color: rgba(255, 255, 255, 0.18)
        outline: none

  .container
    display: flex
    align-items: center
    justify-content: space-between
    height: 100%
    padding: 0 18px

  .nav-link
    display: inline-flex
    align-items: center
    height: 100%
    line-height: 64px
    padding: 0 14px
    font:
      family: var(--font-body)
      size: 14px
      weight: 600
    text:
      decoration: none
    color: var(--color-text)
    letter-spacing: 0.04em
    text-transform: uppercase
    transition: color 0.2s ease, background-color 0.2s ease

    &:hover
      color: var(--color-accent-strong)

    &.router-link-active
      color: var(--color-accent-strong)

.nav-right
  display: inline-flex
  align-items: center
  gap: 6px

.nav-left
  display: inline-flex
  align-items: center
  gap: 10px
  .brand
    font-weight: 600
    padding: 12px 6px
    height: 100%
    display: inline-flex
    align-items: center
    margin-right: 10px

    img
      height: 34px
      filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.3))

</style>
