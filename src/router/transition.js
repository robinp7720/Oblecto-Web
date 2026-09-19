// The page transition runs out-in, so the old page is still on screen for a
// moment after the route changes. Scrolling straight away would jump it
// before it fades; instead the scroll waits until it has left.

// Longer than the leave transition, so a navigation that turns out not to
// swap the page never leaves the scroll waiting.
const FALLBACK_MS = 400

let pending = null

export function pageLeave () {
  pending?.()

  return new Promise(resolve => {
    const timer = setTimeout(done, FALLBACK_MS)

    function done () {
      clearTimeout(timer)
      if (pending === done) pending = null
      resolve()
    }

    pending = done
  })
}

// Called from the page transition's after-leave hook.
export function pageLeft () {
  pending?.()
}
