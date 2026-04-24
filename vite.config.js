import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
            // Cachear imágenes del backend
            urlPattern: /^https:\/\/visual-detail-backend\.onrender\.com\/img\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
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
      // No mostrar prompts automáticamente (usar manualmente si se quiere)
      devOptions: {
        enabled: true,
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
          'vendor-ui': ['react-bootstrap'],
          'vendor-utils': ['axios', 'zustand', 'swr'],
        },
      },
    },
  },
})