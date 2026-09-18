import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'

// Interface languages that ship with this build. Add a locale file and list it
// here; the account page only offers what is listed.
export const LOCALES = [
  { code: 'en', messages: en }
]

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: Object.fromEntries(LOCALES.map(locale => [locale.code, locale.messages]))
})

function available (tag) {
  if (!tag) return null
  if (LOCALES.some(locale => locale.code === tag)) return tag

  const base = tag.split('-')[0]

  return LOCALES.some(locale => locale.code === base) ? base : null
}

/**
 * The user's chosen language if this build has it, else the browser's, else
 * English.
 */
export function resolveLocale (preferred) {
  const browser = typeof navigator === 'undefined' ? [] : navigator.languages || [navigator.language]

  for (const tag of [preferred, ...browser]) {
    const locale = available(tag)

    if (locale) return locale
  }

  return 'en'
}

export function applyLocale (preferred) {
  const locale = resolveLocale(preferred)

  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}

// A language's name in the current interface language, e.g. "Japanese".
export function languageName (code) {
  try {
    const name = new Intl.DisplayNames([i18n.global.locale.value], { type: 'language' }).of(code)

    return name ? name.charAt(0).toLocaleUpperCase() + name.slice(1) : code
  } catch {
    return code
  }
}
