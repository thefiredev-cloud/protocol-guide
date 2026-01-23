# PWA Setup Checklist for Protocol Guide

This document tracks the PWA implementation for Protocol Guide's web deployment.

## Completed Tasks

### 1. Service Worker Configuration ✅
**File**: `/public/sw.js`
- [x] Network-first caching strategy implemented
- [x] Offline fallback page support
- [x] Static assets caching (icons, manifest)
- [x] API requests excluded from caching
- [x] Cache versioning with automatic cleanup
- [x] Service worker message handling for updates
- [x] Console logging for debugging

**Features**:
- Cache name: `protocol-guide-v2`
- Strategy: Network-first with cache fallback
- Offline page served for navigation when offline
- Auto-cleanup of old cache versions

### 2. Web Manifest ✅
**File**: `/public/manifest.json`
- [x] App name: "Protocol Guide"
- [x] Short name: "ProtocolGuide"
- [x] Description: "EMS Protocol Retrieval - AI-powered protocol search"
- [x] Icons: 192x192 and 512x512 PNG
- [x] Display mode: "standalone"
- [x] Theme color: #C41E3A (brand red)
- [x] Background color: #ffffff
- [x] Start URL: "/"
- [x] Orientation: "portrait"
- [x] Categories: medical, health, productivity

### 3. "Add to Home Screen" Support ✅
**Files**: `/web/index.html`, `/components/InstallPrompt.tsx`

#### iOS Safari Meta Tags
- [x] `apple-mobile-web-app-capable` = "yes"
- [x] `apple-mobile-web-app-status-bar-style` = "black-translucent"
- [x] `apple-mobile-web-app-title` = "ProtocolGuide"
- [x] Apple touch icons configured
- [x] iOS splash screens for all device sizes

#### Chrome/Edge Install Prompt
- [x] `beforeinstallprompt` event handler
- [x] Custom install UI component (`InstallPrompt.tsx`)
- [x] User dismissal tracking (7-day cooldown)
- [x] Automatic update notifications
- [x] iOS manual install instructions

#### Splash Screen Configuration
- [x] Multiple device sizes supported:
  - iPhone X/XS/11 Pro/12 mini/13 mini
  - iPhone XR/11/12/13/14
  - iPhone XS Max/11 Pro Max/12 Pro Max/13 Pro Max/14 Plus
  - iPhone 14 Pro/14 Pro Max
  - iPad (various sizes)
  - iPad Pro 11" and 12.9"

### 4. Offline Fallback ✅
**File**: `/public/offline.html`
- [x] Beautiful gradient design
- [x] Offline status indicator
- [x] Retry connection button
- [x] Auto-reload when connection restored
- [x] Online/offline event listeners
- [x] Periodic connection checking (5s interval)

### 5. Netlify Deployment Configuration ✅
**File**: `/netlify.toml`

#### Build Settings
- [x] Node 20 environment
- [x] Production mode
- [x] CI mode for non-interactive builds
- [x] Public folder copied to dist after Expo export

#### Headers
- [x] Service worker cache control (max-age=0)
- [x] Static assets aggressive caching (1 year, immutable)
- [x] Manifest.json with correct MIME type
- [x] PWA icons caching
- [x] Offline page headers
- [x] Security headers (HSTS, CSP, etc.)

#### Redirects
- [x] SPA routing support (/* → /index.html)

### 6. Service Worker Registration ✅
**File**: `/lib/register-sw.ts`
- [x] Registration on page load
- [x] Update detection and notification
- [x] Controller change handling
- [x] Online/offline status tracking
- [x] Hourly update checks
- [x] User notification for updates (with auto-reload)

### 7. PWA Assets ✅
**Directory**: `/public/`
- [x] `icon-192.png` - 192x192 app icon
- [x] `icon-512.png` - 512x512 app icon
- [x] `favicon.ico` - Browser favicon
- [x] `manifest.json` - Web app manifest
- [x] `sw.js` - Service worker
- [x] `offline.html` - Offline fallback page

### 8. HTML Template ✅
**File**: `/web/index.html`
- [x] Custom HTML template for Expo web
- [x] All PWA meta tags included
- [x] iOS Safari support tags
- [x] Android/Chrome PWA tags
- [x] Microsoft Tiles configuration
- [x] No-JavaScript fallback message

### 9. App Integration ✅
**File**: `/app/_layout.tsx`
- [x] Service worker registration on web platform
- [x] Install prompt component added to app
- [x] Platform detection (web only)

## Testing Instructions

### Local Testing

1. **Build the app**:
   ```bash
   cd "/Users/tanner-osterkamp/Protocol Guide Manus"
   pnpm build
   npx expo export --platform web
   cp -r public/* dist/
   ```

2. **Serve locally** (requires HTTPS for service workers):
   ```bash
   npx serve dist -l 3000 --ssl-cert <cert.pem> --ssl-key <key.pem>
   ```
   Or use Netlify CLI:
   ```bash
   netlify dev
   ```

3. **Test service worker**:
   - Open DevTools → Application → Service Workers
   - Verify service worker is registered and active
   - Check "Update on reload" for development

4. **Test offline mode**:
   - Open DevTools → Network
   - Set throttling to "Offline"
   - Refresh page - should show offline fallback or cached version
   - Navigate - should show offline.html

5. **Test install prompt**:
   - **Chrome/Edge**: Wait 3 seconds, should see install banner
   - **iOS Safari**: Wait 3 seconds, should see manual install instructions
   - Click install/dismiss and verify behavior

### Production Testing (Netlify)

1. **Deploy to Netlify**:
   ```bash
   git add .
   git commit -m "feat: Add PWA support"
   git push
   ```

2. **Verify PWA on deployed site**:
   - Visit deployed URL
   - Open DevTools → Lighthouse
   - Run PWA audit (should score 100%)

3. **Test installation**:
   - **Chrome**: Click install button in address bar
   - **iOS Safari**: Share → Add to Home Screen
   - **Android Chrome**: Banner should appear or use menu → Install app

4. **Verify standalone mode**:
   - Launch installed app from home screen
   - Should open in standalone mode (no browser UI)
   - Should use theme color (#C41E3A)

## Verification Checklist

- [ ] Service worker registers successfully
- [ ] Manifest linked in HTML
- [ ] Icons present and accessible
- [ ] Standalone display mode works
- [ ] Offline fallback works
- [ ] Install prompt appears (Chrome/Edge)
- [ ] iOS manual install instructions appear
- [ ] Theme color applied correctly
- [ ] App opens in standalone mode
- [ ] Lighthouse PWA score 100%
- [ ] Update mechanism works
- [ ] Offline caching works
- [ ] SPA routing works in standalone mode

## Browser Compatibility

| Browser | PWA Support | Install Prompt | Offline | Notes |
|---------|-------------|----------------|---------|-------|
| Chrome (Desktop) | ✅ | ✅ | ✅ | Full support |
| Chrome (Android) | ✅ | ✅ | ✅ | Native install banner |
| Edge | ✅ | ✅ | ✅ | Full support |
| Safari (iOS) | ✅ | Manual | ✅ | Add to Home Screen manual |
| Safari (macOS) | ⚠️ | Manual | ✅ | Limited support |
| Firefox | ⚠️ | ❌ | ✅ | No install prompt |

## Troubleshooting

### Service Worker Not Registering
- Check HTTPS (required except localhost)
- Verify `/sw.js` is accessible
- Check browser console for errors
- Clear cache and hard reload

### Install Prompt Not Showing
- Wait 30 seconds after page load
- Check if already installed (standalone mode)
- Verify manifest.json is valid
- Check browser compatibility

### Offline Mode Not Working
- Verify service worker is active
- Check Network tab for cached resources
- Ensure offline.html is in cache
- Try hard refresh (Ctrl+Shift+R)

### Icons Not Showing
- Verify icon files exist in `/public/`
- Check manifest.json icon paths
- Clear cache and reinstall
- Verify icon file formats (PNG)

## Performance Optimization

- Static assets cached for 1 year
- Service worker not cached (immediate updates)
- HTML revalidates on every request
- Network-first strategy for up-to-date content
- Manifest and offline page not heavily cached

## Security Considerations

- HTTPS required for service workers
- CSP headers configured for React Native Web
- Service worker scope limited to `/`
- No sensitive data cached
- Cache versioning prevents stale data

## Next Steps

1. **Monitor PWA metrics** via Netlify Analytics
2. **Track install conversions** via analytics
3. **Optimize cache strategy** based on usage patterns
4. **Add push notifications** (future enhancement)
5. **Background sync** for offline actions (future)

## Files Modified/Created

### Created
- `/public/offline.html`
- `/web/index.html`
- `/components/InstallPrompt.tsx`
- `/public/favicon.ico` (copied from icon-192.png)
- `/PWA-CHECKLIST.md` (this file)

### Modified
- `/public/sw.js` - Enhanced with better caching
- `/lib/register-sw.ts` - Added update detection
- `/app/_layout.tsx` - Added InstallPrompt component
- `/netlify.toml` - Added PWA-specific headers

### Existing (Unchanged)
- `/public/manifest.json`
- `/public/icon-192.png`
- `/public/icon-512.png`

## Build Command

The final build command in `netlify.toml`:
```bash
pnpm install && pnpm build && npx expo export --platform web && cp -r public/* dist/
```

This ensures:
1. Dependencies installed
2. Server code built
3. Expo web app exported to `dist/`
4. PWA assets copied to `dist/`
