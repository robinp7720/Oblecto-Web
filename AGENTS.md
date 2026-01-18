# Frontend (Oblecto-Web/)

What lives here
- Vue 2 single-page frontend for Oblecto.
- Entry: `src/main.js` + `src/App.vue`.
- Routing in `src/router/`, state in `src/store/`.
- API client in `src/oblectoClient.js`, realtime in `src/socket.js`.
- API client library is in src/oblecto-client/ ideally all api calls should be made through it.
  - If anything is not exposed through the library, it should be added there.

A documentation of the API is available at ../docs/API.md.

How to run
- Install: `npm install`
- Dev server: `npm run dev` or `npm start`
- Build: `npm run build` (outputs `dist/`)
- Tests: `npm run test` (unit + e2e)
- Lint: `npm run lint`

Config
- When not running backend locally, update `config/dev.env.json` with the backend host.

Notes
- This project uses Vue 2 and an older webpack toolchain; keep changes compatible.
- Built assets are consumed by the backend release (see root `npm run build:web`).
