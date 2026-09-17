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
        :backdrop="banner"
        :poster="poster"
        :back-to="seriesRoute"
        :back-label="episode.Series?.seriesName || episode.seriesName || 'TV Shows'"
      >
        <button
          class="detail-button"
          type="button"
          @click="store.dispatch('playEpisode', episode.id)"
        >
          <span aria-hidden="true">▶</span> Play episode
        </button>
        <RouterLink
          v-if="seriesId"
          :to="seriesRoute"
          class="detail-button secondary"
        >
          All episodes
        </RouterLink>
      </MediaDetailHero>
      <div class="detail-body">
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
        <section class="detail-section">
          <h2>Available files</h2><FileList :files="episode.Files || []" />
        </section>
      </div>
    </template>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import oblectoClient from '@/oblectoClient'
import MediaDetailHero from '@/components/details/MediaDetailHero.vue'
import FileList from '@/components/files/FileList.vue'
import { useMediaDetails } from '@/composables/useMediaDetails'
import { imageUrl, formatRuntime, formatRating } from '@/utils/media'
import '@/assets/sass/details.sass'
const route = useRoute()
const store = useStore()
const { item: episode, loading, error, reload } = useMediaDetails(() => route.params.episodeId, id => oblectoClient.episodeLibrary.getInfo(id))
const seriesId = computed(() => episode.value?.Series?.id || episode.value?.seriesId)
const seriesRoute = computed(() => seriesId.value ? { name: 'SeriesView', params: { seriesId: seriesId.value } } : { name: 'Library', params: { mediaType: 'series' } })
const banner = computed(() => imageUrl(store.state.host, 'episode', episode.value?.id, 'banner'))
const poster = computed(() => seriesId.value ? imageUrl(store.state.host, 'series', seriesId.value, 'poster') : '')
const subtitle = computed(() => {
  const data = episode.value || {}
  return [data.Series?.seriesName || data.seriesName, data.airedSeason != null && data.airedEpisodeNumber != null ? `S${data.airedSeason} · E${data.airedEpisodeNumber}` : null, formatRuntime(data.runtime)].filter(Boolean).join(' · ')
})
const metadata = computed(() => {
  const data = episode.value || {}
  return [
    { label: 'First aired', value: data.firstAired || data.aired || data.airDate },
    { label: 'Runtime', value: formatRuntime(data.runtime) },
    { label: 'Content rating', value: data.rating },
    { label: 'Community rating', value: formatRating(data.siteRating, data.siteRatingCount) }
  ].filter(entry => entry.value)
})
</script>
