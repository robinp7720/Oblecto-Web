<template>
  <section class="login-page">
    <div
      v-if="showPicker"
      class="login-panel picker-panel"
    >
      <div class="picker-copy">
        <BrandLogo />
        <h1>Who's watching?</h1>
      </div>

      <ul
        class="profile-list"
        aria-label="Profiles"
      >
        <li
          v-for="user in loginOptions.users"
          :key="user.id"
        >
          <button
            type="button"
            class="profile-tile"
            :class="{ selected: selectedUser?.id === user.id }"
            :disabled="authStore.loggingIn"
            :aria-pressed="selectedUser?.id === user.id"
            :data-user-id="user.id"
            @click="pickUser(user)"
          >
            <UserAvatar
              :user="user"
              :size="112"
            />
            <span class="profile-name">{{ user.name || user.username }}</span>
            <span
              v-if="signingInAs === user.id"
              class="profile-status"
            >Signing in…</span>
          </button>
        </li>
      </ul>

      <form
        v-if="selectedUser"
        class="picker-password"
        @submit.prevent="signInPicked"
      >
        <label>
          Password for {{ selectedUser.name || selectedUser.username }}
          <input
            ref="pickerPasswordInput"
            v-model="pickerPassword"
            type="password"
            autocomplete="current-password"
          >
        </label>
        <div class="picker-password-actions">
          <button
            type="button"
            class="secondary"
            @click="selectedUser = null"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="authStore.loggingIn"
          >
            {{ authStore.loggingIn ? 'Signing In…' : 'Sign In' }}
          </button>
        </div>
      </form>

      <p
        v-if="error"
        class="login-error"
        role="alert"
      >
        {{ error }}
      </p>

      <div class="picker-footer">
        <button
          type="button"
          class="link-button"
          @click="useForm"
        >
          Sign in with another account
        </button>
        <span
          v-if="host"
          class="picker-host"
        >Server: {{ host }}</span>
      </div>
    </div>

    <div
      v-else
      class="login-panel"
    >
      <div class="panel-copy">
        <BrandLogo />
        <h1>Your next great watch starts here.</h1>
        <p>
          All your movies and TV shows, in one place. Sign in and pick up where you left off.
        </p>
      </div>

      <p
        v-if="!optionsLoaded"
        class="login-loading"
      >
        Connecting…
      </p>

      <form
        v-else
        class="login-form"
        @submit.prevent="submit"
      >
        <div
          v-if="!editingHost"
          class="server-address"
        >
          <span>Server address: {{ host }}</span>
          <button
            type="button"
            @click="editingHost = true"
          >
            Change
          </button>
        </div>
        <label v-else>
          Server address
          <input
            v-model="host"
            type="text"
            @change="loadLoginOptions"
          >
        </label>
        <label>
          Username
          <input
            v-model="credentials.username"
            type="text"
            autocomplete="username"
            autocapitalize="off"
            spellcheck="false"
          >
        </label>
        <label>
          Password
          <input
            v-model="credentials.password"
            type="password"
            autocomplete="current-password"
          >
        </label>

        <p
          v-if="error"
          class="login-error"
          role="alert"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.loggingIn"
        >
          {{ authStore.loggingIn ? 'Signing In…' : 'Sign In' }}
        </button>

        <button
          v-if="hasProfiles"
          type="button"
          class="link-button"
          @click="formChosen = false; error = ''"
        >
          Back to profiles
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import BrandLogo from '@/components/system/BrandLogo.vue'
import UserAvatar from '@/components/system/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { describeError } from '@/composables/useSaveState'
import oblectoClient from '@/oblectoClient'

const router = useRouter()
const route = useRoute()
const store = useAppStore()
const authStore = useAuthStore()
const vm = getCurrentInstance()

const credentials = reactive({
  username: '',
  password: ''
})

const host = ref(store.host || '')
const error = ref(route.query.expired ? 'Your session has ended. Please sign in again.' : '')
const editingHost = ref(!host.value)

// The server only lists profiles to clients on its local network; anywhere
// else, or if the request fails, this stays empty and the form is shown.
const loginOptions = ref({ local: false, users: [] })
// Only the first load hides the form, so a server-address edit doesn't yank it away.
const optionsLoaded = ref(false)
const formChosen = ref(false)
const selectedUser = ref(null)
const pickerPassword = ref('')
const pickerPasswordInput = ref(null)
const signingInAs = ref(null)

const hasProfiles = computed(() => loginOptions.value.users.length > 0)
const showPicker = computed(() => hasProfiles.value && !formChosen.value)

function applyHost () {
  store.updateHost(host.value)
  window.localStorage.setItem('oblecto.host', host.value)
}

async function loadLoginOptions () {
  try {
    if (host.value) applyHost()

    const options = await oblectoClient.getLoginOptions()

    loginOptions.value = { local: Boolean(options?.local), users: Array.isArray(options?.users) ? options.users : [] }
  } catch (e) {
    // An older server without the endpoint, or an unreachable one: the form
    // still works, and reports the real problem when it is submitted.
    loginOptions.value = { local: false, users: [] }
  } finally {
    optionsLoaded.value = true
  }
}

async function signIn (credentials, displayName) {
  error.value = ''

  applyHost()

  await authStore.login(credentials, displayName)

  // Connect only once there is a token: the realtime server authenticates in
  // the handshake, so a socket opened before sign-in is simply refused.
  vm?.appContext.config.globalProperties.$reconnectSocket?.(host.value)

  router.replace(String(route.query.redirect || '/'))
}

function reportError (e, fallback, refused = 'Wrong username or password.') {
  // Shown next to the form that failed rather than in a corner toast that
  // vanishes before the user has finished reading it.
  console.error('Login failed', e)
  error.value = describeSignInError(e, fallback, refused)
}

// An unreachable server used to read as "Could not sign in with these
// details: Network Error", which sends people to retype a correct password.
function describeSignInError (e, fallback, refused) {
  const status = e?.response?.status

  if (!e?.response) return `Can't reach the server at ${host.value || 'this address'}. Check the address and that Oblecto is running.`
  if (status === 401) return refused
  // Throttling and missing fields already come with a sentence meant for people.
  if (status === 429 || status === 400) return describeError(e, fallback).replace(`${fallback}: `, '')
  if (status >= 500) return describeError(e, 'The server ran into a problem signing you in')

  return describeError(e, fallback)
}

async function submit () {
  try {
    await signIn({ ...credentials }, credentials.username)
  } catch (e) {
    reportError(e, 'Could not sign in with these details')
  }
}

async function pickUser (user) {
  error.value = ''

  if (!user.passwordless) {
    selectedUser.value = user
    pickerPassword.value = ''
    await nextTick()
    pickerPasswordInput.value?.focus()
    return
  }

  selectedUser.value = null
  signingInAs.value = user.id

  try {
    await signIn({ userId: user.id }, user.username)
  } catch (e) {
    // The server may have changed its mind (setting turned off since the list
    // was loaded); asking for the password is the useful way forward.
    selectedUser.value = user
    reportError(e, `Could not sign in as ${user.name || user.username}`)
  } finally {
    signingInAs.value = null
  }
}

async function signInPicked () {
  const user = selectedUser.value

  if (!user) return

  try {
    await signIn({ userId: user.id, password: pickerPassword.value }, user.username)
  } catch (e) {
    reportError(e, 'Could not sign in with this password', 'Wrong password.')
  }
}

function useForm () {
  formChosen.value = true
  selectedUser.value = null
  error.value = ''
}

onMounted(loadLoginOptions)

</script>

<style scoped lang="sass">
.login-page
  min-height: 100vh
  display: grid
  place-items: center
  padding: 32px

.login-panel
  width: min(1080px, 100%)
  display: grid
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 420px)
  gap: 28px
  padding: 34px
  border-radius: 8px
  background: #181818
  border: 1px solid var(--color-border)
  box-shadow: var(--shadow-strong)
  backdrop-filter: blur(14px)

.panel-copy
  padding: 18px

  h1
    font-family: var(--font-display)
    font-size: clamp(2.5rem, 6vw, 4.6rem)
    line-height: 0.95
    margin: 12px 0 18px

  p
    max-width: 42ch
    color: var(--color-text-muted)
    font-size: 1.05rem
    line-height: 1.6

.eyebrow
  text-transform: uppercase
  letter-spacing: -0.06em
  font-size: 2rem
  font-weight: 900
  color: var(--color-accent)

.login-loading
  align-self: center
  justify-self: center
  color: var(--color-text-muted)

.login-error
  margin: 0
  padding: 10px 12px
  border-radius: var(--radius-sm)
  background: rgba(217, 87, 87, 0.15)
  border: 1px solid rgba(217, 87, 87, 0.4)
  color: #ff8f7a
  font-size: 0.85rem
  line-height: 1.5

.login-form
  display: grid
  gap: 14px
  padding: 24px
  border-radius: 4px
  background: rgba(255, 255, 255, 0.04)
  border: 1px solid rgba(255, 255, 255, 0.08)

  label
    display: grid
    gap: 8px
    color: var(--color-text-muted)

  button
    margin-top: 10px
    min-height: 50px
    border-radius: 4px
    border: none
    background: var(--color-accent)
    color: #141414
    font-weight: 800
    cursor: pointer

.link-button, .login-form .link-button
  justify-self: center
  min-height: 0
  margin-top: 0
  padding: 6px 10px
  border: none
  background: none
  font-weight: 400
  color: var(--color-text-muted)
  text-decoration: underline
  text-underline-offset: 3px
  cursor: pointer

  &:hover, &:focus-visible
    color: var(--color-text, #fff)

@media screen and (max-width: 900px)
  .login-panel
    grid-template-columns: 1fr
</style>

<style scoped lang="sass">
// Profile picker: one column, tiles centred in a row that wraps.
.picker-panel
  grid-template-columns: 1fr
  justify-items: center
  gap: 32px
  padding: 48px 34px 34px
  text-align: center

.picker-copy h1
  font-family: var(--font-display)
  font-size: clamp(2rem, 5vw, 3.4rem)
  line-height: 1
  margin: 18px 0 0

.profile-list
  list-style: none
  margin: 0
  padding: 0
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 28px 24px
  // Wide enough for five tiles before wrapping onto the next row.
  max-width: 820px

.profile-tile
  display: grid
  justify-items: center
  gap: 12px
  width: 140px
  padding: 12px 8px
  border: none
  border-radius: 8px
  background: none
  color: var(--color-text-muted)
  cursor: pointer

  :deep(.user-avatar)
    outline: 3px solid transparent
    outline-offset: 3px
    transition: outline-color 0.15s, transform 0.15s

  &:hover, &:focus-visible, &.selected
    color: var(--color-text, #fff)

    :deep(.user-avatar)
      outline-color: var(--color-accent)
      transform: scale(1.04)

  &:focus-visible
    outline: none

  &:disabled
    cursor: progress

.profile-name
  max-width: 100%
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  font-weight: 700
  font-size: 1.05rem

.profile-status
  font-size: 0.8rem

.picker-password
  display: grid
  gap: 12px
  width: min(360px, 100%)
  text-align: left

  label
    display: grid
    gap: 8px
    color: var(--color-text-muted)

  input
    width: 100%

.picker-password-actions
  display: flex
  gap: 10px

  button
    flex: 1
    min-height: 46px
    border-radius: 4px
    border: none
    background: var(--color-accent)
    color: #141414
    font-weight: 800
    cursor: pointer

  .secondary
    background: rgba(255, 255, 255, 0.08)
    color: var(--color-text, #fff)

.picker-panel .login-error
  width: min(360px, 100%)

.picker-footer
  display: grid
  justify-items: center
  gap: 6px

.picker-host
  font-size: 0.8rem
  color: var(--color-text-muted)
  overflow-wrap: anywhere

@media (max-width: 600px)
  .picker-panel
    padding: 24px 0
  .profile-list
    gap: 18px 12px
  .profile-tile
    width: 112px
</style>

<style scoped lang="sass">
@media (max-width: 600px)
  .login-page
    padding: 20px
  .login-panel
    padding: 0
    border: 0
    background: transparent
    box-shadow: none
  .panel-copy
    padding: 0
  .login-form
    padding: 20px
    min-width: 0
    input
      width: 100%
      min-width: 0
</style>

<style scoped lang="sass">
.server-address
  overflow-wrap: anywhere
  color: var(--color-text-muted)
  button
    margin-left: 12px
    padding: 8px 14px
</style>
