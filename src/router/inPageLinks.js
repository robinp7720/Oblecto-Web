// Links within a page (#movie-files, a season jump, the skip link) used to
// push a history entry each, with no router state. Back then went nowhere
// visible, and a title page's own back link could not tell how far back it
// had been opened from. They now replace the current entry's hash through the
// router and scroll (and, where the target takes focus, focus) themselves.
export function installInPageLinks (router) {
  if (typeof document === 'undefined') return

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const link = event.target.closest?.('a[href^="#"]')
    const id = link?.getAttribute('href').slice(1)
    const target = id && document.getElementById(decodeURIComponent(id))
    if (!target) return

    event.preventDefault()
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' })
    if (target.tabIndex >= 0 || target.hasAttribute('tabindex')) target.focus({ preventScroll: true })
    void router.replace({ ...router.currentRoute.value, hash: `#${id}` })
  })
}
