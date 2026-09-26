<template>
  <div id="app">
    <ConfirmDialog />

    <RouterView
      v-if="authStore.ready"
      v-slot="{ Component, route: viewRoute }"
    >
      <!-- The outer transition only swaps between the sign-in screen and the
           app; the inner one moves between pages while the header and footer
           stay put. -->
      <Transition
        name="page-fade"
        mode="out-in"
        @after-leave="pageLeft"
      >
        <AppShell
          v-if="showShell"
          key="shell"
        >
          <!-- A card transition animates the page change itself, so this
               one swaps instantly while it runs. -->
          <Transition
            name="page-fade"
            :mode="cardTransitionActive ? 'default' : 'out-in'"
            :css="!cardTransitionActive"
            @after-leave="pageLeft"
          >
            <component
              :is="Component"
              :key="pageKey(viewRoute)"
            />
          </Transition>
        </AppShell>
        <component
          :is="Component"
          v-else
          key="bare"
        />
      </Transition>
    </RouterView>

    <PlayerRoot v-if="showShell" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import AppShell from '@/layouts/AppShell.vue'
import PlayerRoot from '@/components/player/PlayerRoot.vue'
import { ScreenFormats } from '@/enums/ScreenFormats'
import ConfirmDialog from '@/components/system/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { cardTransitionActive, pageKey, pageLeft } from '@/router/transition'

const route = useRoute()
const store = useAppStore()
const authStore = useAuthStore()

const showShell = computed(() => authStore.isAuthenticated && route.meta.layout !== 'auth')
const playing = computed(() => store.playing)
const playSizeFormat = computed(() => store.playSizeFormat)

// Both immersive modes lock the page. FULLSCREEN was previously left out, so
// the page scrolled behind the video whenever a gesture ran past the stage.
watch([playing, playSizeFormat], () => {
  const immersive = playSizeFormat.value === ScreenFormats.LARGE ||
    playSizeFormat.value === ScreenFormats.FULLSCREEN

  const locked = immersive && Boolean(playing.value?.entity)

  // Restore to '' rather than 'auto' so the stylesheet default wins back.
  document.body.style.overflow = locked ? 'hidden' : ''
  document.documentElement.style.overflow = locked ? 'hidden' : ''
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
    --safe-top: env(safe-area-inset-top, 0px)
    --safe-right: env(safe-area-inset-right, 0px)
    --safe-bottom: env(safe-area-inset-bottom, 0px)
    --safe-left: env(safe-area-inset-left, 0px)
    --control-size: 44px
    --control-size-lg: 64px
    --color-scrim-strong: rgba(0, 0, 0, 0.85)
    --color-scrim-soft: rgba(0, 0, 0, 0.35)
    --player-scrim: linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.5) 42%, rgba(0, 0, 0, 0) 100%)
    --player-scrim-top: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)
    /* Stacking order, in one place. .player-root owns a stacking context, so
       every player child stays below 10 and only this scale decides layering.
       Dialogs are deliberately absent: <dialog>.showModal() puts them in the
       browser's top layer, above every z-index on this scale. */
    --z-player-mini: 45
    --z-header: 50
    --z-player: 55
    --z-skip-link: 70
    /* Raised by the player only while the mini-player is docked, so pages do not
       reserve dead space when nothing is playing. */
    --mini-player-reserve: 0px
    /* How much of the top of the viewport the sticky app header covers, for
       anything else that sticks below it. On phones the header is three rows
       tall, too much to pin, so it scrolls away there (AppShell.vue). */
    --header-offset: 76px

  @media (max-width: 760px)
    :root
      --header-offset: 0px

  *, *::before, *::after
    box-sizing: border-box

  html, body
    font-family: var(--font-body)
    color: var(--color-text)
    background-color: var(--color-bg-3)
    letter-spacing: 0.01em
    margin: 0
    padding: 0
    /* clip, not hidden: hidden makes <body> a scroll container that never
       scrolls, and every position: sticky inside it (the header, the settings
       sidebar) then sticks to nothing. hidden stays as the fallback for
       browsers without clip. */
    overflow-x: hidden
    overflow-x: clip

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

  /* Dialogs live in the browser's top layer, so the page behind them must be
     told to stop scrolling explicitly. */
  html.has-open-dialog,
  html.has-open-dialog body
    overflow: hidden

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
      animation-delay: 0s !important
      transition-duration: 0.01ms !important
      scroll-behavior: auto !important

  ul
    margin: 0
    padding: 0
</style>
