import { nextTick, ref } from 'vue'

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

// Card transitions ------------------------------------------------------------
//
// Opening a title from a card grows the new page out of the card's artwork,
// and going back folds it into the same spot. This uses the View Transitions
// API, which snapshots the page before and after the route renders; while one
// runs, the Vue page transition steps aside (see `cardTransitionActive`).
// Browsers without the API, and reduced motion, keep the plain page fade.

// True while a card transition owns the page change.
export const cardTransitionActive = ref(false)

// A click only counts for the navigation that follows it straight away.
const CLICK_WINDOW_MS = 1000
// Upper bound on how long the page stays frozen waiting for the new route to
// render, so a stalled navigation can never lock the screen.
const UPDATE_TIMEOUT_MS = 1500

let clicked = null // { el, rect, scrollY, at }
let opened = null // { from, to, rect, scrollY }, for folding back on Back
let poppedAt = -Infinity
let scrollHandledFor = null
let finishUpdate = null

function reducedMotion () {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Cards mark themselves with data-motion-card, and the artwork to grow from
// with data-motion-origin. Captured before RouterLink handles the click.
function onClick (event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = event.target.closest('a[href]')
  const card = link?.closest('[data-motion-card]')
  if (!card) return
  const el = card.querySelector('[data-motion-origin]') || card

  clicked = { el, rect: el.getBoundingClientRect(), scrollY: window.scrollY, at: performance.now() }
}

function setRect (rect) {
  const style = document.documentElement.style

  style.setProperty('--vt-top', `${rect.top}px`)
  style.setProperty('--vt-right', `${window.innerWidth - rect.right}px`)
  style.setProperty('--vt-bottom', `${window.innerHeight - rect.bottom}px`)
  style.setProperty('--vt-left', `${rect.left}px`)
}

function run (kind, rect, originEl, scrollTo) {
  const root = document.documentElement

  setRect(rect)
  // The header only holds still when it is on screen at the top; scrolled
  // away, it arrives with the rest of the new page.
  const headerTop = document.querySelector('.shell-header')?.getBoundingClientRect().top
  root.classList.toggle('vt-hold-header', headerTop === 0 && scrollTo === 0)
  root.classList.add('vt-card', `vt-card-${kind}`)
  if (originEl) originEl.style.viewTransitionName = 'motion-origin'
  cardTransitionActive.value = true

  return new Promise(resolve => {
    const transition = document.startViewTransition(async () => {
      // The old page has been captured; let the navigation go ahead and wait
      // for the new route to render before the new page is captured.
      if (originEl) originEl.style.viewTransitionName = ''
      resolve()
      await new Promise(done => {
        finishUpdate = done
        setTimeout(done, UPDATE_TIMEOUT_MS)
      })
      finishUpdate = null
      window.scrollTo(0, scrollTo)
    })

    transition.finished.finally(() => {
      root.classList.remove('vt-card', `vt-card-${kind}`, 'vt-hold-header')
      if (originEl) originEl.style.viewTransitionName = ''
      cardTransitionActive.value = false
    })
    // Skipped transitions reject these; the navigation carries on regardless.
    transition.ready.catch(() => {})
    transition.updateCallbackDone.catch(() => resolve())
  })
}

export function installCardTransitions (router) {
  if (typeof document === 'undefined' || !document.startViewTransition) return

  document.addEventListener('click', onClick, true)
  // Not a popstate listener: the router starts its guards from its own
  // popstate handler, and they can finish before a later listener runs.
  router.options.history.listen(() => { poppedAt = performance.now() })

  router.beforeResolve((to, from) => {
    const click = clicked
    clicked = null
    if (reducedMotion() || !from.matched.length) return

    const popped = performance.now() - poppedAt < CLICK_WINDOW_MS

    if (!popped && click && performance.now() - click.at < CLICK_WINDOW_MS && click.el.isConnected) {
      opened = { from: from.fullPath, to: to.fullPath, rect: click.rect, scrollY: click.scrollY }
      scrollHandledFor = to.fullPath

      return run('open', click.rect, click.el, 0)
    }

    // Back to the page the card was on: fold into the card, with the page
    // scrolled to where it was when the card was clicked.
    if (popped && opened && from.fullPath === opened.to && to.fullPath === opened.from) {
      const { rect, scrollY } = opened
      opened = null
      scrollHandledFor = to.fullPath

      return run('close', rect, null, scrollY)
    }
  })

  router.afterEach(async () => {
    if (!finishUpdate) return
    await nextTick()
    finishUpdate?.()
  })
}

// Lets scrollBehavior stand down when a card transition already scrolled.
export function scrollHandled (to) {
  if (scrollHandledFor !== to.fullPath) return false
  scrollHandledFor = null

  return true
}
