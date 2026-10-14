import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Production builds must name their backend: there is no default URL to fall
// back to, so a missing VITE_API_URL fails the build instead of shipping a
// site that calls the wrong API.
function requireApiUrl() {
  return {
    name: 'require-api-url',
    config(_, { command, mode }) {
      if (command !== 'build') return
      const { VITE_API_URL } = loadEnv(mode, process.cwd(), 'VITE_')
      if (!VITE_API_URL) {
        throw new Error(
          'VITE_API_URL is required to build: set it to the backend URL (e.g. https://<site>.netlify.app).'
        )
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    requireApiUrl(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Visual Detailing',
        short_name: 'VisualDetail',
        description: 'Tienda de productos de detallado automotriz',
        theme_color: '#171717',
        background_color: '#171717',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Archivos a cachear para offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Rutas a ignorear (API calls)
        runtimeCaching: [
          {
            // Cachear fonts/icons si es necesario
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      // No service worker in development: a dev SW kept serving a stale index.html.
      // Test the PWA with `pnpm build && pnpm preview`.
      devOptions: {
        enabled: false,
      },
    }),
  ],
  // Optimizaciones de build
  build: {
    rollupOptions: {
      output: {
        // Manual chunks para mejor code splitting
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-utils': ['axios', 'zustand', 'swr'],
        },
      },
    },
  },
})