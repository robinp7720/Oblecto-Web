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
      <h1>TV show unavailable</h1><p>{{ error }}</p><button
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
          @play="store.dispatch('playEpisode', suggested.episode.id)"
        />
        <a
          href="#show-episodes"
          class="detail-button secondary"
        >Browse episodes</a>
      </MediaDetailHero>
      <div class="detail-body">
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
          {{ setsError }} <button
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
          id="show-episodes"
          class="detail-section"
        >
          <div class="episodes-heading">
            <div><h2>Episodes</h2><span class="detail-notice">{{ episodes.length }} {{ episodes.length === 1 ? 'episode' : 'episodes' }} in your library</span></div>
            <label
              v-if="seasons.length"
              class="season-picker mobile-picker"
            ><span>Season</span><select
              v-model="selectedSeason"
              aria-label="Select season"
            ><option
              v-for="season in seasons"
              :key="season"
              :value="season"
            >{{ season === '0' ? 'Specials' : season === 'unknown' ? 'Other episodes' : `Season ${season}` }}</option></select></label>
          </div>
          <div
            v-if="seasons.length"
            class="season-rail"
            aria-label="Seasons"
          >
            <button
              v-for="season in seasons"
              :key="season"
              type="button"
              :class="{ active: selectedSeason === season }"
              :aria-pressed="selectedSeason === season"
              @click="selectedSeason = season"
            >
              <strong>{{ season === '0' ? 'Specials' : season === 'unknown' ? 'Other' : `Season ${season}` }}</strong>
              <span>{{ seasonStats[season].watchedCount }}/{{ seasonStats[season].episodeCount }} watched</span>
            </button>
          </div>
          <p
            v-if="selectedSummary"
            class="season-summary"
          >
            {{ selectedSummary }}
          </p>
          <div
            v-if="relatedError"
            class="detail-notice"
            role="alert"
          >
            <p>We couldn’t load the episodes.</p><button
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
            v-if="relatedLoading"
            role="status"
          >
            Loading episodes…
          </p>
          <!-- Keyed by season so picking another one replays the entrance. -->
          <div
            :key="selectedSeason"
            class="motion-stagger"
          >
            <EpisodeRow
              v-for="episode in selectedEpisodes"
              :key="episode.id"
              :episode="episode"
            />
          </div>
        </section>
        <section
          v-if="metadata.length"
          class="detail-section"
        >
          <h2>About this show</h2><dl class="detail-metadata">
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
import { remote } from '@/remote/state'
import PlaybackButton from '@/components/remote/PlaybackButton.vue'
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import oblectoClient from '@/oblectoClient'
import MediaDetailHero from '@/components/details/MediaDetailHero.vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
import EpisodeRow from '@/components/details/EpisodeRow.vue'
import PeopleRow from '@/components/details/PeopleRow.vue'
import RelatedTitles from '@/components/details/RelatedTitles.vue'
import { useMediaDetails, useDetailResource } from '@/composables/useMediaDetails'
import { imageUrl, normalizeGenres, formatYear, formatRuntime, ratingLabel, nextSeriesEpisode, seasonSummary } from '@/utils/media'
import '@/assets/sass/details.sass'
const route = useRoute()
const store = useStore()
const selectedSeason = ref('')
const { item: show, related: episodes, loading, error, relatedError, relatedLoading, reloadRelated, reload } = useMediaDetails(
  () => route.params.seriesId,
  id => oblectoClient.seriesLibrary.getInfo(id),
  id => oblectoClient.seriesLibrary.getEpisodes(id)
)
const { data: sets, loading: setsLoading, error: setsError, reload: reloadSets } = useDetailResource(
  () => route.params.seriesId,
  id => oblectoClient.seriesLibrary.getSeriesSets(id),
  [], Array.isArray
)
const collections = computed(() => sets.value.filter(set => (set.Series || set.series)?.length))
const fanart = computed(() => imageUrl(store.state.host, 'series', show.value?.id, 'fanart'))
const poster = computed(() => imageUrl(store.state.host, 'series', show.value?.id, 'poster'))
const subtitle = computed(() => [formatYear(show.value?.firstAired), show.value?.rating, show.value?.status, ratingLabel(show.value)].filter(Boolean).join(' · '))
const creators = computed(() => (show.value?.credits?.crew || []).filter(credit => credit.roles?.some(role => role.job === 'Creator')))
const grouped = computed(() => {
  const groups = {}
  for (const episode of episodes.value) {
    const season = String(episode.airedSeason ?? 'unknown')
    if (!groups[season]) groups[season] = []
    groups[season].push(episode)
  }
  for (const group of Object.values(groups)) group.sort((a, b) => (a.airedEpisodeNumber ?? Infinity) - (b.airedEpisodeNumber ?? Infinity))
  return groups
})
const seasons = computed(() => Object.keys(grouped.value).sort((a, b) => {
  const order = value => value === 'unknown' ? Infinity : value === '0' ? Number.MAX_SAFE_INTEGER : Number(value)
  return order(a) - order(b)
}))
let seasonInitialized = false
watch(() => route.params.seriesId, () => { seasonInitialized = false; selectedSeason.value = '' })
watch(episodes, values => {
  if (!values.length) return
  if (!seasonInitialized) {
    selectedSeason.value = String(nextSeriesEpisode(values)?.episode.airedSeason ?? 'unknown')
    seasonInitialized = true
  } else if (!seasons.value.includes(selectedSeason.value)) selectedSeason.value = seasons.value[0] || ''
})
const selectedEpisodes = computed(() => grouped.value[selectedSeason.value] || [])
const seasonStats = computed(() => Object.fromEntries(Object.entries(grouped.value).map(([season, items]) => [season, seasonSummary(items)])))
const selectedSummary = computed(() => {
  const summary = seasonStats.value[selectedSeason.value]
  if (!summary) return ''
  const parts = [`${summary.episodeCount} ${summary.episodeCount === 1 ? 'episode' : 'episodes'}`, `${summary.watchedCount} watched`]
  if (summary.runtimeMinutes) parts.push(`${formatRuntime(summary.runtimeMinutes)} total`)
  if (summary.averageRating) parts.push(`Average rating ${summary.averageRating}`)
  return parts.join(' · ')
})
const suggested = computed(() => nextSeriesEpisode(episodes.value))
function updateProgress (id, time, progress, updatedAt) {
  episodes.value = episodes.value.map(episode => {
    if (String(episode.id) !== String(id) || updatedAt < (Date.parse(episode.TrackEpisodes?.[0]?.updatedAt) || 0)) return episode
    return { ...episode, TrackEpisodes: [{ ...episode.TrackEpisodes?.[0], progress, time, updatedAt: new Date(updatedAt).toISOString() }] }
  })
}
watch(() => store.state.playing?.entity?.TrackEpisodes?.[0]?.time, time => {
  const playing = store.state.playing
  if (playing?.type !== 'episode' || !(Number(time) >= 0)) return
  const duration = Number(playing.entity.Files?.[0]?.duration) || Number(playing.entity.runtime) * 60
  if (duration > 0) updateProgress(playing.entity.id, Number(time), Math.min(1, time / duration), Date.now())
})
watch(() => remote.devices, devices => {
  for (const { state } of devices) {
    if (state?.media?.kind === 'episode' && state.duration > 0) {
      updateProgress(state.media.id, state.position, Math.min(1, state.position / state.duration), state.updatedAt)
    }
  }
}, { deep: true })
function refreshEpisodes () { if (!relatedLoading.value) reloadRelated() }
onMounted(() => window.addEventListener('focus', refreshEpisodes))
onBeforeUnmount(() => window.removeEventListener('focus', refreshEpisodes))
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
  flex-wrap: wrap
  gap: 20px
  margin-bottom: 16px
  h2
    margin-bottom: 6px
.season-picker
  display: flex
  align-items: center
  gap: 12px
  color: var(--color-text-muted)
  font-size: 0.875rem
  select
    background: var(--color-surface)
    min-height: 44px
    min-width: 150px
    cursor: pointer
.season-rail
  display: flex
  gap: 10px
  overflow-x: auto
  padding: 2px 2px 12px
  scrollbar-width: thin
  button
    min-width: 132px
    padding: 12px 14px
    border: 1px solid var(--color-border)
    border-radius: 5px
    background: var(--color-surface)
    color: var(--color-text)
    text-align: left
    cursor: pointer
    &.active
      border-color: var(--color-brand-turquoise)
      background: rgba(35, 177, 181, 0.12)
    strong, span
      display: block
    span
      margin-top: 5px
      color: var(--color-text-muted)
      font-size: 0.72rem
.season-summary
  margin: 4px 0 8px
  color: var(--color-text-muted)
  font-size: 0.82rem
.mobile-picker
  display: none
@media (max-width: 600px)
  .season-rail
    display: none
  .mobile-picker
    display: flex
</style>
