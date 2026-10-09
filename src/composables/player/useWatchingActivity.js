import { onBeforeUnmount, onMounted, ref } from 'vue'

export const WATCHING_IDLE_MS = 90 * 60 * 1000

// Separate from control visibility: playback events and autoplay must never
// count as viewer interaction. Check elapsed time at transitions, avoiding
// background-tab timer throttling and interruptions during an episode.
export function useWatchingActivity ({ active, awaitingConfirmation }) {
  const lastActivity = ref(Date.now())
  const events = ['pointermove', 'pointerdown', 'click', 'keydown', 'touchstart', 'wheel']

  function reset () {
    lastActivity.value = Date.now()
  }

  function notify () {
    if (active.value && !awaitingConfirmation.value) reset()
  }

  onMounted(() => events.forEach(event => window.addEventListener(event, notify, { capture: true, passive: true })))
  onBeforeUnmount(() => events.forEach(event => window.removeEventListener(event, notify, true)))

  return { reset, notify, overdue: () => Date.now() - lastActivity.value >= WATCHING_IDLE_MS }
}
