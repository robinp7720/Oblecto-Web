<template>
  <div class="detail-page">
    <div
      v-if="loading"
      class="detail-state"
      role="status"
    >
      Loading movie…
    </div>
    <div
      v-else-if="error"
      class="detail-state"
      role="alert"
    >
      <h1>Movie unavailable</h1><p>{{ error }}</p><button
        class="detail-button"
        @click="reload"
      >
        Try again
      </button>
    </div>
    <template v-else-if="movie">
      <MediaDetailHero
        type="movie"
        :title="movie.movieName || 'Untitled movie'"
        :subtitle="subtitle"
        :tagline="movie.tagline || ''"
        :overview="movie.overview || ''"
        :genres="genres"
        :facts="capabilities"
        :backdrop="artwork('fanart')"
        :poster="artwork('poster')"
        :back-to="{ name: 'Library', params: { mediaType: 'movies' } }"
        back-label="Movies"
      >
        <PlaybackButton
          :label="playbackLabel('movie', movie)"
          @play="store.playMovie(movie.id)"
        />
        <button
          v-if="playbackLabel('movie', movie).startsWith('Resume')"
          type="button"
          class="detail-button secondary"
          @click="store.playMovie(movie.id, { position: 0 })"
        >
          Start over
        </button>
        <WatchStateButton
          :id="movie.id"
          :track="movie.TrackMovies?.[0]"
          type="movie"
          @updated="updateWatchState"
        />
        <a
          href="#movie-files"
          class="detail-button secondary"
          @click="filesSection && (filesSection.open = true)"
        >Available files</a>
      </MediaDetailHero>
      <div class="detail-body">
        <PeopleRow
          title="Cast"
          :credits="movie.credits?.cast || []"
        />
        <PeopleRow
          v-if="keyCrew.length"
          title="Directed and written by"
          :credits="keyCrew"
          :limit="10"
        />
        <section
          v-if="metadata.length"
          class="detail-section"
          aria-label="Movie details"
        >
          <h2>About this movie</h2>
          <dl class="detail-metadata">
            <div
              v-for="entry in metadata"
              :key="entry.label"
            >
              <dt>{{ entry.label }}</dt><dd>{{ entry.value }}</dd>
            </div>
          </dl>
        </section>
        <details
          id="movie-files"
          ref="filesSection"
          class="detail-section technical-details"
        >
          <summary>Available files</summary><FileList
            :files="movie.Files || []"
            @play="file => store.playMovie(movie.id, { fileId: file.id })"
          />
        </details>
        <p
          v-if="relatedLoading"
          role="status"
        >
          Loading collections…
        </p>
        <div
          v-if="relatedError"
          class="detail-notice"
          role="status"
        >
          {{ relatedError }} <button
            class="detail-button secondary"
            @click="reloadRelated"
          >
            Try again
          </button>
        </div>
        <MediaShelf
          v-for="set in collections"
          :key="set.id"
          :title="set.displayName"
          type="movie"
          :items="set.Movies || set.movies"
        />
        <RelatedTitles
          :id="movie.id"
          type="movie"
          :exclude="collections.flatMap(set => (set.Movies || set.movies).map(item => item.id))"
        />
      </div>
    </template>
  </div>
</template>
<script setup>
import { playbackLabel } from '@/utils/media'
import PlaybackButton from '@/components/remote/PlaybackButton.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import oblectoClient from '@/oblectoClient'
import MediaDetailHero from '@/components/details/MediaDetailHero.vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
import FileList from '@/components/files/FileList.vue'
import PeopleRow from '@/components/details/PeopleRow.vue'
import RelatedTitles from '@/components/details/RelatedTitles.vue'
import WatchStateButton from '@/components/details/WatchStateButton.vue'
import { useMediaDetails } from '@/composables/useMediaDetails'
import { normalizeGenres, formatYear, formatRuntime, ratingLabel, mediaCapabilities } from '@/utils/media'
import '@/assets/sass/details.sass'
const route = useRoute()
const store = useAppStore()
const media = useMediaStore()
const { item: movie, related: sets, loading, error, relatedError, relatedLoading, reloadRelated, reload } = useMediaDetails(
  () => route.params.movieId,
  id => oblectoClient.movieLibrary.getInfo(id),
  id => oblectoClient.movieLibrary.getMovieSets(id), 'movie'
)
// Following a link to a closed <details> scrolls to its summary but leaves it
// shut, so the hero's "Available files" link opens it on the way.
const filesSection = ref(null)
const genres = computed(() => normalizeGenres(movie.value?.genres || movie.value?.genre))
const subtitle = computed(() => [formatYear(movie.value?.releaseDate), formatRuntime(movie.value?.runtime), ratingLabel(movie.value)].filter(Boolean).join(' · '))
const keyCrew = computed(() => (movie.value?.credits?.crew || []).filter(credit => credit.roles?.some(role => ['Director', 'Writer', 'Screenplay', 'Story'].includes(role.job))))
const capabilities = computed(() => mediaCapabilities(movie.value?.Files || []))
const collections = computed(() => sets.value.filter(set => (set.Movies || set.movies)?.length).map(set => {
  const items = [...(set.Movies || set.movies)].sort((a, b) => String(a.releaseDate || '').localeCompare(String(b.releaseDate || '')) || a.id - b.id)
  const position = items.findIndex(item => String(item.id) === String(movie.value?.id)) + 1
  return { ...set, Movies: items, displayName: position ? `${set.setName} · ${position} of ${items.length}` : set.setName }
}))
const metadata = computed(() => {
  const data = movie.value || {}
  const currency = value => Number(value) > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) : null
  return [
    { label: 'Release date', value: data.releaseDate },
    { label: 'Runtime', value: formatRuntime(data.runtime) },
    { label: 'Original language', value: data.originalLanguage?.toUpperCase() },
    { label: 'Original title', value: data.originalName },
    { label: 'Budget', value: currency(data.budget) },
    { label: 'Revenue', value: currency(data.revenue) },
    { label: 'Popularity', value: Number(data.popularity) > 0 ? String(Math.round(data.popularity * 10) / 10) : null }
  ].filter(entry => entry.value)
})
function artwork (variant) { return media.artworkUrl(store.host, 'movie', movie.value?.id, variant) }
function updateWatchState (track) { movie.value = { ...movie.value, TrackMovies: [track] } }
</script>
