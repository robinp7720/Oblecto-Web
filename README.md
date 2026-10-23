# Oblecto Vue.js frontend

A frontend for Oblecto, an open source media server, which can be found here: [https://github.com/robinp7720/Oblecto]

## Build Setup

Oblecto-Web is a Vue 3 + Vite app. It is normally built from the Oblecto repository with `npm run build:web`, and Oblecto serves it at `/web/`.

To work on it on its own:

```sh
npm install
npm run dev      # Vite dev server, talking to http://localhost:8080
npm run build    # publishes the build to dist/web/
npm run lint
```

Set `OBLECTO_HOST` to use an Oblecto server other than `http://localhost:8080`, and add the dev server's origin (e.g. `http://localhost:5173`) to that server's `server.corsOrigins`. Set `OBLECTO_WEB_DIST_ROOT` to build somewhere other than `dist/`, for example to check a build without replacing the one a running server uses.

See [AGENTS.md](AGENTS.md) for how the app is organised, and [DESIGN_GUIDE.md](DESIGN_GUIDE.md) for its visual design.

## Images
### TV Show Listings
![TV Shows Listings](https://raw.githubusercontent.com/robinp7720/Oblecto-Web/master/images/tvshows.jpg)
### Episode and Show info
![Show Info](https://raw.githubusercontent.com/robinp7720/Oblecto-Web/master/images/tvshow.jpg)
### Movie Listings
![Movie Listings](https://raw.githubusercontent.com/robinp7720/Oblecto-Web/master/images/movies.jpg)
### Search View
![Search View](https://raw.githubusercontent.com/robinp7720/Oblecto-Web/master/images/search.jpg)

### Playback on slow connections

Unset account preferences use Auto, starting at the lowest available rendition and adapting to bandwidth. Saved Original and fixed-height preferences are preserved. Available output includes 240p. The player targets 30 seconds ahead, caps forward buffering at 60 seconds and retains 30 seconds behind. Server status reports buffered/stalled time and queue/generation timing when supported by the backend. See the parent repository’s `docs/STREAMING.md` for encoder modes and performance acceptance.
