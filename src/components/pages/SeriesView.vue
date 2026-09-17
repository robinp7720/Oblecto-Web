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
        :backdrop="poster"
        :poster="poster"
        :back-to="{ name: 'Library', params: { mediaType: 'series' } }"
        back-label="TV Shows"
      >
        <button
          v-if="firstEpisode"
          class="detail-button"
          type="button"
          @click="store.dispatch('playEpisode', firstEpisode.id)"
        >
          <span aria-hidden="true">▶</span> Play S{{ firstEpisode.airedSeason }} E{{ firstEpisode.airedEpisodeNumber }}
        </button>
        <a
          href="#show-episodes"
          class="detail-button secondary"
        >Browse episodes</a>
      </MediaDetailHero>
      <div class="detail-body">
        <section
          id="show-episodes"
          class="detail-section"
        >
          <div class="episodes-heading">
            <div><h2>Episodes</h2><span class="detail-notice">{{ episodes.length }} {{ episodes.length === 1 ? 'episode' : 'episodes' }} in your library</span></div>
            <label
              v-if="seasons.length"
              class="season-picker"
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
            v-if="relatedError"
            class="detail-notice"
            role="alert"
          >
            <p>We couldn’t load the episodes.</p><button
              class="detail-button secondary"
              @click="reload"
            >
              Try again
            </button>
          </div>
          <p
            v-else-if="!episodes.length"
            class="detail-notice"
          >
            No episodes have been added to this show yet.
          </p>
          <EpisodeRow
            v-for="episode in selectedEpisodes"
            :key="episode.id"
            :episode="episode"
          />
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
      </div>
    </template>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import oblectoClient from '@/oblectoClient'
import MediaDetailHero from '@/components/details/MediaDetailHero.vue'
import EpisodeRow from '@/components/details/EpisodeRow.vue'
import { useMediaDetails } from '@/composables/useMediaDetails'
import { imageUrl, normalizeGenres, formatYear, formatRuntime, formatRating } from '@/utils/media'
import '@/assets/sass/details.sass'
const route = useRoute()
const store = useStore()
const selectedSeason = ref('')
const { item: show, related: episodes, loading, error, relatedError, reload } = useMediaDetails(
  () => route.params.seriesId,
  id => oblectoClient.seriesLibrary.getInfo(id),
  id => oblectoClient.seriesLibrary.getEpisodes(id)
)
const poster = computed(() => imageUrl(store.state.host, 'series', show.value?.id, 'poster'))
const subtitle = computed(() => [formatYear(show.value?.firstAired), show.value?.rating, show.value?.status].filter(Boolean).join(' · '))
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
watch(seasons, values => { if (!values.includes(selectedSeason.value)) selectedSeason.value = values[0] || '' }, { immediate: true })
const selectedEpisodes = computed(() => grouped.value[selectedSeason.value] || [])
const firstEpisode = computed(() => grouped.value[seasons.value[0]]?.[0])
const metadata = computed(() => {
  const data = show.value || {}
  return [
    { label: 'First aired', value: data.firstAired },
    { label: 'Network', value: data.network },
    { label: 'Status', value: data.status },
    { label: 'Runtime', value: formatRuntime(data.runtime) },
    { label: 'Content rating', value: data.rating },
    { label: 'Community rating', value: formatRating(data.siteRating, data.siteRatingCount) },
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
</style>
