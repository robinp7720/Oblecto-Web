<template>
  <div class="shell">
    <header class="shell-header">
      <RouterLink :to="{ name: 'Main' }" class="brand">
        <span class="brand-mark">O</span>
        <span class="brand-copy">
          <strong>Oblecto</strong>
          <small>Cinematic library control</small>
        </span>
      </RouterLink>

      <nav class="primary-nav">
        <RouterLink :to="{ name: 'Main' }">Home</RouterLink>
        <RouterLink :to="{ name: 'Discover' }">Discover</RouterLink>
        <RouterLink :to="{ name: 'Library', params: { mediaType: 'movies' } }">Movies</RouterLink>
        <RouterLink :to="{ name: 'Library', params: { mediaType: 'series' } }">Series</RouterLink>
        <RouterLink :to="{ name: 'SettingsMaintenance' }">Settings</RouterLink>
      </nav>

      <form class="search-form" @submit.prevent="submitSearch">
        <input v-model="searchText" type="search" placeholder="Search titles, episodes, people" />
      </form>

      <div class="header-actions">
        <button type="button" class="ghost-button" @click="openRemotePicker">Playback Device</button>
        <button type="button" class="ghost-button" @click="logout">Logout</button>
      </div>
    </header>

    <div class="shell-body">
      <aside class="rail">
        <section class="rail-card">
          <span class="rail-label">Active Host</span>
          <strong>{{ host }}</strong>
        </section>
        <section class="rail-card">
          <span class="rail-label">Continue Watching</span>
          <strong>{{ watchingCount }}</strong>
          <p>Episodes and movies currently in progress.</p>
        </section>
        <section class="rail-card">
          <span class="rail-label">Next Up</span>
          <strong>{{ nextEpisodes.length }}</strong>
          <p>Queued episodes available to resume immediately.</p>
        </section>
      </aside>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const store = useStore()
const authStore = useAuthStore()
const modal = inject('legacyModal')
const vm = getCurrentInstance()

const searchText = ref(String(route.query.q || ''))

watch(() => route.query.q, value => {
  searchText.value = String(value || '')
})

const host = computed(() => store.state.host)
const nextEpisodes = computed(() => store.state.nextEpisodes || [])
const watchingCount = computed(() => {
  return (store.state.watchingEpisodes?.length || 0) + (store.state.watchingMovies?.length || 0)
})

function submitSearch () {
  router.push({
    name: 'Search',
    query: {
      q: searchText.value
    }
  })
}

function openRemotePicker () {
  modal.show('ChangeRemoteDialog')
}

async function logout () {
  vm?.appContext.config.globalProperties.$socket?.disconnect()
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped lang="sass">
.shell
  display: grid
  gap: 24px

.shell-header
  position: sticky
  top: 18px
  z-index: 8
  display: grid
  grid-template-columns: auto auto minmax(220px, 1fr) auto
  align-items: center
  gap: 18px
  padding: 18px 22px
  border: 1px solid var(--color-border)
  border-radius: 24px
  background: rgba(30, 25, 28, 0.82)
  backdrop-filter: blur(14px)
  box-shadow: var(--shadow-soft)

.brand
  display: inline-flex
  align-items: center
  gap: 12px

.brand-mark
  display: inline-flex
  align-items: center
  justify-content: center
  width: 42px
  height: 42px
  border-radius: 14px
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong))
  color: #1b1616
  font-weight: 800

.brand-copy
  display: grid

  small
    color: var(--color-text-muted)

.primary-nav
  display: inline-flex
  gap: 14px
  flex-wrap: wrap

  a
    color: var(--color-text-muted)
    text-transform: uppercase
    letter-spacing: 0.08em
    font-size: 0.82rem

  a.router-link-active
    color: var(--color-accent-strong)

.search-form input
  width: 100%
  min-height: 48px
  border-radius: 999px
  padding: 0 18px

.header-actions
  display: inline-flex
  gap: 10px

.ghost-button
  border: 1px solid var(--color-border)
  background: rgba(255, 255, 255, 0.06)
  color: var(--color-text)
  border-radius: 999px
  min-height: 44px
  padding: 0 16px
  cursor: pointer

.shell-body
  display: grid
  grid-template-columns: 280px minmax(0, 1fr)
  gap: 24px

.rail
  display: grid
  gap: 16px
  align-content: start

.rail-card
  padding: 18px
  border-radius: 22px
  background: rgba(30, 25, 28, 0.7)
  border: 1px solid var(--color-border)
  box-shadow: var(--shadow-soft)

  strong
    display: block
    margin: 8px 0
    font-size: 1.3rem

  p
    margin: 0
    color: var(--color-text-muted)

.rail-label
  text-transform: uppercase
  letter-spacing: 0.14em
  color: var(--color-text-faint)
  font-size: 0.72rem

.content
  min-width: 0

@media screen and (max-width: 1180px)
  .shell-header
    grid-template-columns: 1fr

  .shell-body
    grid-template-columns: 1fr

  .rail
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))
</style>
