import { ref, watch, onBeforeUnmount } from 'vue'

// Route changes can reuse a detail component. Ignore responses for an older title.
export function useMediaDetails (id, getInfo, getRelated = async () => []) {
  const item = ref(null)
  const related = ref([])
  const loading = ref(false)
  const error = ref('')
  const relatedError = ref('')
  let request = 0

  async function reload () {
    const current = ++request
    const mediaId = id()
    if (!mediaId) return
    loading.value = true
    error.value = ''
    relatedError.value = ''
    item.value = null
    related.value = []
    const [infoResult, relatedResult] = await Promise.allSettled([getInfo(mediaId), getRelated(mediaId)])
    if (current !== request) return
    if (infoResult.status === 'fulfilled' && infoResult.value?.id) {
      item.value = infoResult.value
    } else {
      error.value = 'We couldn’t load this title. Please try again.'
    }
    if (relatedResult.status === 'fulfilled') {
      related.value = Array.isArray(relatedResult.value) ? relatedResult.value : []
    } else {
      relatedError.value = 'Additional content is unavailable. Please try again.'
    }
    loading.value = false
  }

  watch(id, reload, { immediate: true })
  onBeforeUnmount(() => { request++ })
  return { item, related, loading, error, relatedError, reload }
}
