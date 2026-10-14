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
        focused
        :title="movie.movieName || 'Untitled movie'"
        :subtitle="subtitle"
        :overview="movie.overview || ''"
        :backdrop="artwork('fanart')"
        :back-to="{ name: 'Library', params: { mediaType: 'movies' } }"
        back-label="Movies"
      >
        <PlaybackButton
          :label="playback.resuming ? 'Resume' : playback.watched ? 'Watch again' : 'Play'"
          @play="store.playMovie(movie.id)"
        />
        <MovieTrailerButton
          :key="movie.id"
          :title="movie.movieName || 'Movie'"
          :trailers="trailers"
          quiet
        />
        <MovieSaveButtons
          :id="movie.id"
          :state="movie.userState"
          kind="watchlist"
          icon-only
          @updated="updateUserState"
        />
        <MovieActionsMenu
          :key="movie.id"
          :movie="movie"
          :resuming="playback.resuming"
          @start-over="store.playMovie(movie.id, { position: 0 })"
          @watch-updated="updateWatchState"
          @user-updated="updateUserState"
          @files="openFiles"
        />
        <template #after-actions>
          <MovieProgress :movie="movie" />
        </template>
      </MediaDetailHero>
      <div class="detail-body">
        <p
          v-if="extrasLoading"
          role="status"
        >
          Loading trailers and age certifications…
        </p>
        <p
          v-else-if="extrasError || extras?.unavailable"
          class="detail-notice"
          role="status"
        >
          Trailers or age certifications could not be refreshed. Any saved information is shown.
          <button
            type="button"
            class="detail-button secondary"
            @click="reloadExtras"
          >
            Retry extras
          </button>
        </p>
        <section
          v-if="metadata.length || certifications.length || genres.length || providerLinks.length || movie.tagline"
          class="detail-section"
          aria-label="Movie details"
        >
          <h2>About this movie</h2>
          <p
            v-if="movie.tagline"
            class="movie-tagline"
          >
            {{ movie.tagline }}
          </p>
          <div
            v-if="genres.length"
            class="movie-genres"
            aria-label="Movie genres"
          >
            <RouterLink
              v-for="genre in genres"
              :key="genre"
              :to="{ name: 'Library', params: { mediaType: 'movies' }, query: { genre } }"
            >
              {{ genre }}
            </RouterLink>
          </div>
          <dl class="detail-metadata">
            <div
              v-if="certifications.length"
              class="certification-details"
            >
              <dt>Age certification</dt>
              <dd>
                <strong>{{ certification ? `${certification.certification} (${certification.country})` : region ? 'Not available for this region' : 'Choose a region' }}</strong>
                <label for="certification-region">Region</label>
                <select
                  id="certification-region"
                  v-model="region"
                  aria-label="Certification region"
                >
                  <option value="">
                    Choose region
                  </option>
                  <option
                    v-for="country in certificationRegions"
                    :key="country.code"
                    :value="country.code"
                  >
                    {{ country.name }}
                  </option>
                </select>
              </dd>
            </div>
            <div
              v-for="entry in metadata"
              :key="entry.label"
            >
              <dt>{{ entry.label }}</dt><dd>{{ entry.value }}</dd>
            </div>
          </dl>
          <nav
            v-if="providerLinks.length"
            class="movie-links"
            aria-label="Movie links"
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
        <PeopleRow
          title="Cast"
          :credits="movie.credits?.cast || []"
        />
        <PeopleRow
          v-if="keyCrew.length"
          title="Directed and written by"
          :credits="keyCrew"
        />
        <FullCrew
          :key="movie.id"
          :credits="movie.credits?.crew || []"
        />
        <details
          id="movie-files"
          ref="filesSection"
          class="detail-section technical-details"
        >
          <summary>Available files</summary>
          <ul
            v-if="capabilities.length"
            class="movie-capabilities"
            aria-label="Available media features"
          >
            <li
              v-for="fact in capabilities"
              :key="fact"
            >
              {{ fact }}
            </li>
          </ul>
          <FileList
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
import { formatDate } from '@/utils/media'
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
import MovieActionsMenu from '@/components/details/MovieActionsMenu.vue'
import MovieSaveButtons from '@/components/details/MovieSaveButtons.vue'
import MovieTrailerButton from '@/components/details/MovieTrailerButton.vue'
import MovieProgress from '@/components/details/MovieProgress.vue'
import FullCrew from '@/components/details/FullCrew.vue'
import { useMediaDetails, useDetailResource } from '@/composables/useMediaDetails'
import { moviePlaybackDetails, movieProviderLinks } from '@/utils/movieDetails'
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
const { data: extras, loading: extrasLoading, error: extrasError, reload: reloadExtras } = useDetailResource(
  () => route.params.movieId,
  id => oblectoClient.movieLibrary.getExtras(id),
  null, value => Array.isArray(value?.trailers) && Array.isArray(value?.certifications)
)
const trailers = computed(() => extras.value?.trailers || movie.value?.trailers || [])
const certifications = computed(() => extras.value?.certifications || movie.value?.certifications || [])
const providerLinks = computed(() => movieProviderLinks(movie.value))
const playback = computed(() => moviePlaybackDetails(movie.value || {}))
// A locale without a region does not establish which country's classification to use.
function browserRegion () {
  for (const language of navigator.languages || [navigator.language]) {
    try {
      const country = new Intl.Locale(language).region
      if (country && /^[A-Z]{2}$/.test(country)) return country
    } catch { /* Leave the choice to the viewer. */ }
  }
  return ''
}
const region = ref(browserRegion())
const certification = computed(() => certifications.value.find(entry => entry.country === region.value))
const certificationRegions = computed(() => {
  const countries = [...new Set([...certifications.value.map(entry => entry.country), region.value].filter(Boolean))]
  return countries.map(code => {
    let name = code
    try { name = new Intl.DisplayNames(navigator.languages, { type: 'region' }).of(code) || code } catch { /* Use the country code. */ }
    return { code, name: `${name} (${code})` }
  }).sort((a, b) => a.name.localeCompare(b.name))
})
// Following a link to a closed <details> scrolls to its summary but leaves it
// shut, so the hero's "Available files" link opens it on the way.
const filesSection = ref(null)
function openFiles () {
  if (!filesSection.value) return
  filesSection.value.open = true
  filesSection.value.querySelector('summary')?.focus()
}
const genres = computed(() => normalizeGenres(movie.value?.genres || movie.value?.genre))
const subtitle = computed(() => [formatYear(movie.value?.releaseDate), formatRuntime(movie.value?.runtime), certification.value ? `${certification.value.certification} (${certification.value.country})` : null].filter(Boolean).join(' · '))
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
    { label: 'Release date', value: formatDate(data.releaseDate) },
    { label: 'Runtime', value: formatRuntime(data.runtime) },
    { label: 'Audience rating', value: ratingLabel(data) },
    { label: 'Original language', value: data.originalLanguage?.toUpperCase() },
    { label: 'Original title', value: data.originalName },
    { label: 'Budget', value: currency(data.budget) },
    { label: 'Revenue', value: currency(data.revenue) },
    { label: 'Popularity', value: Number(data.popularity) > 0 ? String(Math.round(data.popularity * 10) / 10) : null }
  ].filter(entry => entry.value)
})
function artwork (variant) { return media.artworkUrl(store.host, 'movie', movie.value?.id, variant) }
function updateWatchState (track) { movie.value = { ...movie.value, TrackMovies: [track] } }
function updateUserState (update) { movie.value = { ...movie.value, userState: { ...movie.value.userState, ...update } } }
</script>

<style scoped lang="sass">
.movie-tagline
  color: var(--color-text-muted)
  line-height: 1.6
  margin: 0 0 18px
.movie-genres
  display: flex
  flex-wrap: wrap
  gap: 8px 18px
  margin-bottom: 22px
  a
    color: var(--color-brand-turquoise)
    font-size: 0.85rem
.movie-capabilities
  display: flex
  flex-wrap: wrap
  gap: 8px
  padding: 0
  margin: 0 0 18px
  list-style: none
  li
    padding: 5px 9px
    background: var(--color-bg-2)
    border-radius: var(--radius-sm)
    color: var(--color-text-muted)
    font-size: 0.75rem
.movie-links
  display: flex
  flex-wrap: wrap
  gap: 8px 22px
  margin-top: 16px
  font-size: 0.85rem
  a
    display: inline-flex
    align-items: center
    min-height: 36px
    color: var(--color-brand-turquoise)
.certification-details dd
  display: grid
  gap: 8px
  label
    margin-top: 8px
    font-size: 0.8rem
    color: var(--color-text-muted)
  select
    max-width: 100%
    min-width: 0
</style>
