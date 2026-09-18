import { ref, onMounted, onBeforeUnmount } from 'vue'
import oblectoClient from '@/oblectoClient'

export function useMaintenanceJobs () {
  const jobs = ref([])
  const error = ref('')
  const loading = ref(true)
  let timer
  let closed = false
  let pending = false
  async function refresh () {
    if (closed || pending || document.hidden) return
    pending = true
    try {
      const data = await oblectoClient.system.getMaintenanceJobs()
      if (!closed) { jobs.value = data; error.value = '' }
    } catch {
      if (!closed) error.value = 'Job status is unavailable. Displayed jobs may be out of date. Reconnecting…'
    } finally {
      pending = false
      loading.value = false
      clearTimeout(timer)
      if (!closed) timer = setTimeout(refresh, 2000)
    }
  }
  function visibility () {
    clearTimeout(timer)
    if (!document.hidden) refresh()
  }
  onMounted(() => { refresh(); document.addEventListener('visibilitychange', visibility) })
  onBeforeUnmount(() => { closed = true; clearTimeout(timer); document.removeEventListener('visibilitychange', visibility) })
  return { jobs, jobsError: error, jobsLoading: loading, refreshJobs: refresh }
}
