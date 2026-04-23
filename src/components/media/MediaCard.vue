<template>
  <article class="media-card">
    <RouterLink :to="detailsRoute" class="poster-link">
      <div class="poster" :style="{ backgroundImage: backgroundImage }">
        <div class="overlay">
          <button
            v-if="playable"
            type="button"
            class="hero-action"
            @click.prevent="play"
          >
            Play
          </button>
          <span v-else class="hero-action secondary">Open</span>
        </div>
        <div v-if="progress > 0" class="progress">
          <span :style="{ width: `${Math.min(progress, 1) * 100}%` }" />
        </div>
      </div>
    </RouterLink>
    <div class="body">
      <RouterLink :to="detailsRoute" class="title">{{ title }}</RouterLink>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { titleForItem, subtitleForItem, imageUrl, progressForItem } from '@/utils/media'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  }
})

const store = useStore()

const title = computed(() => titleForItem(props.type, props.item))
const subtitle = computed(() => subtitleForItem(props.type, props.item))
const progress = computed(() => progressForItem(props.type, props.item))
const host = computed(() => store.state.host)
const backgroundImage = computed(() => {
  const variant = props.type === 'episode' ? 'banner' : 'poster'
  const mediaType = props.type === 'series' ? 'series' : props.type
  const url = imageUrl(host.value, mediaType, props.item.id, variant)
  return `linear-gradient(180deg, rgba(10, 8, 10, 0.08), rgba(10, 8, 10, 0.5)), url(${url})`
})
const detailsRoute = computed(() => {
  if (props.type === 'movie') {
    return { name: 'MovieInfo', params: { movieId: props.item.id } }
  }

  if (props.type === 'series') {
    return { name: 'SeriesView', params: { seriesId: props.item.id } }
  }

  return { name: 'EpisodeInfo', params: { episodeId: props.item.id } }
})
const playable = computed(() => props.type !== 'series')

function play () {
  if (props.type === 'movie') {
    store.dispatch('playMovie', props.item.id)
    return
  }

  if (props.type === 'episode') {
    store.dispatch('playEpisode', props.item.id)
  }
}
</script>

<style scoped lang="sass">
.media-card
  display: grid
  gap: 12px
  min-width: 0

.poster-link
  display: block

.poster
  position: relative
  min-height: 270px
  border-radius: 20px
  overflow: hidden
  background-size: cover
  background-position: center
  border: 1px solid rgba(255, 255, 255, 0.08)
  box-shadow: 0 24px 40px rgba(8, 6, 8, 0.35)
  transition: transform 0.2s ease, box-shadow 0.2s ease

  &:hover
    transform: translateY(-3px)
    box-shadow: 0 28px 44px rgba(8, 6, 8, 0.42)

.overlay
  position: absolute
  inset: auto 14px 14px 14px
  display: flex
  justify-content: flex-start

.hero-action
  border: 1px solid rgba(255, 255, 255, 0.12)
  background: rgba(18, 15, 18, 0.72)
  color: var(--color-text)
  border-radius: 999px
  padding: 10px 16px
  cursor: pointer

  &.secondary
    display: inline-flex
    align-items: center

.progress
  position: absolute
  left: 0
  right: 0
  bottom: 0
  height: 4px
  background: rgba(255, 255, 255, 0.1)

  span
    display: block
    height: 100%
    background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong))

.body
  min-width: 0

.title
  display: block
  font-weight: 700
  color: var(--color-text)

.subtitle
  margin: 6px 0 0
  color: var(--color-text-muted)
  font-size: 0.92rem
  line-height: 1.4
</style>
