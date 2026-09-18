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
        :backdrop="artwork('fanart')"
        :poster="artwork('poster')"
        :back-to="{ name: 'Library', params: { mediaType: 'movies' } }"
        back-label="Movies"
      >
        <PlaybackButton
          :label="playbackLabel('movie', movie)"
          @play="store.dispatch('playMovie', movie.id)"
        />
        <a
          href="#movie-files"
          class="detail-button secondary"
        >Available files</a>
      </MediaDetailHero>
      <div class="detail-body">
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
        <section
          id="movie-files"
          class="detail-section"
        >
          <h2>Available files</h2><FileList :files="movie.Files || []" />
        </section>
        <div
          v-if="relatedError"
          class="detail-notice"
          role="status"
        >
          {{ relatedError }} <button
            class="detail-button secondary"
            @click="reload"
          >
            Try again
          </button>
        </div>
        <MediaShelf
          v-for="set in collections"
          :key="set.id"
          :title="set.setName"
          type="movie"
          :items="set.Movies || set.movies"
        />
      </div>
    </template>
  </div>
</template>
<script setup>
import { playbackLabel } from '@/utils/media'
import PlaybackButton from '@/components/remote/PlaybackButton.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import oblectoClient from '@/oblectoClient'
import MediaDetailHero from '@/components/details/MediaDetailHero.vue'
import MediaShelf from '@/components/media/MediaShelf.vue'
import FileList from '@/components/files/FileList.vue'
import { useMediaDetails } from '@/composables/useMediaDetails'
import { imageUrl, normalizeGenres, formatYear, formatRuntime } from '@/utils/media'
import '@/assets/sass/details.sass'
const route = useRoute()
const store = useStore()
const { item: movie, related: sets, loading, error, relatedError, reload } = useMediaDetails(
  () => route.params.movieId,
  id => oblectoClient.movieLibrary.getInfo(id),
  id => oblectoClient.movieLibrary.getMovieSets(id)
)
const genres = computed(() => normalizeGenres(movie.value?.genres || movie.value?.genre))
const subtitle = computed(() => [formatYear(movie.value?.releaseDate), formatRuntime(movie.value?.runtime)].filter(Boolean).join(' · '))
const collections = computed(() => sets.value.filter(set => (set.Movies || set.movies)?.length))
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
function artwork (variant) { return imageUrl(store.state.host, 'movie', movie.value?.id, variant) }
</script>
