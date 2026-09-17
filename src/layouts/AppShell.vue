<template>
  <div class="shell">
    <a
      class="skip-link"
      href="#main-content"
    >Skip to content</a>
    <header class="shell-header">
      <RouterLink
        :to="{ name: 'Main' }"
        class="brand"
        aria-label="Oblecto home"
      >
        <BrandLogo />
      </RouterLink>
      <nav
        class="primary-nav"
        aria-label="Main navigation"
      >
        <RouterLink
          :to="{ name: 'Main' }"
          class="nav-link"
        >
          Home
        </RouterLink>
        <RouterLink
          :to="{ name: 'Library', params: { mediaType: 'series' } }"
          class="nav-link"
        >
          TV Shows
        </RouterLink>
        <RouterLink
          :to="{ name: 'Library', params: { mediaType: 'movies' } }"
          class="nav-link"
        >
          Movies
        </RouterLink>
        <RouterLink
          :to="{ name: 'Discover' }"
          class="nav-link"
        >
          New &amp; Popular
        </RouterLink>
      </nav>
      <form
        class="search-form"
        role="search"
        @submit.prevent="submitSearch"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        ><circle
          cx="10.5"
          cy="10.5"
          r="6.5"
        /><path d="m16 16 5 5" /></svg>
        <input
          v-model="searchText"
          type="search"
          aria-label="Search movies and shows"
          placeholder="Titles, movies, shows"
        >
      </form>
      <ConnectionStatus />
      <details
        ref="accountMenu"
        class="account-menu"
        @toggle="onMenuToggle"
        @keydown.esc="closeMenu"
      >
        <summary aria-label="Account and playback options">
          <span
            class="avatar"
            aria-hidden="true"
          >O</span><span
            class="caret"
            aria-hidden="true"
          >▾</span>
        </summary>
        <div class="account-options">
          <RouterLink :to="{ name: 'SettingsMaintenance' }">
            Settings
          </RouterLink>

          <!-- Choosing where to play is a pick from a short list, not a task
               worth interrupting the page for, so the list lives in the menu
               that was already open. -->
          <div
            class="menu-section"
            role="group"
            aria-label="Playback device"
          >
            <p class="menu-label">
              Play on
            </p>
            <button
              type="button"
              class="device"
              :class="{ 'device--active': playbackRemote === 'local' }"
              @click="setRemote('local')"
            >
              This device
            </button>
            <button
              v-for="remote in remotes"
              :key="remote.clientId"
              type="button"
              class="device"
              :class="{ 'device--active': playbackRemote === remote.clientId }"
              @click="setRemote(remote.clientId)"
            >
              {{ remote.clientName || 'Unnamed device' }}
            </button>
            <p
              v-if="remotesError"
              class="menu-note"
            >
              {{ remotesError }}
            </p>
            <p
              v-else-if="!remotes.length"
              class="menu-note"
            >
              No other devices are connected.
            </p>
          </div>

          <button
            type="button"
            @click="logout"
          >
            Sign out of Oblecto
          </button>
        </div>
      </details>
    </header>
    <main
      id="main-content"
      class="content"
      :class="{ 'content-home': ['Main', 'MovieInfo', 'SeriesView', 'EpisodeInfo'].includes(route.name) }"
      tabindex="-1"
    >
      <slot />
    </main>
    <footer class="shell-footer">
      <span class="footer-brand">OBLECTO</span><span>Your library. Your next great watch.</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import BrandLogo from '@/components/system/BrandLogo.vue'
import ConnectionStatus from '@/components/system/ConnectionStatus.vue'
import oblectoClient from '@/oblectoClient'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const store = useStore()
const authStore = useAuthStore()
const vm = getCurrentInstance()
const accountMenu = ref(null)
const searchText = ref(String(route.query.q || ''))
const remotes = ref([])
const remotesError = ref('')

const playbackRemote = computed(() => store.state.playbackRemote)

watch(() => route.query.q, value => { searchText.value = String(value || '') })
watch(() => route.fullPath, closeMenu)

function closeMenu () {
  if (accountMenu.value) accountMenu.value.open = false
}
function submitSearch () {
  router.push({ name: 'Search', query: { q: searchText.value } })
}
// Devices are fetched when the menu opens, so the list is current without
// polling while it is closed.
async function onMenuToggle (event) {
  if (!event.target.open) return

  remotesError.value = ''

  try {
    remotes.value = await oblectoClient.remotes.getClients() || []
  } catch (e) {
    console.error('Failed to load playback devices', e)
    remotes.value = []
    remotesError.value = 'Could not load playback devices.'
  }
}
function setRemote (clientId) {
  store.commit('setPlaybackRemote', clientId)
  closeMenu()
}
async function logout () {
  vm?.appContext.config.globalProperties.$socket?.disconnect()
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped lang="sass">
.shell-header
  position: sticky
  top: 0
  z-index: var(--z-header)
  display: flex
  align-items: center
  gap: 32px
  min-height: 76px
  padding: max(12px, var(--safe-top)) max(var(--page-gutter), var(--safe-right)) 12px max(var(--page-gutter), var(--safe-left))
  background: rgba(14, 14, 14, 0.96)

.brand
  color: var(--color-accent)
  font-size: 1.75rem
  font-weight: 900
  letter-spacing: -0.07em

.primary-nav
  display: flex
  gap: 24px
  align-items: center

.nav-link
  white-space: nowrap
  color: #ccc
  font-size: 0.875rem
  transition: color 0.2s
  &:hover
    color: white
  &.router-link-active
    color: var(--color-brand-turquoise)
    font-weight: 700

.search-form
  display: flex
  align-items: center
  gap: 10px
  margin-left: auto
  border: 1px solid #666
  padding: 7px 10px
  width: min(240px, 24vw)
  &:focus-within
    border-color: white
    outline: 1px solid white
  svg
    flex-shrink: 0
    width: 20px
    height: 20px
  input
    width: 100%
    min-width: 0
    padding: 0
    border: 0
    border-radius: 0
    background: transparent
    font-size: 0.8rem
    &:focus
      box-shadow: none

.account-menu
  position: relative
  summary
    display: flex
    align-items: center
    gap: 8px
    cursor: pointer
    list-style: none
    &::-webkit-details-marker
      display: none
.avatar
  display: grid
  place-items: center
  width: 34px
  height: 34px
  border-radius: 4px
  background: var(--color-brand-blue)
  color: white
  font-weight: 700
.account-options
  position: absolute
  right: 0
  top: 48px
  // Capped to the viewport so the panel cannot run off the left edge on a
  // narrow screen, where it was being clipped away entirely.
  width: min(250px, calc(100vw - 40px))
  max-height: min(70vh, 480px)
  overflow-y: auto
  padding: 8px 0
  border: 1px solid #444
  background: #181818
  box-shadow: var(--shadow-strong)
  a, button
    display: block
    width: 100%
    padding: 12px 18px
    text-align: left
    color: white
    background: transparent
    border: 0
    font-size: 0.875rem
    cursor: pointer
    &:hover
      background: #333

.menu-section
  margin: 6px 0
  padding: 6px 0
  border-top: 1px solid #333
  border-bottom: 1px solid #333

.menu-label
  margin: 0
  padding: 6px 18px
  color: var(--color-text-faint)
  font-size: 0.65rem
  font-weight: 700
  letter-spacing: 0.14em
  text-transform: uppercase

.menu-note
  margin: 0
  padding: 6px 18px 10px
  color: var(--color-text-faint)
  font-size: 0.75rem
  line-height: 1.5

.device
  display: flex
  align-items: center
  gap: 8px

  &::before
    content: ""
    flex-shrink: 0
    width: 6px
    height: 6px
    border-radius: 999px
    background: transparent

  &.device--active
    font-weight: 700

    &::before
      background: var(--color-brand-turquoise)

.content
  min-width: 0
  min-height: calc(100vh - 230px)
  padding: 40px max(var(--page-gutter), var(--safe-right)) 80px max(var(--page-gutter), var(--safe-left))
.content-home
  padding: 0 0 80px
.shell-footer
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 20px
  padding: 24px max(var(--page-gutter), var(--safe-right)) calc(24px + var(--safe-bottom) + var(--mini-player-reserve)) max(var(--page-gutter), var(--safe-left))
  color: var(--color-text-faint)
  font-size: 0.8rem
.footer-brand
  font-weight: 800
  letter-spacing: 0.12em
.skip-link
  position: fixed
  top: -100px
  left: 20px
  z-index: var(--z-skip-link)
  padding: 12px
  background: white
  color: black
  &:focus
    top: 12px

@media (max-width: 1000px)
  .shell-header
    gap: 20px
  .primary-nav
    gap: 16px
  .brand
    font-size: 1.5rem
@media (max-width: 760px)
  .shell-header
    flex-wrap: wrap
    gap: 16px
    padding-top: 16px
    padding-bottom: 0
  .primary-nav
    order: 4
    width: 100%
    overflow-x: auto
    padding: 0 0 16px
    gap: 24px
  .nav-link
    font-size: 0.8rem
  .search-form
    width: auto
    flex: 1
    max-width: 240px
  .caret
    display: none
  .content
    padding-top: 24px
  .content-home
    padding-top: 0
</style>
