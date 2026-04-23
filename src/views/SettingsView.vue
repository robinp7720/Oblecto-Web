<template>
  <div class="settings-layout">
    <aside class="settings-nav">
      <RouterLink v-for="item in items" :key="item.to.name" :to="item.to" class="settings-link">
        <span class="eyebrow">{{ item.eyebrow }}</span>
        <strong>{{ item.label }}</strong>
      </RouterLink>
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
  gap: 22px

.settings-nav
  display: grid
  gap: 12px
  align-content: start

.settings-link
  display: grid
  gap: 6px
  padding: 18px
  border-radius: 20px
  background: rgba(30, 25, 28, 0.72)
  border: 1px solid var(--color-border)

  &.router-link-active
    border-color: rgba(217, 129, 60, 0.45)
    background: rgba(217, 129, 60, 0.12)

.eyebrow
  text-transform: uppercase
  letter-spacing: 0.16em
  color: var(--color-text-faint)
  font-size: 0.74rem

.settings-panel
  min-width: 0
  padding: 24px
  border-radius: 24px
  background: rgba(30, 25, 28, 0.72)
  border: 1px solid var(--color-border)

@media screen and (max-width: 980px)
  .settings-layout
    grid-template-columns: 1fr
</style>
