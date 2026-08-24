import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to serve intro.html when visiting root '/'
function introEntryPlugin() {
  return {
    name: 'intro-entry-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '') {
          req.url = '/intro.html'
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '') {
          req.url = '/intro.html'
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    introEntryPlugin(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        intro: resolve(import.meta.dirname, 'intro.html'),
        gallery: resolve(import.meta.dirname, 'gallery.html'),
      },
    },
  },
})

