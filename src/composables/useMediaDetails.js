import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useMediaStore } from '@/stores/media'

// Each section owns its request generation so retries do not reset the page.
export function useDetailResource (id, fetch, initial = null, validate = () => true, { watchState = false } = {}) {
  const media = useMediaStore()
  const data = ref(initial)
  const loading = ref(false)
  const error = ref('')
  let request = 0
  let busy = false
  let refreshPending = false
  let disposed = false

  async function reload (silent = false) {
    const epoch = media.epoch
    const current = ++request
    const mediaId = id()
    if (!mediaId) {
      data.value = initial
      loading.value = false
      error.value = ''
      return
    }
    busy = true
    loading.value = silent !== true
    error.value = ''
    try {
      const result = await fetch(mediaId)
      if (!validate(result)) throw new Error('Invalid response')
      if (current === request && epoch === media.epoch) data.value = result
    } catch {
      if (current === request && epoch === media.epoch) error.value = 'This content is unavailable. Please try again.'
    } finally {
      if (current === request) {
        loading.value = busy = false
        if (refreshPending && !disposed && epoch === media.epoch) {
          refreshPending = false
          void reload(true)
        }
      }
    }
  }

  watch(id, () => { data.value = initial; refreshPending = false; reload() }, { immediate: true })
  watch(() => [media.catalogRevision, watchState ? media.watchRevision : 0], () => {
    if (busy) refreshPending = true
    else void reload(true)
  })
  onBeforeUnmount(() => { disposed = true; request++ })
  return { data, loading, error, reload }
}

export function useMediaDetails (id, getInfo, getRelated = async () => [], type = null) {
  const media = useMediaStore()
  const info = useDetailResource(id, getInfo, null, value => Boolean(value?.id))
  const related = useDetailResource(id, getRelated, [], Array.isArray)
  return {
    item: computed({ get: () => media.withProgress(type, info.data.value), set: value => { info.data.value = value } }),
    loading: info.loading, error: info.error, reload: info.reload,
    related: computed({
      get: () => type === 'series' ? related.data.value.map(item => media.withProgress('episode', item)) : related.data.value,
      set: value => { related.data.value = value }
    }),
    relatedLoading: related.loading, relatedError: related.error, reloadRelated: related.reload
  }
}
