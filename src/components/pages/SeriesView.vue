<template>
  <div class="detail-page">
    <div
      v-if="loading"
      class="detail-state"
      role="status"
    >
      Loading TV show…
    </div>
    <div
      v-else-if="error"
      class="detail-state"
      role="alert"
    >
      <h1>TV show unavailable</h1>
      <p>{{ error }}</p>
      <button
        class="detail-button"
        @click="reload"
      >
        Try again
      </button>
    </div>
    <template v-else-if="show">
      <MediaDetailHero
        type="series"
        :title="show.seriesName || 'Untitled show'"
        :subtitle="subtitle"
        :overview="show.overview || ''"
        :genres="normalizeGenres(show.genre || show.genres)"
        :backdrop="fanart"
        :fallback-backdrop="poster"
        :poster="poster"
        :back-to="{ name: 'Library', params: { mediaType: 'series' } }"
        back-label="TV Shows"
      >
        <PlaybackButton
          v-if="suggested"
          :label="suggested.label"
          @play="store.playEpisode(suggested.episode.id)"
        />
        <button
          v-if="suggested?.label.startsWith('Resume')"
          type="button"
          class="detail-button secondary"
          @click="store.playEpisode(suggested.episode.id, { position: 0 })"
        >
          Start over
        </button>
        <a
          href="#show-episodes"
          class="detail-button secondary"
        >Browse episodes</a>
      </MediaDetailHero>
      <div class="detail-body">
        <section
          id="show-episodes"
          class="detail-section episodes-section"
        >
          <div class="episodes-heading">
            <h2>Episodes</h2>
            <button
              type="button"
              class="find-toggle"
              :aria-expanded="filtersOpen"
              aria-controls="episode-filters"
              @click="filtersOpen = !filtersOpen"
            >
              {{ filtersOpen ? 'Close search' : filterActive ? 'Edit filters' : 'Find an episode' }}
            </button>
          </div>
          <div
            v-show="filtersOpen"
            id="episode-filters"
            class="episode-tools"
          >
            <label>
              <span>Find an episode</span>
              <input
                v-model="episodeQuery"
                type="search"
                placeholder="Title, synopsis, or S02E05"
              >
            </label>
            <label>
              <span>Watch state</span>
              <select v-model="watchedFilter">
                <option value="all">All episodes</option>
                <option value="unwatched">Unwatched</option>
                <option value="inprogress">In progress</option>
                <option value="watched">Watched</option>
              </select>
            </label>
          </div>
          <div
            v-if="filterActive"
            class="filter-summary"
            role="status"
          >
            <span>{{ filteredEpisodes.length }} {{ filteredEpisodes.length === 1 ? 'match' : 'matches' }} across all seasons</span>
            <button
              type="button"
              class="find-toggle"
              @click="clearEpisodeFilters"
            >
              Clear
            </button>
          </div>
          <nav
            v-if="visibleGroups.length >= 4"
            class="season-jumps"
            aria-label="Jump to season"
          >
            <a
              v-for="group in visibleGroups"
              :key="group.season"
              :href="`#${seasonAnchor(group.season)}`"
            >{{ seasonName(group.season) }}</a>
          </nav>
          <div
            v-if="relatedError"
            class="detail-notice"
            role="alert"
          >
            <p>We couldn’t load the episodes.</p>
            <button
              class="detail-button secondary"
              @click="reloadRelated"
            >
              Try again
            </button>
          </div>
          <p
            v-else-if="!relatedLoading && !episodes.length"
            class="detail-notice"
          >
            No episodes have been added to this show yet.
          </p>
          <p
            v-else-if="!relatedLoading && filterActive && !filteredEpisodes.length"
            class="detail-notice"
          >
            No episodes match these filters.
          </p>
          <p
            v-if="relatedLoading"
            role="status"
          >
            Loading episodes…
          </p>
          <div class="season-shelves">
            <MediaShelf
              v-for="group in visibleGroups"
              :id="seasonAnchor(group.season)"
              :key="group.season"
              class="season-shelf"
              :title="seasonName(group.season)"
              :subtitle="seasonDescription(group.season)"
              heading-tag="h3"
              type="episode"
              :items="group.episodes"
            >
              <template #item="{ item }">
                <EpisodeCard
                  :episode="item"
                  @watch-state="updateEpisodeWatch(item.id, $event)"
                />
              </template>
            </MediaShelf>
          </div>
        </section>
        <PeopleRow
          title="Cast"
          :credits="show.credits?.cast || []"
        />
        <PeopleRow
          v-if="creators.length"
          title="Created by"
          :credits="creators"
        />
        <p
          v-if="setsLoading"
          role="status"
        >
          Loading collections…
        </p>
        <div
          v-else-if="setsError"
          class="detail-notice"
          role="status"
        >
          {{ setsError }}
          <button
            class="detail-button secondary"
            @click="reloadSets"
          >
            Try again
          </button>
        </div>
        <MediaShelf
          v-for="set in collections"
          :key="set.id"
          class="detail-section"
          :title="set.setName"
          type="series"
          :items="set.Series || set.series"
        />
        <section
          v-if="metadata.length"
          class="detail-section"
        >
          <h2>About this show</h2>
          <dl class="detail-metadata">
            <div
              v-for="entry in metadata"
              :key="entry.label"
            >
              <dt>{{ entry.label }}</dt><dd>{{ entry.value }}</dd>
            </div>
          </dl>
        </section>
        <RelatedTitles
          :id="show.id"
          type="series"
        />
      </div>
    </template>
  </div>
</template>
<script setup>
import PlaybackButton from '@/components/remote/PlaybackButton.vue'
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import oblectoClient from '@/oblectoClient'
import MediaDetailHero from '@/components/details/MediaDetailHero.vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
import EpisodeCard from '@/components/details/EpisodeCard.vue'
import PeopleRow from '@/components/details/PeopleRow.vue'
import RelatedTitles from '@/components/details/RelatedTitles.vue'
import { useMediaDetails, useDetailResource } from '@/composables/useMediaDetails'
import { normalizeGenres, formatYear, formatRuntime, ratingLabel, nextSeriesEpisode, seasonSummary } from '@/utils/media'
import '@/assets/sass/details.sass'
const route = useRoute()
const router = useRouter()
const store = useAppStore()
const media = useMediaStore()
const episodeQuery = ref(String(route.query.q || ''))
const watchedFilter = ref(['unwatched', 'inprogress', 'watched'].includes(String(route.query.watched)) ? String(route.query.watched) : 'all')
const filterActive = computed(() => Boolean(episodeQuery.value.trim()) || watchedFilter.value !== 'all')
const filtersOpen = ref(filterActive.value)
const { item: show, related: episodes, loading, error, relatedError, relatedLoading, reloadRelated, reload } = useMediaDetails(
  () => route.params.seriesId,
  id => oblectoClient.seriesLibrary.getInfo(id),
  id => oblectoClient.seriesLibrary.getEpisodes(id), 'series'
)
const { data: sets, loading: setsLoading, error: setsError, reload: reloadSets } = useDetailResource(
  () => route.params.seriesId,
  id => oblectoClient.seriesLibrary.getSeriesSets(id),
  [], Array.isArray
)
const collections = computed(() => sets.value.filter(set => (set.Series || set.series)?.length))
const fanart = computed(() => media.artworkUrl(store.host, 'series', show.value?.id, 'fanart'))
const poster = computed(() => media.artworkUrl(store.host, 'series', show.value?.id, 'poster'))
const subtitle = computed(() => [formatYear(show.value?.firstAired), show.value?.rating, show.value?.status, ratingLabel(show.value)].filter(Boolean).join(' · '))
const creators = computed(() => (show.value?.credits?.crew || []).filter(credit => credit.roles?.some(role => role.job === 'Creator')))
function groupEpisodes (values) {
  const groups = new Map()
  for (const episode of values) {
    const season = String(episode.airedSeason ?? 'unknown')
    if (!groups.has(season)) groups.set(season, [])
    groups.get(season).push(episode)
  }
  for (const group of groups.values()) group.sort((a, b) => (a.airedEpisodeNumber ?? Infinity) - (b.airedEpisodeNumber ?? Infinity))
  return groups
}
const grouped = computed(() => groupEpisodes(episodes.value))
const seasons = computed(() => [...grouped.value.keys()].sort((a, b) => {
  const order = value => value === 'unknown' ? Infinity : value === '0' ? Number.MAX_SAFE_INTEGER : Number(value)
  return order(a) - order(b)
}))
function replaceQuery (changes) {
  const query = { ...route.query }
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined || value === '') delete query[key]
    else query[key] = value
  }
  if (JSON.stringify(query) !== JSON.stringify(route.query)) router.replace({ query })
}
watch(() => route.query.q, value => { episodeQuery.value = String(value || '') })
watch(() => route.query.watched, value => {
  watchedFilter.value = ['unwatched', 'inprogress', 'watched'].includes(String(value)) ? String(value) : 'all'
})
watch(filterActive, active => { if (active) filtersOpen.value = true })
let queryTimer
watch(episodeQuery, () => {
  window.clearTimeout(queryTimer)
  queryTimer = window.setTimeout(syncFiltersToQuery, 250)
})
watch(watchedFilter, () => {
  window.clearTimeout(queryTimer)
  syncFiltersToQuery()
})
function syncFiltersToQuery () {
  replaceQuery({ q: episodeQuery.value.trim() || null, watched: watchedFilter.value === 'all' ? null : watchedFilter.value })
}
const seasonStats = computed(() => new Map([...grouped.value].map(([season, items]) => [season, seasonSummary(items)])))
function seasonDescription (season) {
  const summary = seasonStats.value.get(season)
  return `${summary.episodeCount} ${summary.episodeCount === 1 ? 'episode' : 'episodes'} · ${summary.watchedCount} watched`
}
const suggested = computed(() => nextSeriesEpisode(episodes.value))
const filteredEpisodes = computed(() => {
  const query = episodeQuery.value.trim().toLocaleLowerCase()
  return episodes.value.filter(episode => {
    const progress = Number(episode.TrackEpisodes?.[0]?.progress) || 0
    if (watchedFilter.value === 'watched' && progress < 0.9) return false
    if (watchedFilter.value === 'inprogress' && !(progress > 0 && progress < 0.9)) return false
    if (watchedFilter.value === 'unwatched' && progress > 0) return false
    if (!query) return true
    const season = episode.airedSeason ?? ''
    const number = episode.airedEpisodeNumber ?? ''
    const haystack = [episode.episodeName, episode.overview, `s${season}e${number}`, `s${String(season).padStart(2, '0')}e${String(number).padStart(2, '0')}`, `season ${season} episode ${number}`].filter(Boolean).join(' ').toLocaleLowerCase()
    return haystack.includes(query)
  })
})
const filteredGrouped = computed(() => groupEpisodes(filteredEpisodes.value))
const visibleGroups = computed(() => seasons.value.map(season => ({ season, episodes: filteredGrouped.value.get(season) || [] })).filter(group => group.episodes.length))
function clearEpisodeFilters () {
  episodeQuery.value = ''
  watchedFilter.value = 'all'
  window.clearTimeout(queryTimer)
  syncFiltersToQuery()
}
function seasonName (season) { return season === '0' ? 'Specials' : season === 'unknown' ? 'Other episodes' : `Season ${season}` }
function seasonAnchor (season) { return `show-season-${encodeURIComponent(season)}` }

// A season link reveals its shelf, while every other season stays available.
let revealedSeason = ''
watch(() => [route.params.seriesId, route.query.season, loading.value, visibleGroups.value], async () => {
  const season = String(route.query.season ?? '')
  const key = `${route.params.seriesId}:${season}`
  if (!season) { revealedSeason = ''; return }
  if (loading.value || key === revealedSeason || !visibleGroups.value.some(group => group.season === season)) return
  await nextTick()
  const shelf = document.getElementById(seasonAnchor(season))
  if (shelf) {
    shelf.scrollIntoView({ block: 'start', behavior: 'instant' })
    revealedSeason = key
  }
}, { flush: 'post' })
function updateEpisodeWatch (id, track) {
  episodes.value = episodes.value.map(episode => String(episode.id) === String(id) ? { ...episode, TrackEpisodes: [track] } : episode)
}
onBeforeUnmount(() => window.clearTimeout(queryTimer))
const metadata = computed(() => {
  const data = show.value || {}
  return [
    { label: 'First aired', value: data.firstAired },
    { label: 'Network', value: data.network },
    { label: 'Status', value: data.status },
    { label: 'Runtime', value: formatRuntime(data.runtime) },
    { label: 'Content rating', value: data.rating },
    { label: 'Rating', value: ratingLabel(data) },
    { label: 'Airs', value: [data.airsDayOfWeek, data.airsTime].filter(Boolean).join(' ') },
    { label: 'Popularity', value: Number(data.popularity) > 0 ? String(Math.round(data.popularity * 10) / 10) : null }
  ].filter(entry => entry.value)
})
</script>
<style scoped lang="sass">
.episodes-heading
  display: flex
  align-items: center
  justify-content: space-between
  gap: 16px
  margin-bottom: 20px
  h2
    margin: 0
.find-toggle
  flex-shrink: 0
  min-height: 44px
  padding: 6px 0
  border: 0
  background: transparent
  color: var(--color-text-muted)
  font: inherit
  font-size: 0.8rem
  cursor: pointer
  &:hover
    color: var(--color-brand-turquoise)
.episode-tools
  display: grid
  grid-template-columns: minmax(0, 1fr) minmax(150px, 220px)
  align-items: end
  gap: 12px
  margin-bottom: 20px
  label
    display: grid
    gap: 6px
    color: var(--color-text-muted)
    font-size: 0.75rem
  input, select
    width: 100%
    min-height: 44px
    border: 1px solid var(--color-border)
    border-radius: 4px
    background: var(--color-surface)
    color: var(--color-text)
    padding: 8px 10px
.filter-summary
  display: flex
  align-items: center
  justify-content: space-between
  gap: 12px
  margin-bottom: 16px
  color: var(--color-text-muted)
  font-size: 0.82rem
.season-shelves
  display: grid
  gap: 28px
  min-width: 0
.season-jumps
  display: flex
  gap: 8px
  overflow-x: auto
  margin: 0 0 20px
  padding: 0 0 8px
  scrollbar-width: thin
  a
    flex: none
    display: inline-flex
    align-items: center
    min-height: 44px
    padding: 8px 14px
    border: 1px solid var(--color-border)
    border-radius: 999px
    color: var(--color-text-muted)
    white-space: nowrap
    text-decoration: none
    &:hover, &:focus-visible
      border-color: var(--color-brand-turquoise)
      color: var(--color-text)
.season-shelf
  scroll-margin-top: 100px
@media (max-width: 760px)
  .season-shelf
    scroll-margin-top: 180px
@media (max-width: 600px)
  .episode-tools
    grid-template-columns: 1fr
  .season-shelf :deep(.track)
    grid-auto-columns: min(64vw, 250px)
</style>
