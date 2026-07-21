import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const oblectoTarget = process.env.OBLECTO_PROXY_TARGET ?? 'http://oblecto';
const oblectoWsTarget = oblectoTarget.replace(/^http/, 'ws');

export default defineConfig({
  base: '/web/',
  plugins: [react()],
  build: {
    outDir: 'dist/web',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': oblectoTarget,
      '/movies': oblectoTarget,
      '/movie': oblectoTarget,
      '/series': oblectoTarget,
      '/shows': oblectoTarget,
      '/episodes': oblectoTarget,
      '/episode': oblectoTarget,
      '/session': oblectoTarget,
      '/HLS': oblectoTarget,
      '/api': oblectoTarget,
      '/users': oblectoTarget,
      '/user': oblectoTarget,
      '/files': oblectoTarget,
      '/set': oblectoTarget,
      '/socket.io': {
        target: oblectoWsTarget,
        ws: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
});
