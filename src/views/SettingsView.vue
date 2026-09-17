<template>
  <div class="settings-layout">
    <aside class="settings-nav">
      <nav
        class="nav-scroller"
        aria-label="Settings sections"
      >
        <div
          v-for="group in groups"
          :key="group.label"
          class="nav-group"
        >
          <h2 class="nav-group-label">
            {{ group.label }}
          </h2>
          <RouterLink
            v-for="item in group.items"
            :key="item.name"
            :to="{ name: item.name }"
            class="settings-link"
            :aria-current="item.name === route.name ? 'page' : undefined"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>
    </aside>

    <section class="settings-panel">
      <header class="panel-header">
        <p class="eyebrow">
          Server settings
        </p>
        <h1>{{ current.label }}</h1>
        <p
          v-if="current.description"
          class="panel-description"
        >
          {{ current.description }}
        </p>
      </header>

      <RouterView />
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Grouped by what an operator is trying to do, so the sidebar reads as four
// short lists rather than ten equally-weighted cards. The description is the
// single source for each page's header, so child components no longer have to
// invent their own title treatment.
const groups = [
  {
    label: 'Server',
    items: [
      {
        name: 'SettingsMaintenance',
        label: 'Maintenance',
        description: 'Run indexing, cleanup, artwork and metadata jobs on demand.'
      },
      {
        name: 'ServerStatus',
        label: 'Status',
        description: 'Live streaming sessions and the clients currently connected.'
      },
      {
        name: 'ProblematicFiles',
        label: 'Problem files',
        description: 'Files the indexer could not read, with the error it hit and a way to retry.'
      }
    ]
  },
  {
    label: 'Library',
    items: [
      {
        name: 'SettingsLibraries',
        label: 'Libraries',
        description: 'The folders Oblecto scans, and how each library identifies and updates its titles.'
      },
      {
        name: 'SettingsSets',
        label: 'Sets',
        description: 'Collections that group movies or TV shows together.'
      },
      {
        name: 'IndexerSettings',
        label: 'Indexer',
        description: 'When scans and cleanups run, and which file extensions count as video.'
      },
      {
        name: 'ArtworkSettings',
        label: 'Artwork',
        description: 'Where posters, fanart and banners come from, and the sizes kept on disk.'
      }
    ]
  },
  {
    label: 'Access',
    items: [
      {
        name: 'SettingsUsers',
        label: 'Users',
        description: 'Accounts that can sign in to this server.'
      }
    ]
  },
  {
    label: 'Network',
    items: [
      {
        name: 'FederationSettings',
        label: 'Federation',
        description: 'Share libraries and streaming capacity with other Oblecto servers.'
      },
      {
        name: 'SeedboxSettings',
        label: 'Seedboxes',
        description: 'Remote hosts Oblecto imports finished downloads from.'
      }
    ]
  }
]

const route = useRoute()

const items = groups.flatMap(group => group.items)

const current = computed(() => (
  items.find(item => item.name === route.name) || { label: 'Settings', description: '' }
))
</script>

<style scoped lang="sass">
.settings-layout
  display: grid
  grid-template-columns: 220px minmax(0, 1fr)
  gap: 32px
  align-items: start

.settings-nav
  position: sticky
  // Clears the sticky app header.
  top: calc(76px + 24px)

.nav-group
  margin-bottom: 22px

  &:last-child
    margin-bottom: 0

.nav-group-label
  margin: 0 0 8px 12px
  color: var(--color-text-faint)
  font-size: 0.68rem
  font-weight: 700
  letter-spacing: 0.14em
  text-transform: uppercase

.settings-link
  display: block
  padding: 9px 12px
  border-radius: var(--radius-sm)
  border-left: 2px solid transparent
  color: var(--color-text-muted)
  font-size: 0.9rem
  transition: color 0.15s, background-color 0.15s

  &:hover
    background: var(--color-surface)
    color: var(--color-text)

  &.router-link-active
    border-left-color: var(--color-accent)
    background: var(--color-surface)
    color: var(--color-text)
    font-weight: 600

.settings-panel
  min-width: 0

.panel-header
  margin-bottom: 24px

  h1
    margin: 6px 0 0
    font-family: var(--font-display)
    font-size: 1.7rem
    line-height: 1.15

.eyebrow
  margin: 0
  color: var(--color-text-faint)
  font-size: 0.68rem
  font-weight: 700
  letter-spacing: 0.14em
  text-transform: uppercase

.panel-description
  max-width: 68ch
  margin: 8px 0 0
  color: var(--color-text-muted)
  line-height: 1.6

// Below the two-column breakpoint the sidebar becomes a horizontal strip that
// stays put while the panel scrolls, instead of ten stacked cards the user has
// to scroll past before reaching any actual setting.
@media screen and (max-width: 900px)
  .settings-layout
    // minmax(0, 1fr) rather than 1fr: an `auto` minimum would size the track to
    // the unwrapped nav strip and push it off the screen, where overflow-x on
    // the scroller can never reach it.
    grid-template-columns: minmax(0, 1fr)
    gap: 20px

  .settings-nav
    min-width: 0
    top: 0
    z-index: 1
    margin: 0 calc(-1 * var(--page-gutter))
    padding: 8px var(--page-gutter)
    background: var(--color-bg-1)
    border-bottom: 1px solid var(--color-border)

  .nav-scroller
    display: flex
    gap: 8px
    overflow-x: auto
    scrollbar-width: none

    &::-webkit-scrollbar
      display: none

  .nav-group
    display: flex
    gap: 8px
    margin: 0

  .nav-group-label
    display: none

  .settings-link
    flex-shrink: 0
    padding: 8px 14px
    border-left: 0
    border-radius: 999px
    border: 1px solid var(--color-border)
    white-space: nowrap

    &.router-link-active
      border-color: var(--color-accent)
      background: var(--color-accent-soft)

  .panel-header h1
    font-size: 1.4rem
</style>
