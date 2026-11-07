import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLibrariesStore } from '@/stores/libraries'
import oblectoClient from '@/oblectoClient'

export function useLibraryStatistics () {
  const auth = useAuthStore()
  const libraries = useLibrariesStore()
  const rows = ref([])
  const statisticsLoading = ref(false)
  const statisticsError = ref('')
  const allowed = computed(() => auth.authenticated && auth.can('libraries.manage'))
  let generation = 0

  async function refreshStatistics () {
    const current = ++generation
    const token = oblectoClient.accessToken
    rows.value = []
    statisticsError.value = ''
    statisticsLoading.value = allowed.value
    if (!allowed.value) return
    try {
      const result = await oblectoClient.libraries.statistics()
      if (current !== generation || token !== oblectoClient.accessToken) return
      if (!Array.isArray(result?.libraries)) throw new Error('Invalid statistics response')
      rows.value = result.libraries
    } catch {
      if (current === generation && token === oblectoClient.accessToken) statisticsError.value = 'Could not load library statistics.'
    } finally {
      if (current === generation) statisticsLoading.value = false
    }
  }

  // Both add and remove operations update the existing library store.
  watch(() => [allowed.value, auth.me?.id, JSON.stringify([libraries.movies, libraries.shows])], refreshStatistics, { immediate: true })
  onBeforeUnmount(() => { generation++ })
  const byPath = computed(() => new Map(rows.value.map(row => [JSON.stringify([row.type, row.path]), row])))
  const statisticsFor = (type, path) => byPath.value.get(JSON.stringify([type, path]))
  return { statisticsLoading, statisticsError, statisticsFor, refreshStatistics }
}
