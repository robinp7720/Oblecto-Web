# Frontend (Oblecto-Web/)

What lives here
- Vue 2 single-page frontend for Oblecto.
- Entry: `src/main.js` + `src/App.vue`.
- Routing in `src/router/`, state in `src/store/`.
- API client in `src/oblectoClient.js`, realtime in `src/socket.js`.
- API client library is in src/oblecto-client/ ideally all api calls should be made through it.
  - If anything is not exposed through the library, it should be added there.

A documentation of the REST API is available at ../docs/API.md.
A documentation of the Websocket API is available at ../docs/REALTIME_API.md.

How to run
- Install: `npm install`
- Dev server: `npm run dev` or `npm start`
- Build: `npm run build` (outputs `dist/`)
- Tests: from the repo root, `npm run test:player:ui` drives the player UI and
  `npm run test:playback:browser` covers PlaybackController.
- Lint: `npm run lint`

Config
- When not running backend locally, update `config/dev.env.json` with the backend host.

Notes
- This project uses Vue 3 with Vite. Newer components are `<script setup>` with
  scoped SASS; older ones are still Options API.
- State is split: playback and legacy data live in Vuex (`src/store/`), auth and
  newer features in Pinia (`src/stores/`).
- The video player lives in `src/components/player/` with composables in
  `src/composables/player/`. `src/playback/PlaybackController.js` owns sessions,
  hls.js and error recovery; the components only render its state.
- Built assets are consumed by the backend release (see root `npm run build:web`).
