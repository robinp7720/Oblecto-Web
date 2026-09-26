import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { pageKey } from '@/router/transition'

// Tab and history titles. Pages with a fixed name set `meta.title` on their
// route (applied in router/index.js); pages that only know their name once
// their data arrives call usePageTitle.

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

  watch([source, () => pageKey(route) === page], ([name, current]) => {
    if (name && current) document.title = formatTitle(name)
  }, { immediate: true })
}
