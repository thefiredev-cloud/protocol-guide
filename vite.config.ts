import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          workbox: {
            // Cache all static assets (exclude large logo)
            globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
            // Allow larger files (logo is 5MB)
            maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB
            // Runtime caching for API calls
            runtimeCaching: [
              {
                // Cache protocol data requests
                urlPattern: /^https:\/\/.*supabase.*\/rest\/v1\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'supabase-api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24, // 24 hours
                  },
                  networkTimeoutSeconds: 5,
                },
              },
              {
                // Cache fonts
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                },
              },
            ],
          },
          manifest: {
            name: 'ProtocolGuide - LA County EMS',
            short_name: 'ProtocolGuide',
            description: 'LA County Fire Department EMS Protocol Reference',
            theme_color: '#9B1B30',
            background_color: '#0f172a',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
          },
        }),
      ],
      // API key removed from client bundle for security
      // Access via import.meta.env.VITE_GEMINI_API_KEY or server-side function
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
