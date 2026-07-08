import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Repository name on GitHub. When deployed to GitHub Pages the app lives under
// /<repo>/ — change this if you rename the repo, or set it to '/' for a custom domain.
const REPO_BASE = '/repaso-app/';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? REPO_BASE : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Park4Learn — Bitácora de verano',
        short_name: 'Park4Learn',
        description: 'App de repaso para 5º Primaria y 1º ESO.',
        theme_color: '#2E5C7E',
        background_color: '#F5F2EC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache JSON content so the app funciona offline.
        runtimeCaching: [
          {
            urlPattern: /\/content\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'content-cache' },
          },
        ],
      },
    }),
  ],
});
