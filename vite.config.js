import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  // Logic to match the old webpack config values
  let oblectoHost = 'http://oblecto'
  let basePath = '/'
  
  if (mode === 'production') {
     // In production, existing config set this to false (JSON.stringify(false))
     // so the client falls back to window.location
     oblectoHost = false 
     basePath = '/web/'
  }

  return {
    base: basePath,
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@fortawesome/vue-fontawesome': path.resolve(__dirname, 'node_modules/@fortawesome/vue-fontawesome/index.js'),
        'vue-tabs-component': path.resolve(__dirname, 'node_modules/vue-tabs-component/dist/index.js'),
      },
      extensions: ['.js', '.vue', '.json'],
    },
    define: {
      'OBLECTO_HOST': JSON.stringify(oblectoHost),
      'BASE_PATH': JSON.stringify(basePath),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist/web',
      // Vite puts assets in 'assets' by default. 
      // Old config put them in 'static'. 
      // We can use assetsDir but Vite hashes filenames differently.
      // Ideally we stick to Vite defaults where possible, but 'assets' is fine.
      assetsDir: 'static', 
      emptyOutDir: true,
    },
    css: {
      preprocessorOptions: {
        sass: {
          api: 'modern-compiler',
        },
      },
    },
    server: {
      port: 8000,
    }
  }
})
