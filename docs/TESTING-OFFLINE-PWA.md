# Offline PWA Testing Guide

## Quick Start (2-Minute Test)

### Test 1: Offline Indicator
1. Open the app in Chrome/Firefox
2. Press F12 to open DevTools
3. Go to Network tab
4. Select "Offline" from the throttling dropdown
5. **Expected:** Yellow banner appears at top saying "⚠️ Offline Mode"
6. Select "Online" from dropdown
7. **Expected:** Banner disappears

✅ **Pass Criteria:** Banner shows/hides correctly

---

### Test 2: Offline Chat Fallback
1. With DevTools open, go offline (Network → Offline)
2. Type a message in the chat input
3. Click Send
4. **Expected:** Message appears: "⚠️ You are currently offline. The knowledge base is still available for protocol lookups. Reconnect to access AI assistance."

✅ **Pass Criteria:** Fallback message displays instead of error

---

### Test 3: Cached KB Access
1. While **online**, search for "chest pain" or any protocol
2. Wait for results to load
3. Go **offline** (DevTools → Network → Offline)
4. Search for the same protocol again
5. **Expected:** Results load instantly from cache

✅ **Pass Criteria:** Cached protocols load without network

---

## Visual Testing Guide

### Screenshot 1: Offline Banner
**What to capture:**
- Full browser window showing yellow offline banner at top
- Banner should show: "⚠️ Offline Mode"
- Banner positioned above header

**How to create:**
1. Open app
2. Go offline
3. Take full-page screenshot

**Expected appearance:**
```
┌────────────────────────────────────────┐
│ ⚠️ Offline Mode                        │  ← Yellow banner
├────────────────────────────────────────┤
│ 🚒 LA County Fire                      │  ← Normal header
│    Medic Bot • Prehospital Care Manual │
└────────────────────────────────────────┘
```

---

### Screenshot 2: Cache Storage
**What to capture:**
- DevTools → Application → Cache Storage
- Show `medic-bot-v2-chunked` cache
- Expand to show cached files

**How to create:**
1. Open DevTools (F12)
2. Click Application tab
3. Expand "Cache Storage" in left sidebar
4. Click on `medic-bot-v2-chunked`
5. Screenshot showing cached files list

**Expected files:**
- `/`
- `/icon.svg`
- `/manifest.json`
- `/kb/manifest.json`
- Various `/kb/chunks/*.json` files (after browsing protocols)

---

### Screenshot 3: Offline Fallback Message
**What to capture:**
- Chat interface showing offline fallback message
- Network tab showing "Offline" mode

**How to create:**
1. Go offline
2. Send a chat message
3. Wait for fallback message to appear
4. Screenshot showing both DevTools and chat

**Expected message:**
```
Assistant: ⚠️ You are currently offline. The knowledge base
is still available for protocol lookups. Reconnect to access
AI assistance.
```

---

### Screenshot 4: Last Sync Timestamp
**What to capture:**
- Offline banner with "Last synced" timestamp
- This appears briefly when reconnecting

**How to create:**
1. Go offline (banner appears)
2. Go online (banner should show timestamp briefly before disappearing)
3. Quickly screenshot during transition

**Expected appearance:**
```
⚠️ Offline Mode        Last synced: 2:30:45 PM
```

---

## Detailed Testing

### Test Suite 1: Service Worker Installation

**Steps:**
1. Clear all site data (DevTools → Application → Clear storage)
2. Reload page
3. Check Application → Service Workers

**Expected:**
- Service worker shows as "activated and running"
- Script: `/sw.js`
- Status: Green dot (activated)

**Troubleshooting:**
- If not activated: Check Console for errors
- If old version: Click "Update" or "Unregister" and reload

---

### Test Suite 2: Cache Population

**Steps:**
1. Open DevTools → Application → Cache Storage
2. Note initial cache size
3. Browse to different protocol pages
4. Search for protocols
5. Check cache again

**Expected:**
- Cache grows as you browse
- `/kb/chunks/*.json` files appear
- Each visited protocol is cached

**Metrics:**
- Initial cache: ~100KB (core assets)
- After browsing: 2-5MB (depending on usage)

---

### Test Suite 3: Offline Navigation

**Steps:**
1. Visit multiple pages while online:
   - Homepage (/)
   - Dosing page (/dosing)
   - Protocols page (/protocols)
2. Go offline
3. Navigate between pages using nav bar
4. Check Network tab

**Expected:**
- Pages load from cache (200, disk cache)
- No network requests fail
- Navigation works smoothly

---

### Test Suite 4: Background Update

**Steps:**
1. Visit a protocol page (e.g., /protocols?id=chest-pain)
2. Check Network → fetch/XHR for KB chunk request
3. Reload the same page
4. Check Network again

**Expected:**
- First visit: Network request for KB chunk
- Cache stores the chunk
- Second visit: Loads from cache (instant)
- Background fetch updates cache silently

---

### Test Suite 5: Mobile Testing

**iOS Safari:**
1. Open app on iPhone
2. Enable airplane mode
3. Check if offline banner appears
4. Try navigating
5. Disable airplane mode
6. Verify banner disappears

**Android Chrome:**
1. Open app on Android
2. Enable airplane mode
3. Check offline banner
4. Test navigation and protocol search
5. Disable airplane mode
6. Verify sync

**Expected:**
- Works identically to desktop
- Touch-friendly banner (doesn't block content)
- Smooth transitions

---

### Test Suite 6: PWA Installation

**Desktop:**
1. Visit site in Chrome
2. Look for install icon in address bar
3. Click "Install Medic Bot"
4. App opens in standalone window

**Mobile:**
1. Visit site in Safari/Chrome
2. Look for "Add to Home Screen"
3. Add to home screen
4. Launch from home screen icon
5. Test offline mode

**Expected:**
- App installs successfully
- Opens in app mode (no browser UI)
- Offline mode works in PWA
- Icon appears correctly

---

### Test Suite 7: Network Recovery

**Steps:**
1. Go offline
2. Verify offline banner shows
3. Try to send a chat message
4. Go online
5. Monitor banner behavior

**Expected:**
- Banner disappears within 1 second
- "Last synced" timestamp appears briefly
- Chat functionality restored immediately
- No errors in console

---

### Test Suite 8: Cache Management

**Steps:**
1. Check initial cache size (DevTools → Application → Storage)
2. Browse multiple protocols (20+ pages)
3. Check cache size again
4. Update service worker version
5. Reload page
6. Check cache again

**Expected:**
- Cache grows with usage
- Old cache versions are deleted
- New version replaces old seamlessly
- No duplicate caches

---

## Performance Testing

### Metrics to Collect

**First Load (Online):**
- Time to First Byte (TTFB): ___ ms
- First Contentful Paint (FCP): ___ ms
- Time to Interactive (TTI): ___ ms

**Repeat Visit (Online):**
- TTFB: ___ ms (should be faster)
- FCP: ___ ms (should be faster)
- TTI: ___ ms (should be faster)

**Offline Load:**
- TTFB: N/A (from cache)
- FCP: ___ ms (should be fastest)
- TTI: ___ ms (should be fastest)

**How to measure:**
1. Open DevTools → Lighthouse
2. Run audit in different network conditions
3. Compare metrics

---

## Browser Compatibility Matrix

| Browser | Version | Service Worker | Offline Detect | Background Sync | Notes |
|---------|---------|----------------|----------------|-----------------|-------|
| Chrome | 90+ | ✅ | ✅ | ✅ | Full support |
| Firefox | 88+ | ✅ | ✅ | ⚠️ | Sync in dev |
| Safari | 15+ | ✅ | ✅ | ❌ | No sync |
| Edge | 90+ | ✅ | ✅ | ✅ | Full support |
| iOS Safari | 15+ | ✅ | ✅ | ❌ | No sync |
| Android Chrome | 90+ | ✅ | ✅ | ✅ | Full support |

**Test on:**
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Desktop (Mac)
- [ ] Edge Desktop
- [ ] iOS Safari (iPhone)
- [ ] Android Chrome

---

## Common Issues & Troubleshooting

### Issue: Offline banner doesn't appear

**Possible causes:**
1. JavaScript disabled
2. Browser doesn't support navigator.onLine
3. Component not imported in layout

**Solutions:**
1. Check browser console for errors
2. Verify `<OfflineIndicator />` in layout.tsx
3. Test in different browser

---

### Issue: Service worker not installing

**Possible causes:**
1. Not running on HTTPS (or localhost)
2. Syntax error in sw.js
3. CSP blocking worker

**Solutions:**
1. Check DevTools → Console for errors
2. Verify sw.js syntax
3. Check CSP headers allow workers
4. Try unregistering old worker

---

### Issue: Cache not updating

**Possible causes:**
1. Service worker not activating new version
2. Browser holding onto old cache
3. skipWaiting() not working

**Solutions:**
1. Click "Update" in DevTools → Application → Service Workers
2. Clear all site data and reload
3. Check browser console for errors
4. Verify cache version changed in sw.js

---

### Issue: Offline mode shows error instead of fallback

**Possible causes:**
1. Fetch event not intercepting request
2. Service worker scope issue
3. Cache strategy not covering route

**Solutions:**
1. Check Network tab to see if SW is handling requests
2. Verify SW scope is "/" (root)
3. Check sw.js fetch event logic

---

## Test Results Template

### Environment
- **Date:** __________
- **Tester:** __________
- **Browser:** __________
- **OS:** __________
- **Device:** __________

### Results

| Test Suite | Pass/Fail | Notes |
|------------|-----------|-------|
| 1. Service Worker Installation | ⬜ | |
| 2. Cache Population | ⬜ | |
| 3. Offline Navigation | ⬜ | |
| 4. Background Update | ⬜ | |
| 5. Mobile Testing | ⬜ | |
| 6. PWA Installation | ⬜ | |
| 7. Network Recovery | ⬜ | |
| 8. Cache Management | ⬜ | |

### Screenshots
- [ ] Offline banner
- [ ] Cache storage
- [ ] Offline fallback message
- [ ] Last sync timestamp
- [ ] PWA installed

### Issues Found
1.
2.
3.

### Performance Metrics
- First Load FCP: ___ ms
- Repeat Visit FCP: ___ ms
- Offline Load FCP: ___ ms
- Cache Size: ___ MB

---

## Sign-off

- [ ] All tests passed
- [ ] Screenshots collected
- [ ] Performance metrics acceptable
- [ ] No critical issues
- [ ] Ready for deployment

**Tester Signature:** ____________________
**Date:** ____________________
