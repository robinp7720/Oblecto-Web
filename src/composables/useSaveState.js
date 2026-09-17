import { reactive } from 'vue'

const OK_TIMEOUT = 2500

/**
 * Tracks the outcome of a single save/load so it can be reported next to the
 * control that triggered it, instead of as a toast that covers the page and
 * then disappears before it has been read.
 *
 * Works from both the Options API (`data () { return { save: createSaveState() } }`)
 * and `<script setup>`.
 */
export function createSaveState () {
  let sequence = 0
  let timer = null

  const state = reactive({
    // idle | busy | ok | error
    status: 'idle',
    message: '',

    /**
     * Runs `task`, reflecting its outcome in the state. Never rejects: callers
     * are usually fire-and-forget event handlers. Resolves true on success.
     */
    async run (task, labels = {}) {
      const { busy = 'Saving…', ok = 'Saved', error = 'Could not save' } = labels
      const id = ++sequence

      window.clearTimeout(timer)
      state.status = 'busy'
      state.message = busy

      try {
        await task()
      } catch (e) {
        console.error(error, e)
        if (id === sequence) state.fail(describeError(e, error))
        return false
      }

      // A newer run started while this one was in flight; let it own the state.
      if (id !== sequence) return true

      // An empty `ok` label means a successful run has nothing worth saying —
      // used for plain loads, where only the failure is news.
      if (!ok) {
        state.status = 'idle'
        state.message = ''
        return true
      }

      state.status = 'ok'
      state.message = ok
      timer = window.setTimeout(() => {
        if (id === sequence) state.reset()
      }, OK_TIMEOUT)

      return true
    },

    fail (message) {
      sequence += 1
      window.clearTimeout(timer)
      state.status = 'error'
      state.message = message
    },

    reset () {
      sequence += 1
      window.clearTimeout(timer)
      state.status = 'idle'
      state.message = ''
    }
  })

  return state
}

/**
 * Surfaces what the server actually said. "Failed to save settings" is never
 * enough to act on; "EACCES: permission denied, open '/etc/oblecto'" is.
 */
export function describeError (e, fallback) {
  const data = e?.response?.data
  const detail = (typeof data === 'string' ? data : data?.error || data?.message) || e?.message

  return detail ? `${fallback}: ${detail}` : fallback
}
