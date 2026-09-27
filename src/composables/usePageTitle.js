import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { pageKey } from '@/router/transition'

// Tab and history titles. Pages with a fixed name set `meta.title` on their
// route (applied in router/index.js); pages that only know their name once
// their data arrives call usePageTitle.

// The name each visited page gave itself, by full path, so a back link can
// say where it goes ("‹ Alien") rather than just "Back".
const titles = new Map()

export function rememberTitle (path, name) {
  if (path && name) titles.set(path, name)
}

export function titleOf (path) {
  return titles.get(path)
}

export function formatTitle (name) {
  return name ? `${name} · Oblecto` : 'Oblecto'
}

export function routeTitle (route) {
  const title = route.meta?.title

  return typeof title === 'function' ? title(route) : title
}

export function usePageTitle (source) {
  const route = useRoute()
  // A leaving page keeps rendering through the page transition after the
  // route has moved on, and must not rename the tab of the page replacing it.
  const page = pageKey(route)

  watch([source, () => pageKey(route) === page, () => route.fullPath], ([name, current, path]) => {
    if (!name || !current) return
    document.title = formatTitle(name)
    rememberTitle(path, name)
  }, { immediate: true })
}
