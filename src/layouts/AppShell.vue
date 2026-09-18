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
        <summary :aria-label="t('menu.open')">
          <UserAvatar
            v-if="authStore.me"
            :user="authStore.me"
            :size="34"
            class="avatar avatar--user"
          />
          <span
            v-else
            class="avatar"
            aria-hidden="true"
          >O</span><span
            class="caret"
            aria-hidden="true"
          >▾</span>
        </summary>
        <div class="account-options">
          <p
            v-if="authStore.displayName"
            class="menu-identity"
          >
            {{ authStore.displayName }}
          </p>
          <RouterLink :to="{ name: 'AccountProfile' }">
            {{ t('menu.account') }}
          </RouterLink>
          <RouterLink
            v-if="serverSettings"
            :to="{ name: 'SettingsOverview' }"
          >
            {{ t('menu.settings') }}
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
              :class="{ 'device--active': targetDeviceId === 'local' }"
              @click="setRemote('local')"
            >
              <span class="device-copy">
                <span class="device-name">This device</span>
                <span class="device-note">{{ thisDeviceName }}</span>
              </span>
            </button>
            <button
              v-for="device in targets"
              :key="device.deviceId"
              type="button"
              class="device"
              :class="{ 'device--active': targetDeviceId === device.deviceId }"
              @click="setRemote(device.deviceId)"
            >
              <span class="device-copy">
                <span class="device-name">{{ device.name }}</span>
                <!-- What it is doing right now, so the picker doubles as a
                     status view and you can tell devices apart by more than
                     their name. -->
                <span class="device-note">{{ describeDevice(device) }}</span>
              </span>
            </button>
            <p
              v-if="remote.lastError"
              class="menu-note"
            >
              {{ remote.lastError }}
            </p>
            <p
              v-else-if="!targets.length"
              class="menu-note"
            >
              No other devices are connected.
            </p>
            <!-- Renaming is inline rather than a dialog: the name is stored on
                 this device, so there is nothing to confirm and nowhere else
                 to go. -->
            <form
              v-if="renaming"
              class="device-rename"
              @submit.prevent="commitRename"
            >
              <input
                ref="renameInput"
                v-model="renameText"
                type="text"
                maxlength="64"
                aria-label="Name for this device"
                @keydown.esc.stop="renaming = false"
              >
              <button type="submit">
                Save
              </button>
            </form>
            <button
              v-else
              type="button"
              class="device-rename-toggle"
              @click="startRename"
            >
              Rename this device
            </button>
          </div>

          <button
            type="button"
            @click="logout"
          >
            {{ t('menu.signOut') }}
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
    <!-- Sits where the local mini-player would, because it is the same job:
         what is playing, and the controls for it. -->
    <RemoteControlBar />
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/system/BrandLogo.vue'
import ConnectionStatus from '@/components/system/ConnectionStatus.vue'
import RemoteControlBar from '@/components/remote/RemoteControlBar.vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/system/UserAvatar.vue'
import { canSeeServerSettings } from '@/components/settings/registry'
import { getDeviceName, setDeviceName } from '@/remote/device'
import { playbackTargets, remote, setTarget } from '@/remote/state'
import { getSocket } from '@/socket'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()
// Server settings are only offered to groups allowed to change some of them.
const serverSettings = computed(() => canSeeServerSettings(authStore.can))
const vm = getCurrentInstance()
const accountMenu = ref(null)
const searchText = ref(String(route.query.q || ''))
const renaming = ref(false)
const renameText = ref('')
const renameInput = ref(null)
const thisDeviceName = ref(getDeviceName())

// The server pushes this list whenever anything changes, so the menu is
// already current when it opens and there is nothing to fetch.
const targets = playbackTargets
const targetDeviceId = computed(() => remote.targetDeviceId)

watch(() => route.query.q, value => { searchText.value = String(value || '') })
watch(() => route.fullPath, closeMenu)

function closeMenu () {
  if (accountMenu.value) accountMenu.value.open = false
  renaming.value = false
}
function submitSearch () {
  router.push({ name: 'Search', query: { q: searchText.value } })
}
function onMenuToggle (event) {
  if (!event.target.open) renaming.value = false
}
function describeDevice (device) {
  const state = device.state

  if (!state || state.status === 'idle' || !state.media) return 'Idle'
  if (state.status === 'blocked') return 'Waiting to be started on that device'
  if (state.status === 'error') return state.error || 'Playback failed'

  const title = state.media.title || 'Something'

  return state.status === 'paused' ? `Paused — ${title}` : `Playing — ${title}`
}
function setRemote (deviceId) {
  setTarget(deviceId)
  closeMenu()
}
async function startRename () {
  renameText.value = thisDeviceName.value
  renaming.value = true
  await nextTick()
  renameInput.value?.focus()
}
function commitRename () {
  thisDeviceName.value = setDeviceName(renameText.value)
  renaming.value = false

  // Reconnect so the server picks the new name up from the handshake; without
  // it the name would only change on the next reload.
  const socket = getSocket()

  if (socket) socket.disconnect().connect()
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

.avatar.avatar--user
  // UserAvatar brings its own shape and colour.
  border-radius: 50%
  background: hsl(var(--avatar-hue), 45%, 38%)

.menu-identity
  margin: 0
  padding: 8px 18px 10px
  overflow: hidden
  color: var(--color-text)
  font-weight: 700
  text-overflow: ellipsis
  white-space: nowrap

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
  align-items: flex-start
  gap: 8px

  &::before
    content: ""
    flex-shrink: 0
    margin-top: 6px
    width: 6px
    height: 6px
    border-radius: 999px
    background: transparent

  &.device--active
    .device-name
      font-weight: 700

    &::before
      background: var(--color-brand-turquoise)

.device-copy
  display: flex
  flex-direction: column
  gap: 2px
  min-width: 0

.device-name
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.device-note
  color: var(--color-text-faint)
  font-size: 0.7rem
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.device-rename-toggle
  color: var(--color-text-faint) !important
  font-size: 0.75rem !important

.device-rename
  display: flex
  gap: 6px
  padding: 8px 18px

  input
    flex: 1
    min-width: 0
    padding: 6px 8px
    border: 1px solid #555
    background: #101010
    color: white
    font-size: 0.8rem

  button
    width: auto !important
    padding: 6px 10px !important
    border: 1px solid #555 !important
    font-size: 0.75rem !important

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
