// Track languages as media files label them. ffprobe reports ISO 639-2 codes,
// and both the bibliographic (fre, ger) and terminology (fra, deu) forms turn
// up, sometimes alongside two-letter tags. Each entry lists every spelling of
// one language; the first is what a preference stores.
export const TRACK_LANGUAGES = [
  ['eng', 'en'], ['spa', 'es'], ['fre', 'fra', 'fr'], ['ger', 'deu', 'de'], ['ita', 'it'],
  ['por', 'pt'], ['dut', 'nld', 'nl'], ['swe', 'sv'], ['nor', 'nob', 'nno', 'no', 'nb', 'nn'],
  ['dan', 'da'], ['fin', 'fi'], ['ice', 'isl', 'is'], ['pol', 'pl'], ['cze', 'ces', 'cs'],
  ['slo', 'slk', 'sk'], ['hun', 'hu'], ['rum', 'ron', 'ro'], ['bul', 'bg'], ['gre', 'ell', 'el'],
  ['rus', 'ru'], ['ukr', 'uk'], ['tur', 'tr'], ['ara', 'ar'], ['heb', 'he'], ['per', 'fas', 'fa'],
  ['hin', 'hi'], ['tha', 'th'], ['vie', 'vi'], ['ind', 'id'], ['may', 'msa', 'ms'],
  ['chi', 'zho', 'zh'], ['jpn', 'ja'], ['kor', 'ko']
]

const spellings = new Map(TRACK_LANGUAGES.flatMap(codes => codes.map(code => [code, codes[0]])))

// One code per language, so "fra" and "fre" compare equal.
export function canonicalLanguage (code) {
  if (!code) return null

  const lower = String(code).toLowerCase().split('-')[0]

  return spellings.get(lower) || lower
}

// The two-letter code Intl.DisplayNames understands, where there is one.
export function displayCode (code) {
  const codes = TRACK_LANGUAGES.find(entry => entry[0] === canonicalLanguage(code))

  return codes?.find(entry => entry.length === 2) || code
}

/**
 * Index of the first stream in `language`, or null when there is none (or no
 * preference), so the server keeps its own default.
 */
export function streamInLanguage (streams, language) {
  const wanted = canonicalLanguage(language)

  if (!wanted) return null

  const match = streams.find(stream => canonicalLanguage(stream.tags?.language || stream.tags_language) === wanted)

  return match ? match.index : null
}
