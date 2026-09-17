<template>
  <div id="app">
    <LegacyModalMounts />
    <NotificationsToaster />

    <RouterView
      v-if="authStore.ready"
      v-slot="{ Component }"
    >
      <transition
        name="page-fade"
        mode="out-in"
      >
        <AppShell v-if="showShell">
          <component :is="Component" />
        </AppShell>
        <component
          :is="Component"
          v-else
        />
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
    --font-body: Arial, Helvetica, system-ui, sans-serif
    --font-display: Arial, Helvetica, system-ui, sans-serif
    --color-bg-1: #141414
    --color-bg-2: #141414
    --color-bg-3: #141414
    --color-surface: #1c1c1c
    --color-surface-hover: #292929
    --color-surface-strong: #262626
    --color-surface-glass: rgba(20, 20, 20, 0.95)
    --color-surface-card: #202020
    --color-text: #f5f5f1
    --color-text-muted: #bcbcbc
    --color-text-faint: #999999
    --color-brand-turquoise: #68e0dc
    --color-brand-blue: #096f93
    --color-brand-orange: #f15a24
    --color-brand-coral: #ff734d
    --color-accent: var(--color-brand-orange)
    --color-accent-strong: var(--color-brand-coral)
    --color-accent-soft: rgba(241, 90, 36, 0.18)
    --color-accent-glow: rgba(241, 90, 36, 0.22)
    --color-border: rgba(255, 255, 255, 0.12)
    --color-border-strong: rgba(255, 255, 255, 0.3)
    --color-shadow: rgba(0, 0, 0, 0.7)
    --color-shadow-soft: rgba(0, 0, 0, 0.4)
    --radius-sm: 4px
    --radius-md: 6px
    --radius-lg: 8px
    --shadow-soft: 0 8px 24px var(--color-shadow-soft)
    --shadow-strong: 0 16px 48px var(--color-shadow)
    --glass-blur: blur(16px)
    --page-gutter: clamp(20px, 4vw, 80px)

  *, *::before, *::after
    box-sizing: border-box

  html, body
    font-family: var(--font-body)
    color: var(--color-text)
    background-color: var(--color-bg-3)
    letter-spacing: 0.01em
    margin: 0
    padding: 0
    overflow-x: hidden

  /* Custom sleek scrollbars */
  ::-webkit-scrollbar
    width: 8px
    height: 8px

  ::-webkit-scrollbar-track
    background: rgba(10, 8, 10, 0.6)

  ::-webkit-scrollbar-thumb
    background: rgba(255, 255, 255, 0.15)
    border-radius: 999px

  ::-webkit-scrollbar-thumb:hover
    background: var(--color-accent-soft)

  a
    color: inherit
    text-decoration: none

  button, input, select, textarea
    font-family: var(--font-body)

  input, select, textarea
    background-color: rgba(255, 255, 255, 0.07)
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    color: var(--color-text)
    padding: 10px 14px
    transition: all 0.2s ease

    &:focus
      outline: none
      border-color: var(--color-accent)
      box-shadow: 0 0 16px var(--color-accent-glow)
      background-color: rgba(255, 255, 255, 0.12)

  .container
    max-width: 1480px
    margin: 0 auto
    padding: 0 28px
    width: 100%

  .system-notification
    background: #202020 !important
    padding: 12px 16px
    border: 1px solid var(--color-border-strong)
    border-radius: var(--radius-md)
    box-shadow: var(--shadow-strong)
    margin-bottom: 8px
    backdrop-filter: var(--glass-blur)

    .notification-title
      font-size: 0.9em
      font-weight: 700
      color: var(--color-accent-strong)

    .notification-content
      font-size: 0.95em
      color: var(--color-text-muted)

  #app
    background: var(--color-bg-1)
    min-height: 100vh
    color: var(--color-text)

  :focus-visible
    outline: 2px solid white
    outline-offset: 4px

  select
    color-scheme: dark

  @media (prefers-reduced-motion: reduce)
    *, *::before, *::after
      animation-duration: 0.01ms !important
      transition-duration: 0.01ms !important
      scroll-behavior: auto !important

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
    background: rgba(8, 6, 8, 0.75)
    backdrop-filter: blur(10px)

  .legacy-modal-box
    background: var(--color-surface-card) !important
    color: var(--color-text)
    border: 1px solid var(--color-border-strong) !important
    border-radius: var(--radius-lg) !important
    box-shadow: var(--shadow-strong) !important
    backdrop-filter: var(--glass-blur)
    overflow: hidden
    width: min(760px, calc(100vw - 32px))
    max-height: calc(100vh - 40px)

    h3
      font-family: var(--font-display)
      letter-spacing: 0.02em

    label
      color: var(--color-text-muted)

    .container
      padding: 24px

    .body
      padding: 0

    .heading
      margin: -24px -24px 20px

    .heading h3
      margin: 0
      padding: 20px 24px

    .footer
      margin: 20px -24px -24px
      padding: 16px 24px
      background: rgba(12, 10, 12, 0.4)
      border-top: 1px solid var(--color-border)

  ul
    margin: 0
    padding: 0

  /* Page Transition Animations */
  .page-fade-enter-active, .page-fade-leave-active
    transition: opacity 0.25s ease, transform 0.25s ease

  .page-fade-enter-from
    opacity: 0
    transform: translateY(8px)

  .page-fade-leave-to
    opacity: 0
    transform: translateY(-8px)
</style>
