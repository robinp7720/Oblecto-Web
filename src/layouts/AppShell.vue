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
      <details
        ref="accountMenu"
        class="account-menu"
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
          <button
            type="button"
            @click="openRemotePicker"
          >
            Playback device
          </button>
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
import { getCurrentInstance, inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/system/BrandLogo.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const modal = inject('legacyModal')
const vm = getCurrentInstance()
const accountMenu = ref(null)
const searchText = ref(String(route.query.q || ''))

watch(() => route.query.q, value => { searchText.value = String(value || '') })
watch(() => route.fullPath, closeMenu)

function closeMenu () {
  if (accountMenu.value) accountMenu.value.open = false
}
function submitSearch () {
  router.push({ name: 'Search', query: { q: searchText.value } })
}
function openRemotePicker () {
  closeMenu()
  modal.show('ChangeRemoteDialog')
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
  z-index: 50
  display: flex
  align-items: center
  gap: 32px
  min-height: 76px
  padding: 12px var(--page-gutter)
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
  width: 220px
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

.content
  min-width: 0
  min-height: calc(100vh - 230px)
  padding: 40px var(--page-gutter) 80px
.content-home
  padding: 0 0 80px
.shell-footer
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 20px
  padding: 24px var(--page-gutter) 110px
  color: var(--color-text-faint)
  font-size: 0.8rem
.footer-brand
  font-weight: 800
  letter-spacing: 0.12em
.skip-link
  position: fixed
  top: -100px
  left: 20px
  z-index: 100
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
