# Frontend (Oblecto-Web/)

What lives here
- Vue 3 + Vite single-page frontend for Oblecto.
- Entry: `src/main.js` + `src/App.vue`.
- Routing in `src/router/`, state in `src/stores/` (Pinia).
- API client in `src/oblectoClient.js`, realtime in `src/socket.js`.
- API client library is in src/oblecto-client/ ideally all api calls should be made through it.
  - If anything is not exposed through the library, it should be added there.

A documentation of the REST API is available at ../docs/API.md.
A documentation of the Websocket API is available at ../docs/REALTIME_API.md.

How to run
- Install: `npm install`
- Dev server: `npm run dev` (talks to http://localhost:8080 by default)
- Build: `npm run build` (stages the Vite output, then publishes to `dist/web/`)
- To verify a build without deploying to a running server, set
  `OBLECTO_WEB_DIST_ROOT` to a separate temporary directory.
- Build publisher tests: `npm run test:build`
- Tests: from the repo root, `npm run test:player:ui` drives the player UI and
  `npm run test:playback:browser` covers PlaybackController.
- Lint: `npm run lint`

Config
- The dev server is another origin, so add it to the backend's `server.corsOrigins`, e.g. `["http://localhost:5173"]`.
- `npm run build` publishes the new `index.html` after its assets are available.
  Builds on a running server still deploy immediately. Older hashed assets stay
  available for open tabs; remove stale assets only during an offline cleanup.

Notes
- This project uses Vue 3 with Vite. Newer components are `<script setup>` with
  scoped SASS; older ones are still Options API.
- Shared state uses Pinia: app/playback, auth, media, search, libraries, seedbox
  transfers and connection health in `src/stores/`; remote devices in
  `src/remote/state.js`. Pinia is installed before auth hydration and sockets.
- `src/stores/media.js` merges live and saved progress, batches catalog changes,
  and resyncs loaded resources on reconnect. Refreshes preserve browse filters
  and loaded pages. Logout clears stores and invalidates in-flight responses.
- The video player lives in `src/components/player/` with composables in
  `src/composables/player/`. `src/playback/PlaybackController.js` owns sessions,
  hls.js and error recovery; the components only render its state.
- Remote play lives in `src/remote/`: `device.js` (this device's persisted id and
  name), `state.js` (the device list and selected target), `transport.js` (the
  only module that knows the socket event names) and `receiver.js` (executes
  commands arriving from another device). `src/socket.js` authenticates in the
  handshake, so it connects only once a token exists. The control surface is
  `src/components/remote/RemoteControlBar.vue`, which drives the player's own
  seek bar and volume components rather than duplicating them. Protocol
  reference: `../docs/REALTIME_API.md`.
- Built assets are consumed by the backend release (see root `npm run build:web`).
