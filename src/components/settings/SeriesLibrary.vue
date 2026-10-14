<template>
  <div class="series-library">
    <nav
      aria-label="Library workspace"
      class="workspace-breadcrumbs"
    >
      <RouterLink :to="{ name: 'SettingsLibraries' }">
        Libraries
      </RouterLink>
      <span aria-hidden="true">/</span>
      <RouterLink :to="{ name: 'Library', params: { mediaType: 'series' } }">
        TV Shows
      </RouterLink>
    </nav>
    <p
      v-if="loading"
      role="status"
    >
      Loading episode matching…
    </p>
    <div
      v-else-if="error"
      role="alert"
      class="workspace-notice"
    >
      <p>Episode matching couldn’t be loaded.</p>
      <button
        class="detail-button secondary"
        @click="reload"
      >
        Try again
      </button>
    </div>
    <template v-else-if="data">
      <div class="workspace-heading">
        <div>
          <h1>{{ data.series.seriesName }}</h1>
          <p>Episode matching</p>
        </div>
        <RouterLink
          class="detail-button secondary"
          :to="{ name: 'SeriesView', params: { seriesId: data.series.id } }"
        >
          Back to series
        </RouterLink>
      </div>
      <div
        v-if="data.unavailable || !data.catalogAvailable"
        class="workspace-notice"
        role="status"
      >
        <p>{{ data.catalogAvailable ? 'TMDB couldn’t be refreshed. Showing the last complete catalogue; dates and availability may have changed.' : 'No TMDB catalogue is available. Library episodes can’t be checked for completeness.' }}</p>
        <button
          class="detail-button secondary"
          @click="reload"
        >
          Try again
        </button>
      </div>
      <div class="matching-summary">
        <strong>{{ matchedCount }} library {{ matchedCount === 1 ? 'episode' : 'episodes' }} matched by ID</strong>
        <p>Local numbering is preserved. TMDB may group seasons differently. Specials are counted separately.</p>
        <small v-if="data.catalogUpdatedAt">TMDB catalogue checked {{ formatDate(data.catalogUpdatedAt) }}</small>
      </div>
      <div class="workspace-controls">
        <div
          class="match-filters"
          role="group"
          aria-label="Episode matching filter"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :aria-pressed="filter === tab.value"
            @click="setFilter(tab.value)"
          >
            {{ tab.label }} <span>{{ regular.filter(row => row.status === tab.value).length }}</span>
          </button>
        </div>
        <button
          v-if="auth.preferences.episodeSpoilers === 'hide-titles'"
          class="reveal-titles"
          :aria-pressed="revealTitles"
          @click="revealTitles = !revealTitles"
        >
          {{ revealTitles ? 'Hide episode titles' : 'Show episode titles' }}
        </button>
      </div>
      <p
        v-if="filter === 'absent'"
        class="filter-note"
      >
        Aired entries in this TMDB snapshot with no matching library ID. Future and undated episodes are listed separately.
      </p>
      <p
        v-if="filter === 'review'"
        class="filter-note"
      >
        These entries need matching or have no playable file. Unresolved local episodes prevent a reliable absence check.
      </p>
      <div
        class="match-columns"
        aria-hidden="true"
      >
        <span>Episode</span><span>Library</span><span>TMDB</span><span>Match</span>
      </div>
      <div
        class="match-results"
        aria-live="polite"
      >
        <EpisodeMatchRow
          v-for="row in filtered"
          :key="row.key"
          :row="row"
          :hide-titles="hideTitles"
        />
        <p
          v-if="!filtered.length"
          class="empty-matches"
        >
          {{ emptyText }}
        </p>
      </div>
      <details
        v-if="future.length"
        class="secondary-catalogue"
      >
        <summary>Upcoming &amp; unannounced · {{ future.length }} catalogue {{ future.length === 1 ? 'entry' : 'entries' }}</summary>
        <EpisodeMatchRow
          v-for="row in future"
          :key="row.key"
          :row="row"
          :hide-titles="hideTitles"
        />
      </details>
      <details
        v-if="specials.length"
        class="secondary-catalogue"
      >
        <summary>Specials · {{ specials.length }} {{ specials.length === 1 ? 'entry' : 'entries' }}</summary>
        <p class="filter-note">
          Specials are excluded from regular episode totals.
        </p>
        <EpisodeMatchRow
          v-for="row in specials"
          :key="row.key"
          :row="row"
          :hide-titles="hideTitles"
        />
      </details>
    </template>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import oblectoClient from '@/oblectoClient'
import { useAuthStore } from '@/stores/auth'
import { useMediaStore } from '@/stores/media'
import { useDetailResource } from '@/composables/useMediaDetails'
import { usePageTitle } from '@/composables/usePageTitle'
import { formatDate } from '@/utils/media'
import EpisodeMatchRow from '@/components/details/EpisodeMatchRow.vue'
import '@/assets/sass/details.sass'
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const media = useMediaStore()
const revealTitles = ref(false)
watch([() => route.params.seriesId, () => media.epoch, () => auth.preferences.episodeSpoilers], () => { revealTitles.value = false })
const hideTitles = computed(() => auth.preferences.episodeSpoilers === 'hide-titles' && !revealTitles.value)
const { data, loading, error, reload } = useDetailResource(
  () => auth.can('libraries.manage') ? route.params.seriesId : null,
  id => oblectoClient.seriesLibrary.getLibrary(id), null,
  value => value?.series && Array.isArray(value.rows)
)
usePageTitle(() => data.value ? `${data.value.series.seriesName} · Library tools` : 'Library tools')
const tabs = [{ value: 'matched', label: 'Matched' }, { value: 'absent', label: 'Not in library' }, { value: 'review', label: 'Needs review' }]
const filter = computed(() => tabs.some(tab => tab.value === route.query.match) ? route.query.match : 'matched')
function setFilter (value) { router.replace({ query: { ...route.query, match: value } }) }
const regular = computed(() => (data.value?.rows || []).filter(row => !row.special))
const specials = computed(() => (data.value?.rows || []).filter(row => row.special))
const future = computed(() => regular.value.filter(row => ['upcoming', 'unscheduled'].includes(row.status)))
const matchedCount = computed(() => regular.value.filter(row => row.local && row.catalog).length)
const filtered = computed(() => regular.value.filter(row => row.status === filter.value))
const emptyText = computed(() => ({ matched: 'No playable episodes matched by ID.', absent: 'No confirmed absent episodes in this snapshot.', review: 'No episodes need review.' })[filter.value])
</script>
<style scoped lang="sass">
.series-library
  max-width: 1120px
.workspace-breadcrumbs
  display: flex
  flex-wrap: wrap
  gap: 12px
  font-size: .8rem
  color: var(--color-text-muted)
.workspace-heading
  display: flex
  align-items: center
  justify-content: space-between
  flex-wrap: wrap
  gap: 16px
  margin: 24px 0 32px
  h1
    font-family: var(--font-display)
    font-size: clamp(1.5rem, 3vw, 2rem)
    margin: 0 0 8px
    overflow-wrap: anywhere
  p
    margin: 0
    color: var(--color-text-muted)
.matching-summary
  padding: 20px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-md)
  strong
    font-size: 1.05rem
  p, small
    color: var(--color-text-muted)
    line-height: 1.6
  p
    margin: 8px 0
    font-size: .85rem
.workspace-controls
  display: flex
  justify-content: space-between
  flex-wrap: wrap
  gap: 16px
  margin: 28px 0 16px
.match-filters
  display: flex
  flex-wrap: wrap
  gap: 8px
  button
    min-height: 44px
    padding: 10px 14px
    background: transparent
    border: 1px solid var(--color-border)
    border-radius: var(--radius-sm)
    color: var(--color-text-muted)
    cursor: pointer
    &[aria-pressed=true]
      background: var(--color-surface)
      border-color: var(--color-brand-turquoise)
      color: var(--color-text)
    span
      margin-left: 8px
      font-variant-numeric: tabular-nums
.reveal-titles
  border: 0
  background: none
  color: var(--color-text-muted)
  cursor: pointer
.match-columns
  display: grid
  grid-template-columns: minmax(0, 1fr) 85px 85px 125px
  gap: 16px
  padding: 14px 12px
  border-bottom: 1px solid var(--color-border)
  color: var(--color-text-muted)
  font-size: .75rem
.empty-matches
  padding: 24px 12px
  color: var(--color-text-muted)
.secondary-catalogue
  border-top: 1px solid var(--color-border)
  margin-top: 24px
  > summary
    padding: 20px 0
    cursor: pointer
    color: var(--color-text-muted)
.filter-note, .workspace-notice
  color: var(--color-text-muted)
  font-size: .85rem
  line-height: 1.6
.workspace-notice
  padding: 16px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  margin-bottom: 20px
@media (max-width: 650px)
  .match-columns
    display: none
  .match-filters button
    padding: 10px
</style>
