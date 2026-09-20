import { ref, watch, onBeforeUnmount } from 'vue'

// Each section owns its request generation so retries do not reset the page.
export function useDetailResource (id, fetch, initial = null, validate = () => true) {
  const data = ref(initial)
  const loading = ref(false)
  const error = ref('')
  let request = 0

  async function reload () {
    const current = ++request
    const mediaId = id()
    if (!mediaId) {
      data.value = initial
      loading.value = false
      error.value = ''
      return
    }
    loading.value = true
    error.value = ''
    try {
      const result = await fetch(mediaId)
      if (!validate(result)) throw new Error('Invalid response')
      if (current === request) data.value = result
    } catch {
      if (current === request) error.value = 'This content is unavailable. Please try again.'
    } finally {
      if (current === request) loading.value = false
    }
  }

  watch(id, () => { data.value = initial; reload() }, { immediate: true })
  onBeforeUnmount(() => { request++ })
  return { data, loading, error, reload }
}

export function useMediaDetails (id, getInfo, getRelated = async () => []) {
  const info = useDetailResource(id, getInfo, null, value => Boolean(value?.id))
  const related = useDetailResource(id, getRelated, [], Array.isArray)
  return {
    item: info.data, loading: info.loading, error: info.error, reload: info.reload,
    related: related.data, relatedLoading: related.loading, relatedError: related.error, reloadRelated: related.reload
  }
}
