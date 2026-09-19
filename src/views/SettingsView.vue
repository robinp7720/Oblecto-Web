<template>
  <div class="settings-layout">
    <aside class="settings-nav">
      <label for="settings-search">{{ t('settings.search.label') }}</label>
      <input
        id="settings-search"
        v-model="query"
        type="search"
        class="settings-search"
        :placeholder="t('settings.search.placeholder')"
        @keydown.esc="query = ''"
      >
      <div
        v-if="query.trim()"
        class="settings-search-results"
        aria-live="polite"
      >
        <p v-if="!results.length">
          {{ t('settings.search.empty') }}
        </p>
        <RouterLink
          v-for="result in results"
          :key="result.name + result.anchor"
          :to="{ name: result.name, hash: result.anchor ? '#' + result.anchor : '' }"
          @click="query = ''"
        >
          {{ result.label }}
        </RouterLink>
      </div>
      <div class="settings-section-picker">
        <label for="settings-section">{{ t('settings.sectionPicker') }}</label>
        <select
          id="settings-section"
          :value="route.name"
          @change="$router.push({ name: $event.target.value })"
        >
          <optgroup
            v-for="group in navGroups"
            :key="group.id"
            :label="group.label"
          >
            <option
              v-for="item in group.items"
              :key="item.name"
              :value="item.name"
            >
              {{ item.label }}
            </option>
          </optgroup>
        </select>
      </div>
      <nav
        class="nav-scroller"
        :aria-label="t('settings.sectionNav')"
      >
        <div
          v-for="group in navGroups"
          :key="group.id"
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
      <Transition
        name="fade"
        mode="out-in"
      >
        <header
          :key="route.name"
          class="panel-header"
        >
          <p class="eyebrow">
            {{ current.eyebrow }}
          </p>
          <h1>{{ current.label }}</h1>
          <p
            v-if="current.description"
            class="panel-description"
          >
            {{ current.description }}
          </p>
        </header>
      </Transition>

      <RouterView v-slot="{ Component }">
        <Transition
          name="rise"
          mode="out-in"
          @after-leave="pageLeft"
          @after-enter="focusSetting(route.hash)"
        >
          <component
            :is="Component"
            :key="route.name"
          />
        </Transition>
      </RouterView>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { pages, settingsFields, focusSetting, visibleGroups } from '@/components/settings/registry'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { pageLeft } from '@/router/transition'

// Grouped by what an operator is trying to do, so the sidebar reads as a few
// short lists rather than ten equally-weighted cards. The description is the
// single source for each page's header, so child components no longer have to
// invent their own title treatment. Only pages the user may use are listed.

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const query = ref('')

const describe = item => ({
  ...item,
  label: t(`settings.pages.${item.name}.label`),
  description: t(`settings.pages.${item.name}.description`)
})

const navGroups = computed(() => visibleGroups(authStore.can).map(group => ({
  ...group,
  label: t(`settings.groups.${group.id}`),
  items: group.items.map(describe)
})))

const navItems = computed(() => navGroups.value.flatMap(group => group.items))

const results = computed(() => {
  const terms = query.value.toLowerCase().trim().split(/\s+/)
  const allowed = new Set(navItems.value.map(item => item.name))
  const fields = settingsFields.filter(field => allowed.has(field.name))

  return [...navItems.value, ...fields].filter(item => terms.every(term => `${item.label} ${item.description || ''} ${item.keywords || ''}`.toLowerCase().includes(term)))
})
watch(() => route.fullPath, async () => {
  await nextTick()
  const nav = document.querySelector('.nav-scroller')
  const active = nav?.querySelector('.router-link-exact-active')
  if (active && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft += active.getBoundingClientRect().left - nav.getBoundingClientRect().left
  }
  focusSetting(route.hash)
}, { immediate: true, flush: 'post' })

const current = computed(() => {
  const page = pages.find(item => item.name === route.name)

  if (!page) return { eyebrow: '', label: t('menu.settings'), description: '' }

  return {
    ...describe(page),
    eyebrow: t(page.group === 'account' ? 'settings.eyebrow.account' : 'settings.eyebrow.server')
  }
})
</script>

<style scoped lang="sass">
.settings-layout
  display: grid
  grid-template-columns: 220px minmax(0, 1fr)
  gap: 32px
  align-items: start

.settings-nav
  position: sticky
  max-height: calc(100dvh - 100px)
  overflow-y: auto
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

  &.router-link-exact-active
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
    max-height: none
    overflow-y: visible
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

    &.router-link-exact-active
      border-color: var(--color-accent)
      background: var(--color-accent-soft)

  .panel-header h1
    font-size: 1.4rem
</style>
