<template>
  <div class="settings-layout">
    <aside class="settings-nav">
      <div class="settings-header">
        <h2>Server Settings</h2>
        <p>Configure server, libraries, and indexers</p>
      </div>

      <div class="nav-group">
        <RouterLink
          v-for="item in items"
          :key="item.to.name"
          :to="item.to"
          class="settings-link"
        >
          <div class="link-info">
            <span class="eyebrow">{{ item.eyebrow }}</span>
            <strong>{{ item.label }}</strong>
          </div>
          <span class="chevron">›</span>
        </RouterLink>
      </div>
    </aside>

    <section class="settings-panel">
      <RouterView />
    </section>
  </div>
</template>

<script setup>
const items = [
  { label: 'Maintenance', eyebrow: 'System', to: { name: 'SettingsMaintenance' } },
  { label: 'Users', eyebrow: 'Access', to: { name: 'SettingsUsers' } },
  { label: 'Libraries', eyebrow: 'Media', to: { name: 'SettingsLibraries' } },
  { label: 'Sets', eyebrow: 'Media', to: { name: 'SettingsSets' } },
  { label: 'Indexer', eyebrow: 'Metadata', to: { name: 'IndexerSettings' } },
  { label: 'Artwork', eyebrow: 'Metadata', to: { name: 'ArtworkSettings' } },
  { label: 'Federation', eyebrow: 'Network', to: { name: 'FederationSettings' } },
  { label: 'Seedboxes', eyebrow: 'Imports', to: { name: 'SeedboxSettings' } },
  { label: 'Problem Files', eyebrow: 'Integrity', to: { name: 'ProblematicFiles' } },
  { label: 'Status', eyebrow: 'Runtime', to: { name: 'ServerStatus' } }
]
</script>

<style scoped lang="sass">
.settings-layout
  display: grid
  grid-template-columns: 280px minmax(0, 1fr)
  gap: 28px

.settings-nav
  display: grid
  gap: 20px
  align-content: start

.settings-header
  padding: 8px 4px

  h2
    margin: 0
    font-family: var(--font-display)
    font-size: 1.6rem

  p
    margin: 4px 0 0
    color: var(--color-text-faint)
    font-size: 0.85rem

.nav-group
  display: grid
  gap: 8px

.settings-link
  display: flex
  align-items: center
  justify-content: space-between
  padding: 16px 20px
  border-radius: var(--radius-md)
  background: var(--color-surface)
  border: 1px solid var(--color-border)
  backdrop-filter: var(--glass-blur)
  transition: all 0.2s ease

  &:hover
    background: var(--color-surface-hover)
    border-color: var(--color-border-strong)

  &.router-link-active
    border-color: var(--color-accent)
    background: rgba(242, 139, 56, 0.12)
    box-shadow: 0 4px 16px rgba(242, 139, 56, 0.15)

    .eyebrow
      color: var(--color-accent-strong)

.link-info
  display: grid
  gap: 2px

  strong
    font-size: 0.95rem
    color: var(--color-text)

.chevron
  font-size: 1.3rem
  color: var(--color-text-faint)

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.14em
  color: var(--color-text-faint)
  font-size: 0.7rem
  font-weight: 700

.settings-panel
  min-width: 0
  padding: 32px
  border-radius: var(--radius-lg)
  background: var(--color-surface)
  border: 1px solid var(--color-border)
  backdrop-filter: var(--glass-blur)
  box-shadow: var(--shadow-soft)

@media screen and (max-width: 980px)
  .settings-layout
    grid-template-columns: 1fr
</style>

