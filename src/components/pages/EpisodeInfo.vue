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
        focused
        :title="safeTitle"
        :subtitle="subtitle"
        :overview="hidden ? 'Synopsis hidden until you reveal episode details.' : safeOverview"
        :facts="capabilities"
        :backdrop="hidden ? '' : banner"
        :poster="poster"
        :back-to="seriesRoute"
        :back-label="episode.Series?.seriesName || episode.seriesName || 'TV Shows'"
      >
        <PlaybackButton
          :label="playLabel"
          @play="store.playEpisode(episode.id)"
        />
        <MovieSaveButtons
          :id="episode.id"
          type="episode"
          :state="episode.userState"
          kind="favourite"
          icon-only
          @updated="updateUserState"
        />
        <DetailActionsMenu
          :id="`episode-${episode.id}`"
          label="More episode actions"
        >
          <template #default="{ close }">
            <button
              v-if="playLabel === 'Resume'"
              class="menu-action"
              @click="store.playEpisode(episode.id, { position: 0 }); close()"
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
              class="menu-action"
              @click="close()"
            >
              All episodes
            </RouterLink>
            <a
              href="#episode-files"
              class="menu-action"
              @click="filesOpen = true; close()"
            >Available files</a>
          </template>
        </DetailActionsMenu>
        <template #after-actions>
          <MovieProgress :episode="episode" />
          <button
            v-if="hidden"
            type="button"
            class="reveal-spoilers"
            @click="reveal"
          >
            Spoilers hidden · Reveal episode details
          </button>
        </template>
      </MediaDetailHero>
      <div class="detail-body">
        <EpisodeChapters
          :episode="episode"
          :hide-titles="hidden"
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
            <div
              v-if="context.nearby?.length"
              ref="navigatorElement"
              class="nearby-episodes"
              aria-label="Season navigator"
            >
              <div
                v-for="item in context.nearby"
                :key="item.id"
                :class="{ current: String(item.id) === String(episode.id) }"
                :aria-current="String(item.id) === String(episode.id) ? 'true' : undefined"
              >
                <span
                  v-if="String(item.id) === String(episode.id)"
                  class="current-label"
                >Current episode</span>
                <EpisodeCard :episode="item" />
              </div>
            </div>
            <RouterLink
              v-if="context.nextUnwatched"
              class="next-unwatched"
              :to="{ name: 'EpisodeInfo', params: { episodeId: context.nextUnwatched.id } }"
            >
              Next unwatched · S{{ context.nextUnwatched.airedSeason }} E{{ context.nextUnwatched.airedEpisodeNumber }} →
            </RouterLink>
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
        <PeopleRow
          title="Guest stars"
          :credits="episode.credits?.cast || []"
        />
        <PeopleRow
          v-if="keyCrew.length"
          title="Directed and written by"
          :credits="keyCrew"
        />
        <FullCrew :credits="episode.credits?.crew || []" />
        <section
          v-if="metadata.length || providerLinks.length"
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
          <nav
            v-if="providerLinks.length"
            class="provider-links"
            aria-label="External episode pages"
          >
            <a
              v-for="link in providerLinks"
              :key="link.label"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
            >{{ link.label }} ↗</a>
          </nav>
        </section>
        <details
          id="episode-files"
          :open="filesOpen"
          class="detail-section technical-details"
          @toggle="filesOpen = $event.target.open"
        >
          <summary>Available files</summary>
          <p
            v-if="capabilities.length"
            class="detail-notice"
          >
            {{ capabilities.join(' · ') }}
          </p>
          <FileList
            :files="episode.Files || []"
            @play="file => store.playEpisode(episode.id, { fileId: file.id })"
          />
        </details>
      </div>
    </template>
  </div>
</template>
<script setup>
import { formatDate } from '@/utils/media'
import { useEpisodeSpoilers, episodeSpoilerState } from '@/composables/useEpisodeSpoilers'
import { tvProviderLinks } from '@/utils/tvDetails'
import { moviePlaybackDetails } from '@/utils/movieDetails'
import MovieSaveButtons from '@/components/details/MovieSaveButtons.vue'
import MovieProgress from '@/components/details/MovieProgress.vue'
import DetailActionsMenu from '@/components/details/DetailActionsMenu.vue'
import EpisodeChapters from '@/components/details/EpisodeChapters.vue'
import EpisodeCard from '@/components/details/EpisodeCard.vue'
import FullCrew from '@/components/details/FullCrew.vue'
import PlaybackButton from '@/components/remote/PlaybackButton.vue'
import { computed, ref, watch, nextTick } from 'vue'
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
const { title: safeTitle, overview: safeOverview, hidden, reveal, preference } = useEpisodeSpoilers(episode)
const filesOpen = ref(false)
watch(() => episode.value?.id, () => { filesOpen.value = false })
const playLabel = computed(() => {
  const details = moviePlaybackDetails({ ...episode.value, TrackMovies: episode.value?.TrackEpisodes })
  return details.resuming ? 'Resume' : details.watched ? 'Watch again' : 'Play'
})
const providerLinks = computed(() => tvProviderLinks('episode', episode.value))
function updateUserState (state) { episode.value = { ...episode.value, userState: { ...episode.value.userState, ...state } } }
const { data: context, loading: contextLoading, error: contextError, reload: reloadContext } = useDetailResource(
  () => route.params.episodeId,
  id => oblectoClient.episodeLibrary.getContext(id),
  null, value => Boolean(value?.season), { watchState: true }
)
const navigatorElement = ref(null)
watch([() => episode.value?.id, () => Boolean(context.value?.nearby?.length)], async () => {
  await nextTick()
  const container = navigatorElement.value
  const current = container?.querySelector('.current')
  if (current) container.scrollLeft = Math.max(0, current.offsetLeft - container.offsetLeft - (container.clientWidth - current.clientWidth) / 2)
}, { flush: 'post' })
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
  const parts = [`${name} · Episode ${season.position} of ${season.episodeCount} in library`, `${season.watchedCount} watched`]
  if (season.runtimeMinutes) parts.push(`${formatRuntime(season.runtimeMinutes)} total`)
  if (season.averageRating) parts.push(`Average rating ${season.averageRating}`)
  return parts.join(' · ')
})
function episodeLabel (item) {
  const number = item.airedSeason != null && item.airedEpisodeNumber != null ? `S${item.airedSeason} E${item.airedEpisodeNumber} · ` : ''
  return `${number}${episodeSpoilerState(media.withProgress('episode', item), preference.value).title}`
}
function updateWatchState (track) { episode.value = { ...episode.value, TrackEpisodes: [track] } }
const metadata = computed(() => {
  const data = episode.value || {}
  return [
    { label: 'First aired', value: formatDate(data.firstAired || data.aired || data.airDate) },
    { label: 'Runtime', value: formatRuntime(data.runtime) },
    { label: 'Rating', value: ratingLabel(data) }
  ].filter(entry => entry.value)
})
</script>
<style scoped lang="sass">
.reveal-spoilers
  min-height: 44px
  margin-top: 12px
  padding: 0
  border: 0
  background: transparent
  color: var(--color-brand-turquoise)
  font: inherit
  font-size: 0.8rem
  cursor: pointer
.nearby-episodes
  display: grid
  grid-auto-flow: column
  grid-auto-columns: min(64vw, 240px)
  justify-content: start
  gap: 16px
  overflow-x: auto
  padding: 24px 0 16px
  > div
    position: relative
    min-width: 0
    border: 1px solid transparent
    border-radius: var(--radius-sm)
    padding: 6px
  .current
    border-color: var(--color-brand-turquoise)
.current-label
  position: absolute
  left: 6px
  top: -22px
  color: var(--color-brand-turquoise)
  font-size: 0.75rem
.next-unwatched
  display: inline-flex
  align-items: center
  min-height: 44px
  margin: 8px 0 16px
  color: var(--color-brand-turquoise)
.provider-links
  display: flex
  gap: 16px
  flex-wrap: wrap
  margin-top: 20px
  a
    display: inline-flex
    align-items: center
    min-height: 44px
    color: var(--color-brand-turquoise)
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
    border-radius: var(--radius-sm)
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
