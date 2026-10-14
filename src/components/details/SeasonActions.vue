<template>
  <DetailActionsMenu
    :id="`season-${seriesId}-${season}`"
    :label="`Actions for ${seasonLabel}`"
  >
    <template #default="{ close }">
      <template v-if="!pendingAction">
        <button
          v-if="firstUnwatched"
          class="menu-action"
          @click="store.playEpisode(firstUnwatched.id); close()"
        >
          Play first unwatched
        </button>
        <button
          class="menu-action"
          @click="pendingAction = 'watched'"
        >
          Mark season watched
        </button>
        <button
          class="menu-action"
          @click="pendingAction = 'unwatched'"
        >
          Mark season unwatched
        </button>
        <button
          v-if="firstUnwatched"
          class="menu-action"
          @click="pendingAction = 'earlier'"
        >
          Mark earlier episodes watched…
        </button>
      </template>
      <div
        v-else
        class="confirmation"
      >
        <p>{{ confirmation }}</p>
        <p class="scope-note">
          Only your watch history changes.
        </p>
        <button
          class="menu-action"
          :disabled="saving"
          @click="save(close)"
        >
          {{ saving ? 'Saving…' : 'Confirm' }}
        </button>
        <button
          class="menu-action"
          :disabled="saving"
          @click="pendingAction = ''; error = ''"
        >
          Cancel
        </button>
      </div>
      <p
        v-if="error"
        role="alert"
        class="season-error"
      >
        {{ error }}
      </p>
    </template>
  </DetailActionsMenu>
</template>
<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import DetailActionsMenu from './DetailActionsMenu.vue'
import oblectoClient from '@/oblectoClient'
import { useAppStore } from '@/stores/app'
import { useMediaStore } from '@/stores/media'
import { playableEpisode } from '@/utils/tvDetails'
import { describeError } from '@/composables/useSaveState'
const props = defineProps({ seriesId: { type: [String, Number], required: true }, season: { type: [String, Number], required: true }, episodes: { type: Array, required: true } })
const emit = defineEmits(['updated'])
const store = useAppStore()
const media = useMediaStore()
const pendingAction = ref('')
const saving = ref(false)
const error = ref('')
const seasonLabel = computed(() => String(props.season) === '0' ? 'specials' : `season ${props.season}`)
const firstUnwatched = computed(() => [...props.episodes].sort((a, b) => Number(a.airedEpisodeNumber) - Number(b.airedEpisodeNumber)).find(episode => playableEpisode(episode) && Number(media.trackFor('episode', episode)?.progress || 0) < 0.9))
const confirmation = computed(() => pendingAction.value === 'earlier'
  ? `Mark library episodes before S${props.season} E${firstUnwatched.value?.airedEpisodeNumber} watched? ${Number(props.season) > 0 ? 'Specials are excluded.' : ''}`
  : `Mark all ${props.episodes.length} library episodes in ${seasonLabel.value} ${pendingAction.value}?`)
let generation = 0
watch(() => [props.seriesId, props.season], () => { generation++; pendingAction.value = ''; error.value = ''; saving.value = false })
onBeforeUnmount(() => { generation++ })
async function save (close) {
  if (saving.value) return
  saving.value = true
  error.value = ''
  const current = generation
  const epoch = media.epoch
  try {
    const result = pendingAction.value === 'earlier'
      ? await oblectoClient.seriesLibrary.markEarlierWatched(props.seriesId, firstUnwatched.value.id)
      : await oblectoClient.seriesLibrary.setSeasonWatched(props.seriesId, props.season, pendingAction.value === 'watched')
    if (epoch !== media.epoch) return
    if (!Array.isArray(result?.episodes) || result.episodes.some(episode => !episode.track)) throw new Error('Invalid watch-state response')
    for (const episode of result.episodes) media.applyProgress({ type: 'episode', id: episode.id, track: episode.track }, { persisted: true })
    if (generation !== current) return
    emit('updated', result.episodes)
    pendingAction.value = ''
    close(true)
  } catch (reason) {
    if (generation === current && epoch === media.epoch) error.value = describeError(reason, 'Could not update these episodes. Try again.')
  } finally { if (generation === current) saving.value = false }
}
</script>
<style scoped lang="sass">
.confirmation p, .season-error
  margin: 10px 12px
  font-size: 0.82rem
  line-height: 1.5
.scope-note
  color: var(--color-text-muted)
.season-error
  color: var(--color-danger)
</style>
