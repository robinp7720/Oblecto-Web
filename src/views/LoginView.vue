<template>
  <section class="login-page">
    <div class="login-panel">
      <div class="panel-copy">
        <span class="eyebrow">Oblecto</span>
        <h1>Browse your library like a curated screening room.</h1>
        <p>
          This refresh keeps the Oblecto backend intact while giving the web app a faster
          discovery flow, cleaner routing, and a better playback handoff.
        </p>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <label>
          Host
          <input v-model="host" type="text" />
        </label>
        <label>
          Username
          <input v-model="credentials.username" type="text" autocomplete="username" />
        </label>
        <label>
          Password
          <input v-model="credentials.password" type="password" autocomplete="current-password" />
        </label>

        <button type="submit" :disabled="authStore.loggingIn">
          {{ authStore.loggingIn ? 'Signing In…' : 'Enter Oblecto' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { getCurrentInstance, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const store = useStore()
const authStore = useAuthStore()
const vm = getCurrentInstance()

const credentials = reactive({
  username: '',
  password: ''
})

const host = ref(store.state.host || '')

async function submit () {
  try {
    store.dispatch('updateHost', host.value)
    window.localStorage.setItem('oblecto.host', host.value)
    vm?.appContext.config.globalProperties.$reconnectSocket?.(host.value)

    await authStore.login(credentials)

    if (vm?.appContext.config.globalProperties.$socket) {
      vm.appContext.config.globalProperties.$socket.emit('authenticate', {
        token: window.localStorage.getItem('oblecto.accessToken')
      })
    }

    router.replace(String(route.query.redirect || '/'))
  } catch (error) {
    vm?.appContext.config.globalProperties.$notify({
      title: 'Login failed',
      text: 'Unable to authenticate with the current Oblecto host.',
      type: 'error'
    })
  }
}
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
  border-radius: 32px
  background: rgba(28, 23, 26, 0.82)
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
  letter-spacing: 0.18em
  color: var(--color-accent-strong)

.login-form
  display: grid
  gap: 14px
  padding: 24px
  border-radius: 24px
  background: rgba(255, 255, 255, 0.04)
  border: 1px solid rgba(255, 255, 255, 0.08)

  label
    display: grid
    gap: 8px
    color: var(--color-text-muted)

  button
    margin-top: 10px
    min-height: 50px
    border-radius: 999px
    border: none
    background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong))
    color: #1b1616
    font-weight: 800
    cursor: pointer

@media screen and (max-width: 900px)
  .login-panel
    grid-template-columns: 1fr
</style>
