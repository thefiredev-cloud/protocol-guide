#!/usr/bin/env node
/**
 * Inject PWA meta tags into the built index.html
 * This script runs after `expo export --platform web` to add PWA metadata
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist', 'index.html');

console.log('[PWA] Injecting PWA meta tags into index.html...');

if (!existsSync(distPath)) {
  console.error('[PWA] ❌ dist/index.html not found. Run build:web first.');
  process.exit(1);
}

try {
  let html = readFileSync(distPath, 'utf-8');

  // PWA meta tags to inject
  const pwaMeta = `
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" crossorigin="use-credentials" />

    <!-- Favicons -->
    <link rel="icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="72x72" href="/icon-72.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png" />
    <link rel="icon" type="image/png" sizes="128x128" href="/icon-128.png" />
    <link rel="icon" type="image/png" sizes="144x144" href="/icon-144.png" />
    <link rel="icon" type="image/png" sizes="152x152" href="/icon-152.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <link rel="icon" type="image/png" sizes="384x384" href="/icon-384.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="/icon-192.png" />

    <!-- iOS Safari PWA Support -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ProtocolGuide" />
    <meta name="description" content="EMS Protocol Retrieval - AI-powered protocol search for paramedics and EMTs. Access critical medical protocols instantly, even offline." />
    <meta name="theme-color" content="#C41E3A" />
    <meta name="color-scheme" content="light dark" />

    <!-- iOS Splash Screens - iPhone -->
    <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/icon-512.png" />
    
    <!-- iOS Splash Screens - iPad -->
    <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/icon-512.png" />

    <!-- Android/Chrome PWA -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="ProtocolGuide" />

    <!-- Microsoft Tiles -->
    <meta name="msapplication-TileColor" content="#C41E3A" />
    <meta name="msapplication-TileImage" content="/icon-144.png" />
    <meta name="msapplication-config" content="none" />

    <!-- Open Graph / Social -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Protocol Guide - EMS Protocol Search" />
    <meta property="og:description" content="AI-powered protocol search for paramedics and EMTs. Access critical medical protocols instantly, even offline." />
    <meta property="og:image" content="/icon-512.png" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Protocol Guide" />
    <meta name="twitter:description" content="AI-powered EMS protocol search" />
    <meta name="twitter:image" content="/icon-512.png" />
`;

  // Check if PWA meta already exists to avoid duplicates
  if (html.includes('rel="manifest"')) {
    console.log('[PWA] ⚠️ PWA meta tags already present, skipping injection');
    process.exit(0);
  }

  // Inject before the closing </head> tag
  html = html.replace('</head>', `${pwaMeta}\n  </head>`);

  // Update noscript message
  html = html.replace(
    /You need to enable JavaScript to run this app\./g,
    'Protocol Guide requires JavaScript to run. Please enable JavaScript in your browser settings.'
  );

  // Add service worker registration if not present
  if (!html.includes('serviceWorker')) {
    const swScript = `
    <script>
      // Register service worker for offline support
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('[PWA] ServiceWorker registered:', registration.scope);
          }).catch(function(error) {
            console.log('[PWA] ServiceWorker registration failed:', error);
          });
        });
      }
    </script>
`;
    html = html.replace('</body>', `${swScript}\n</body>`);
  }

  writeFileSync(distPath, html, 'utf-8');
  console.log('[PWA] ✅ PWA meta tags injected successfully');
} catch (error) {
  console.error('[PWA] ❌ Failed to inject PWA meta tags:', error);
  process.exit(1);
}
