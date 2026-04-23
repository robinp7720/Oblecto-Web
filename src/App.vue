<template>
  <div id="app">
    <LegacyModalMounts />
    <NotificationsToaster />

    <RouterView v-if="authStore.ready" v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <AppShell v-if="showShell">
          <component :is="Component" />
        </AppShell>
        <component :is="Component" v-else />
      </transition>
    </RouterView>

    <playBar v-if="showShell" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import AppShell from '@/layouts/AppShell.vue'
import playBar from '@/components/playBar'
import { ScreenFormats } from '@/enums/ScreenFormats'
import NotificationsToaster from '@/components/system/NotificationsToaster.vue'
import LegacyModalMounts from '@/components/system/LegacyModalMounts.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const store = useStore()
const authStore = useAuthStore()

const showShell = computed(() => authStore.isAuthenticated && route.meta.layout !== 'auth')
const playing = computed(() => store.state.playing)
const playSizeFormat = computed(() => store.state.playSizeFormat)

watch([playing, playSizeFormat], () => {
  if (playSizeFormat.value === ScreenFormats.LARGE && playing.value?.entity) {
    document.body.style.overflow = 'hidden'
    return
  }

  document.body.style.overflow = 'auto'
}, { immediate: true })
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

    padding: 20px 24px 120px

    min-height: 100vh

    color: var(--color-text)

    @media screen and (max-width: 700px)
      padding: 16px 16px 120px

  .legacy-modal-shell
    position: fixed
    inset: 0
    z-index: 60
    display: grid
    place-items: center
    padding: 20px

  .legacy-modal-overlay
    position: fixed
    inset: 0
    background: rgba(10, 8, 12, 0.6)
    backdrop-filter: blur(6px)

  .legacy-modal-box
    background: var(--color-surface-card) !important
    color: var(--color-text)
    border: 1px solid var(--color-border) !important
    border-radius: var(--radius-lg) !important
    box-shadow: var(--shadow-strong) !important
    overflow: hidden
    width: min(760px, calc(100vw - 32px))
    max-height: calc(100vh - 40px)
    overflow: auto

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
      padding-top: 16px

  ul
    margin: 0
    padding: 0

  .fade-enter-active, .fade-leave-active
    transition: opacity .2s ease

  .fade-enter-from, .fade-leave-to
    opacity: 0
</style>
