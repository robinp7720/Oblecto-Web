import { computed, onUnmounted, ref, watch } from 'vue'

/**
 * Smooths a remote device's reported position.
 *
 * Reports arrive about once a second. Rendering them as-is gives a seek bar
 * that jumps a second at a time and reads as broken, so between reports the
 * position is advanced locally from the server's `updatedAt` stamp and snapped
 * back on every new report.
 *
 * @param {import('vue').Ref} state - Ref holding the target's PlaybackState, or null.
 * @returns {import('vue').ComputedRef<number>} The position to render, in seconds.
 */
export function useRemotePosition (state) {
  const now = ref(Date.now())
  let timer = null

  const running = computed(() => state.value?.status === 'playing')

  watch(running, isRunning => {
    clearInterval(timer)
    timer = null

    if (!isRunning) return

    // Four times a second is enough to look continuous without making the
    // whole bar re-render on every animation frame.
    timer = setInterval(() => { now.value = Date.now() }, 250)
  }, { immediate: true })

  onUnmounted(() => clearInterval(timer))

  return computed(() => {
    const current = state.value

    if (!current) return 0
    if (current.status !== 'playing') return current.position

    // A clock skew or a stale stamp must never wind the bar backwards.
    const elapsed = Math.max(0, (now.value - current.updatedAt) / 1000)
    const projected = current.position + elapsed

    return current.duration > 0 ? Math.min(projected, current.duration) : projected
  })
}
