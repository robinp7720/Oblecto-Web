import { reactive } from 'vue'

// One shared confirm dialog, mounted once in App.vue. Replaces window.confirm()
// so destructive actions are styled like the rest of the app and can explain
// what is about to happen instead of just asking "are you sure?".
const defaults = {
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  destructive: false
}

export const confirmState = reactive({ ...defaults, open: false })

let resolve = null

export function confirm (options = {}) {
  // Resolve a still-pending request rather than leaking its promise.
  settleConfirm(false)

  Object.assign(confirmState, defaults, typeof options === 'string' ? { title: options } : options)
  confirmState.open = true

  return new Promise(resolvePrompt => {
    resolve = resolvePrompt
  })
}

export function settleConfirm (accepted) {
  const pending = resolve

  resolve = null
  confirmState.open = false

  if (pending) pending(Boolean(accepted))
}
