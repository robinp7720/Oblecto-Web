<template>
  <div class="detail-page">
    <div
      v-if="loading"
      class="detail-state"
      role="status"
    >
      Loading episode…
    </div>
    <div
      v-else-if="error"
      class="detail-state"
      role="alert"
    >
      <h1>Episode unavailable</h1><p>{{ error }}</p><button
        class="detail-button"
        @click="reload"
      >
        Try again
      </button>
    </div>
    <template v-else-if="episode">
      <MediaDetailHero
        type="episode"
        :title="episode.episodeName || 'Untitled episode'"
        :subtitle="subtitle"
        :overview="episode.overview || ''"
        :facts="capabilities"
        :backdrop="banner"
        :poster="poster"
        :back-to="seriesRoute"
        :back-label="episode.Series?.seriesName || episode.seriesName || 'TV Shows'"
      >
        <PlaybackButton
          :label="playbackLabel('episode', episode)"
          @play="store.playEpisode(episode.id)"
        />
        <button
          v-if="playbackLabel('episode', episode).startsWith('Resume')"
          type="button"
          class="detail-button secondary"
          @click="store.playEpisode(episode.id, { position: 0 })"
        >
          Start over
        </button>
        <WatchStateButton
          :id="episode.id"
          :track="episode.TrackEpisodes?.[0]"
          type="episode"
          @updated="updateWatchState"
        />
        <RouterLink
          v-if="seriesId"
          :to="seriesRoute"
          class="detail-button secondary"
        >
          All episodes
        </RouterLink>
      </MediaDetailHero>
      <div class="detail-body">
        <PeopleRow
          title="Guest stars"
          :credits="episode.credits?.cast || []"
        />
        <PeopleRow
          v-if="keyCrew.length"
          title="Directed and written by"
          :credits="keyCrew"
        />
        <section
          v-if="contextLoading || contextError || context"
          class="detail-section episode-context"
          aria-labelledby="episode-trail-title"
        >
          <h2 id="episode-trail-title">
            Episode trail
          </h2>
          <p
            v-if="contextLoading"
            role="status"
          >
            Loading episode context…
          </p>
          <div
            v-else-if="contextError"
            class="detail-notice"
          >
            {{ contextError }} <button
              class="detail-button secondary"
              @click="reloadContext"
            >
              Try again
            </button>
          </div>
          <template v-else-if="context">
            <p class="context-summary">
              {{ contextSummary }}
            </p>
            <nav aria-label="Adjacent episodes">
              <RouterLink
                v-if="context.previous"
                :to="{ name: 'EpisodeInfo', params: { episodeId: context.previous.id } }"
              >
                <small>‹ Previous</small><strong>{{ episodeLabel(context.previous) }}</strong>
              </RouterLink>
              <RouterLink
                v-if="context.next"
                :to="{ name: 'EpisodeInfo', params: { episodeId: context.next.id } }"
              >
                <small>Next ›</small><strong>{{ episodeLabel(context.next) }}</strong>
              </RouterLink>
            </nav>
          </template>
        </section>
        <section
          v-if="metadata.length"
          class="detail-section"
        >
          <h2>About this episode</h2><dl class="detail-metadata">
            <div
              v-for="entry in metadata"
              :key="entry.label"
            >
              <dt>{{ entry.label }}</dt><dd>{{ entry.value }}</dd>
            </div>
          </dl>
        </section>
        <details class="detail-section technical-details">
          <summary>Available files</summary><FileList :files="episode.Files || []" />
        </details>
      </div>
    </template>
  </div>
</template>
<script setup>
import { playbackLabel } from '@/utils/media'
import PlaybackButton from '@/components/remote/PlaybackButton.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import oblectoClient from '@/oblectoClient'
import MediaDetailHero from '@/components/details/MediaDetailHero.vue'
import FileList from '@/components/files/FileList.vue'
import PeopleRow from '@/components/details/PeopleRow.vue'
import WatchStateButton from '@/components/details/WatchStateButton.vue'
import { useMediaDetails, useDetailResource } from '@/composables/useMediaDetails'
import { formatRuntime, ratingLabel, mediaCapabilities } from '@/utils/media'
import '@/assets/sass/details.sass'
const route = useRoute()
const store = useAppStore()
const media = useMediaStore()
const { item: episode, loading, error, reload } = useMediaDetails(() => route.params.episodeId, id => oblectoClient.episodeLibrary.getInfo(id), undefined, 'episode')
const { data: context, loading: contextLoading, error: contextError, reload: reloadContext } = useDetailResource(
  () => route.params.episodeId,
  id => oblectoClient.episodeLibrary.getContext(id),
  null, value => Boolean(value?.season), { watchState: true }
)
const seriesId = computed(() => episode.value?.Series?.id || episode.value?.seriesId)
const seriesRoute = computed(() => seriesId.value ? {
  name: 'SeriesView',
  params: { seriesId: seriesId.value },
  query: episode.value?.airedSeason != null ? { season: episode.value.airedSeason } : {}
} : { name: 'Library', params: { mediaType: 'series' } })
const banner = computed(() => media.artworkUrl(store.host, 'episode', episode.value?.id, 'banner'))
const poster = computed(() => seriesId.value ? media.artworkUrl(store.host, 'series', seriesId.value, 'poster') : '')
const capabilities = computed(() => mediaCapabilities(episode.value?.Files || []))
const subtitle = computed(() => {
  const data = episode.value || {}
  return [data.Series?.seriesName || data.seriesName, data.airedSeason != null && data.airedEpisodeNumber != null ? `S${data.airedSeason} · E${data.airedEpisodeNumber}` : null, formatRuntime(data.runtime), ratingLabel(data)].filter(Boolean).join(' · ')
})
const keyCrew = computed(() => (episode.value?.credits?.crew || []).filter(credit => credit.roles?.some(role => ['Director', 'Writer', 'Screenplay', 'Story'].includes(role.job))))
const contextSummary = computed(() => {
  const season = context.value?.season
  if (!season) return ''
  const name = String(season.number) === '0' ? 'Specials' : `Season ${season.number}`
  const parts = [`${name} · Episode ${season.position} of ${season.episodeCount}`, `${season.watchedCount} watched`]
  if (season.runtimeMinutes) parts.push(`${formatRuntime(season.runtimeMinutes)} total`)
  if (season.averageRating) parts.push(`Average rating ${season.averageRating}`)
  return parts.join(' · ')
})
function episodeLabel (item) {
  const number = item.airedSeason != null && item.airedEpisodeNumber != null ? `S${item.airedSeason} E${item.airedEpisodeNumber} · ` : ''
  return `${number}${item.episodeName || 'Untitled episode'}`
}
function updateWatchState (track) { episode.value = { ...episode.value, TrackEpisodes: [track] } }
const metadata = computed(() => {
  const data = episode.value || {}
  return [
    { label: 'First aired', value: data.firstAired || data.aired || data.airDate },
    { label: 'Runtime', value: formatRuntime(data.runtime) },
    { label: 'Rating', value: ratingLabel(data) }
  ].filter(entry => entry.value)
})
</script>
<style scoped lang="sass">
.context-summary
  color: var(--color-text-muted)
  line-height: 1.6
.episode-context nav
  display: grid
  grid-template-columns: repeat(2, minmax(0, 1fr))
  gap: 12px
  a
    display: grid
    gap: 7px
    padding: 16px
    border: 1px solid var(--color-border)
    border-radius: 5px
    background: var(--color-surface)
    min-width: 0
    &:hover
      border-color: var(--color-brand-turquoise)
    small
      color: var(--color-brand-turquoise)
    strong
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
@media (max-width: 600px)
  .episode-context nav
    grid-template-columns: 1fr
</style>
