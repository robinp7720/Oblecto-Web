// Labels and descriptions live in the locale files under
// settings.groups.<id> and settings.pages.<name>. `permission` is what the
// server requires for the page's requests; pages without one are open to
// every signed-in user.
export const groups = [
  {
    id: 'account',
    items: [
      { name: 'AccountProfile' },
      { name: 'AccountPassword' },
      { name: 'AccountPreferences' }
    ]
  },
  {
    id: 'server',
    items: [
      { name: 'SettingsOverview', permission: 'settings.manage' },
      { name: 'SettingsMaintenance', permission: 'system.manage' },
      { name: 'ServerStatus', permission: 'system.manage' },
      { name: 'ProblematicFiles', permission: 'libraries.manage' }
    ]
  },
  {
    id: 'library',
    items: [
      { name: 'SettingsLibraries', permission: 'libraries.manage' },
      { name: 'SettingsSets', permission: 'libraries.manage' },
      { name: 'IndexerSettings', permission: 'settings.manage' },
      { name: 'MetadataSettings', permission: 'settings.manage' },
      { name: 'ArtworkSettings', permission: 'settings.manage' }
    ]
  },
  {
    id: 'access',
    items: [
      { name: 'SettingsUsers', permission: 'users.manage' },
      { name: 'SettingsGroups', permission: 'users.manage' },
      { name: 'SignInSettings', permission: 'settings.manage' }
    ]
  },
  {
    id: 'network',
    items: [
      { name: 'FederationSettings', permission: 'settings.manage' },
      { name: 'SeedboxSettings', permission: 'settings.manage' }
    ]
  }
]

export const pages = groups.flatMap(group => group.items.map(item => ({ ...item, group: group.id })))

export const pagePermission = name => pages.find(page => page.name === name)?.permission

// The groups and pages `can` (the auth store's permission check) allows.
export function visibleGroups (can) {
  return groups
    .map(group => ({ ...group, items: group.items.filter(item => !item.permission || can(item.permission)) }))
    .filter(group => group.items.length)
}

// Whether any server page is open to this user, which decides between
// "Settings" and "Account" in the header menu.
export const canSeeServerSettings = can => pages.some(page => page.permission && can(page.permission))

// Search index for individual settings. Still English only; the page labels
// above are translated.
export const settingsFields = [
  { name: 'SignInSettings', label: 'Show profiles on the sign-in screen', anchor: 'setting-authentication-profilePicker', keywords: 'login profile picker avatar local network' },
  { name: 'SignInSettings', label: 'Password-less sign-in on the local network', anchor: 'setting-authentication-localPasswordlessLogin', keywords: 'login password lan local network' },
  { name: 'SignInSettings', label: 'Additional local subnets', anchor: 'setting-authentication-localSubnets', keywords: 'lan vpn cidr network' },
  { name: 'SignInSettings', label: 'Behind a reverse proxy', anchor: 'setting-authentication-trustProxy', keywords: 'x-forwarded-for proxy nginx' },
  { name: 'IndexerSettings', label: 'Video file extensions', anchor: 'setting-video-extensions', keywords: 'mkv mp4 file types' },
  { name: 'SettingsLibraries', label: 'Movie library folders', anchor: 'setting-movie-folders', keywords: 'directories paths source' },
  { name: 'SettingsLibraries', label: 'TV show library folders', anchor: 'setting-tv-folders', keywords: 'directories paths source' },
  {
    "name": "ArtworkSettings",
    "label": "TV show poster folder",
    "anchor": "setting-assets-showPosterLocation",
    "description": "Server path for stored artwork. Relative paths keep the server\u2019s existing path behavior.",
    "keywords": "assets.showPosterLocation"
  },
  {
    "name": "ArtworkSettings",
    "label": "Episode banner folder",
    "anchor": "setting-assets-episodeBannerLocation",
    "description": "Server path for stored artwork. Relative paths keep the server\u2019s existing path behavior.",
    "keywords": "assets.episodeBannerLocation"
  },
  {
    "name": "ArtworkSettings",
    "label": "Movie poster folder",
    "anchor": "setting-assets-moviePosterLocation",
    "description": "Server path for stored artwork. Relative paths keep the server\u2019s existing path behavior.",
    "keywords": "assets.moviePosterLocation"
  },
  {
    "name": "ArtworkSettings",
    "label": "Movie fanart folder",
    "anchor": "setting-assets-movieFanartLocation",
    "description": "Server path for stored artwork. Relative paths keep the server\u2019s existing path behavior.",
    "keywords": "assets.movieFanartLocation"
  },
  {
    "name": "ArtworkSettings",
    "label": "Small poster width",
    "anchor": "setting-artwork-poster-small",
    "description": "",
    "keywords": "artwork.poster.small"
  },
  {
    "name": "ArtworkSettings",
    "label": "Medium poster width",
    "anchor": "setting-artwork-poster-medium",
    "description": "",
    "keywords": "artwork.poster.medium"
  },
  {
    "name": "ArtworkSettings",
    "label": "Large poster width",
    "anchor": "setting-artwork-poster-large",
    "description": "",
    "keywords": "artwork.poster.large"
  },
  {
    "name": "ArtworkSettings",
    "label": "Small fanart width",
    "anchor": "setting-artwork-fanart-small",
    "description": "",
    "keywords": "artwork.fanart.small"
  },
  {
    "name": "ArtworkSettings",
    "label": "Medium fanart width",
    "anchor": "setting-artwork-fanart-medium",
    "description": "",
    "keywords": "artwork.fanart.medium"
  },
  {
    "name": "ArtworkSettings",
    "label": "Large fanart width",
    "anchor": "setting-artwork-fanart-large",
    "description": "",
    "keywords": "artwork.fanart.large"
  },
  {
    "name": "ArtworkSettings",
    "label": "Small banner width",
    "anchor": "setting-artwork-banner-small",
    "description": "",
    "keywords": "artwork.banner.small"
  },
  {
    "name": "ArtworkSettings",
    "label": "Medium banner width",
    "anchor": "setting-artwork-banner-medium",
    "description": "",
    "keywords": "artwork.banner.medium"
  },
  {
    "name": "ArtworkSettings",
    "label": "Large banner width",
    "anchor": "setting-artwork-banner-large",
    "description": "",
    "keywords": "artwork.banner.large"
  },
  {
    "name": "IndexerSettings",
    "label": "Run indexer on startup",
    "anchor": "setting-indexer-runAtBoot",
    "description": "",
    "keywords": "indexer.runAtBoot"
  },
  {
    "name": "IndexerSettings",
    "label": "Run cleaner on startup",
    "anchor": "setting-cleaner-runAtBoot",
    "description": "",
    "keywords": "cleaner.runAtBoot"
  },
  {
    "name": "IndexerSettings",
    "label": "Calculate file hashes",
    "anchor": "setting-files-doHash",
    "description": "",
    "keywords": "files.doHash"
  },
  {
    "name": "FederationSettings",
    "label": "Enable federation",
    "anchor": "setting-federation-enable",
    "description": "",
    "keywords": "federation.enable"
  },
  {
    "name": "FederationSettings",
    "label": "Data port",
    "anchor": "setting-federation-dataPort",
    "description": "",
    "keywords": "federation.dataPort"
  },
  {
    "name": "FederationSettings",
    "label": "Media port",
    "anchor": "setting-federation-mediaPort",
    "description": "",
    "keywords": "federation.mediaPort"
  },
  {
    "name": "FederationSettings",
    "label": "Private key path",
    "anchor": "setting-federation-key",
    "description": "",
    "keywords": "federation.key"
  },
  {
    "name": "SettingsLibraries",
    "label": "Identifiers",
    "anchor": "setting-movies-movieIdentifiers",
    "description": "",
    "keywords": "movies.movieIdentifiers"
  },
  {
    "name": "SettingsLibraries",
    "label": "Updaters",
    "anchor": "setting-movies-movieUpdaters",
    "description": "",
    "keywords": "movies.movieUpdaters"
  },
  {
    "name": "SettingsLibraries",
    "label": "Series identifiers",
    "anchor": "setting-tvshows-seriesIdentifiers",
    "description": "",
    "keywords": "tvshows.seriesIdentifiers"
  },
  {
    "name": "SettingsLibraries",
    "label": "Episode identifiers",
    "anchor": "setting-tvshows-episodeIdentifiers",
    "description": "",
    "keywords": "tvshows.episodeIdentifiers"
  },
  {
    "name": "SettingsLibraries",
    "label": "Series updaters",
    "anchor": "setting-tvshows-seriesUpdaters",
    "description": "",
    "keywords": "tvshows.seriesUpdaters"
  },
  {
    "name": "SettingsLibraries",
    "label": "Episode updaters",
    "anchor": "setting-tvshows-episodeUpdaters",
    "description": "",
    "keywords": "tvshows.episodeUpdaters"
  },
  {
    "name": "MetadataSettings",
    "label": "TMDB API key",
    "anchor": "provider-themoviedb",
    "keywords": "metadata credentials connection"
  },
  {
    "name": "MetadataSettings",
    "label": "TVDB API key",
    "anchor": "provider-tvdb",
    "keywords": "metadata credentials connection"
  },
  {
    "name": "MetadataSettings",
    "label": "Fanart.tv API key",
    "anchor": "provider-fanart.tv",
    "keywords": "metadata credentials connection"
  }
]

export function focusSetting (hash) {
  if (!hash) return
  const target = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!target) return
  const details = target.closest('details')
  if (details) details.open = true
  target.scrollIntoView({ block: 'center' })
  target.focus()
}
