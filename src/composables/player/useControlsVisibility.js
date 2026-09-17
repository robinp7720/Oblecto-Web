import { onBeforeUnmount, ref, watch } from 'vue'

/**
 * Idle auto-hide for the player chrome.
 *
 * The old implementation counted `timeupdate` ticks and reset the counter from
 * `@mousemove` only, so on a touch device the controls hid after a few seconds
 * and could never be brought back. This is input-agnostic: anything that counts
 * as activity calls `notifyActivity()`, and a tap can always reveal the chrome.
 */
export function useControlsVisibility ({ active, paused, pinned, idleDelay = 3000 }) {
  const visible = ref(true)
  let timer = null

  function clear () {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function shouldHold () {
    return !active.value || paused.value || pinned.value
  }

  function schedule () {
    clear()
    if (shouldHold()) return
    timer = setTimeout(() => { visible.value = false }, idleDelay)
  }

  function show () {
    visible.value = true
    schedule()
  }

  function hide () {
    if (shouldHold()) return
    clear()
    visible.value = false
  }

  function toggle () {
    if (visible.value) hide()
    else show()
  }

  function notifyActivity () {
    visible.value = true
    schedule()
  }

  // Pausing, losing the media, or opening a menu must reveal the chrome and
  // keep it up until the reason goes away.
  watch([active, paused, pinned], () => {
    if (shouldHold()) {
      clear()
      visible.value = true
      return
    }

    schedule()
  }, { immediate: true })

  onBeforeUnmount(clear)

  return { visible, show, hide, toggle, notifyActivity }
}
