export const groups = [
  {
    label: 'Server',
    items: [
      { name: 'SettingsOverview', label: 'Overview', description: 'Library setup, background work and issues needing attention.' },
      {
        name: 'SettingsMaintenance',
        label: 'Maintenance',
        description: 'Run indexing, cleanup, artwork and metadata jobs on demand.'
      },
      {
        name: 'ServerStatus',
        label: 'Status',
        description: 'Live streaming sessions and the clients currently connected.'
      },
      {
        name: 'ProblematicFiles',
        label: 'Problem files',
        description: 'Files the indexer could not identify or read, why, and a way to retry.'
      }
    ]
  },
  {
    label: 'Library',
    items: [
      {
        name: 'SettingsLibraries',
        label: 'Libraries',
        description: 'The folders Oblecto scans, and how each library identifies and updates its titles.'
      },
      {
        name: 'SettingsSets',
        label: 'Sets',
        description: 'Collections that group movies or TV shows together.'
      },
      {
        name: 'IndexerSettings',
        label: 'Indexer',
        description: 'When scans and cleanups run, and which file extensions count as video.'
      },
      { name: 'MetadataSettings', label: 'Metadata providers', description: 'Manage API keys and test access to metadata and artwork services.' },
      {
        name: 'ArtworkSettings',
        label: 'Artwork',
        description: 'Where posters, fanart and banners come from, and the sizes kept on disk.'
      }
    ]
  },
  {
    label: 'Access',
    items: [
      {
        name: 'SettingsUsers',
        label: 'Users',
        description: 'Accounts that can sign in to this server.'
      },
      {
        name: 'SignInSettings',
        label: 'Sign-in',
        description: 'Profile picker and password-less sign-in on the local network.'
      }
    ]
  },
  {
    label: 'Network',
    items: [
      {
        name: 'FederationSettings',
        label: 'Federation',
        description: 'Share libraries and streaming capacity with other Oblecto servers.'
      },
      {
        name: 'SeedboxSettings',
        label: 'Seedboxes',
        description: 'Remote hosts Oblecto imports finished downloads from.'
      }
    ]
  }
]


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
    "label": "Store assets with file",
    "anchor": "setting-assets-storeWithFile",
    "description": "",
    "keywords": "assets.storeWithFile"
  },
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
    "label": "Re-index on startup",
    "anchor": "setting-movies-doReIndex",
    "description": "Revisit already indexed files when scanning; this can take longer.",
    "keywords": "movies.doReIndex"
  },
  {
    "name": "SettingsLibraries",
    "label": "Index broken files",
    "anchor": "setting-movies-indexBroken",
    "description": "Attempt to index files even when probing reports a problem.",
    "keywords": "movies.indexBroken"
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
    "label": "Re-index on startup",
    "anchor": "setting-tvshows-doReIndex",
    "description": "Revisit already indexed files when scanning; this can take longer.",
    "keywords": "tvshows.doReIndex"
  },
  {
    "name": "SettingsLibraries",
    "label": "Index broken files",
    "anchor": "setting-tvshows-indexBroken",
    "description": "Attempt to index files even when probing reports a problem.",
    "keywords": "tvshows.indexBroken"
  },
  {
    "name": "SettingsLibraries",
    "label": "Ignore series mismatch",
    "anchor": "setting-tvshows-ignoreSeriesMismatch",
    "description": "Allow an episode match even when its series identifier differs from the expected series.",
    "keywords": "tvshows.ignoreSeriesMismatch"
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
