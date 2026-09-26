import { computed, toValue } from 'vue'
import { useRouter } from 'vue-router'
import { routeTitle, titleOf } from '@/composables/usePageTitle'

/**
 * The "‹ Back" link at the top of a title page.
 *
 * With a page of this app behind it in history, it goes back there, named
 * after it ("‹ Search", "‹ Alien"), the way the browser's Back would: the
 * library keeps its filters and scroll position, and a title opened from a
 * card folds back into it. Opened directly (a bookmark, a fresh tab), it
 * goes to the page's parent instead, as it always used to.
 *
 * @param {object|Function} fallback - Route to use without in-app history.
 * @param {string|Function} fallbackLabel - Its name.
 */
export function useBackLink (fallback, fallbackLabel) {
  const router = useRouter()
  // vue-router keeps the previous entry's path, and this entry's position, in
  // history.state; read once, for the entry this page was opened on. In-page
  // links (#show-season-4, #movie-files) add entries of their own after it,
  // so going back is measured from this position, not taken one step.
  const opened = typeof window !== 'undefined' ? window.history.state : null
  const back = opened?.back || null

  const label = computed(() => {
    if (!back) return toValue(fallbackLabel)

    return titleOf(back) || routeTitle(router.resolve(back)) || 'Back'
  })
  const href = computed(() => router.resolve(back || toValue(fallback)).href)

  function go (event) {
    // New tab, new window and the like keep the plain link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    if (!back) return router.push(toValue(fallback))

    const now = window.history.state?.position
    if (Number.isInteger(opened.position) && Number.isInteger(now)) router.go(opened.position - 1 - now)
    else router.back()
  }

  return { label, href, go }
}
