# Frontend Architecture

> **Last Updated:** 2026-01-28  
> **Framework:** Expo Router v6 + React Native 0.81 + NativeWind v4

## Overview

Protocol Guide is a **cross-platform EMS protocol search application** built with Expo (React Native for Web/iOS/Android). The frontend uses **Expo Router** for file-based navigation and **NativeWind** (Tailwind CSS for React Native) for styling.

**Key characteristics:**
- 📱 Mobile-first design optimized for field use
- 🌓 Dark/light theme support (defaults to dark)
- 📴 Offline-capable via service worker + AsyncStorage caching
- 🎙️ Voice search integration
- 🔐 OAuth authentication (Google/Apple via Supabase)

---

## Folder Structure

```
Protocol-Guide/
├── app/                      # Expo Router pages (file-based routing)
│   ├── _layout.tsx           # Root layout (providers, global setup)
│   ├── index.tsx             # Landing page (unauthenticated)
│   ├── (tabs)/               # Tab-based navigation (main app)
│   │   ├── _layout.tsx       # Tab bar configuration
│   │   ├── index.tsx         # Search screen (home)
│   │   ├── calculator.tsx    # Dosing calculator
│   │   ├── profile.tsx       # User profile/settings
│   │   ├── coverage.tsx      # (hidden) Coverage map
│   │   ├── history.tsx       # (hidden) Search history
│   │   └── search.tsx        # (hidden) Alternative search
│   ├── admin/                # Agency admin dashboard
│   │   ├── _layout.tsx       # Sidebar navigation layout
│   │   ├── index.tsx         # Admin dashboard
│   │   ├── analytics/        # Analytics views
│   │   ├── protocols/        # Protocol management
│   │   ├── settings/         # Billing, agency settings
│   │   ├── team/             # Team management
│   │   └── users/            # User management
│   ├── tools/                # Standalone EMS tools
│   │   ├── _layout.tsx       # Stack navigation
│   │   ├── arrest-timer.tsx  # Cardiac arrest timer
│   │   ├── dosing-calculator.tsx
│   │   └── rosc-checklist.tsx
│   ├── oauth/callback.tsx    # OAuth redirect handler
│   ├── contact.tsx           # Contact page
│   ├── disclaimer.tsx        # Medical disclaimer
│   ├── feedback.tsx          # User feedback form
│   ├── login.tsx             # Login page
│   ├── privacy.tsx           # Privacy policy
│   └── terms.tsx             # Terms of service
│
├── components/               # Reusable UI components
│   ├── ui/                   # Primitive UI components
│   │   ├── collapsible.tsx
│   │   ├── icon-symbol.tsx   # SF Symbols wrapper
│   │   ├── Modal.tsx
│   │   └── Skeleton.tsx      # Loading skeletons
│   ├── search/               # Search-specific components
│   │   ├── AgencyModal.tsx
│   │   ├── EmptySearchState.tsx
│   │   ├── FilterRow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── SearchHeader.tsx
│   │   ├── SearchLoadingSkeleton.tsx
│   │   ├── StateModal.tsx
│   │   ├── SummaryCard.tsx
│   │   └── VoiceErrorBanner.tsx
│   ├── landing/              # Landing page sections
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── simulation-section.tsx
│   │   ├── email-capture-section.tsx
│   │   └── footer-section.tsx
│   ├── seo/                  # SEO components (meta, structured data)
│   │   ├── FAQSection.tsx
│   │   ├── SEOHead.tsx
│   │   └── StructuredData.tsx
│   ├── arrest-timer/         # Cardiac arrest timer
│   ├── pediatric-dosing-calculator/
│   ├── rosc-checklist/       # Post-ROSC bundle
│   ├── referral/             # Referral system UI
│   ├── voice/                # Voice search UI
│   ├── icons/                # Custom SVG icons
│   ├── ErrorBoundary.tsx     # Error boundaries
│   ├── screen-container.tsx  # SafeArea wrapper
│   ├── chat-input.tsx        # Search input
│   └── ...                   # 30+ more components
│
├── hooks/                    # Custom React hooks
│   ├── use-auth.ts           # Supabase auth state
│   ├── use-colors.ts         # Theme colors
│   ├── use-protocol-search.ts # Search logic
│   ├── use-voice-search.ts   # Voice input
│   ├── use-filter-state.ts   # Search filters
│   ├── use-disclaimer.ts     # Disclaimer consent
│   ├── use-favorites.ts      # Saved protocols
│   ├── use-offline-cache.ts  # Offline storage
│   └── ...                   # 10+ more hooks
│
├── lib/                      # Core utilities
│   ├── _core/
│   │   ├── theme.ts          # Theme system core
│   │   └── nativewind-pressable.ts
│   ├── analytics/            # Event tracking
│   ├── accessibility/        # A11y utilities
│   ├── trpc.ts               # tRPC client setup
│   ├── supabase.ts           # Supabase client
│   ├── auth-context.tsx      # Auth provider
│   ├── app-context.tsx       # App state provider
│   ├── theme-provider.tsx    # Theme provider
│   ├── query-client.ts       # React Query config
│   ├── offline-cache.ts      # Offline storage
│   ├── haptics.ts            # Haptic feedback
│   └── ...                   # 20+ more utilities
│
├── constants/                # App constants
│   ├── theme.ts              # Theme re-exports
│   ├── oauth.ts              # OAuth configuration
│   └── const.ts              # General constants
│
├── types/                    # TypeScript types
│   └── search.types.ts       # Search-related types
│
├── utils/                    # Helper utilities
│   ├── protocol-helpers.ts
│   └── search-formatters.ts
│
├── assets/                   # Static assets
│   └── images/
│
├── public/                   # Web static files
│
└── global.css                # Global CSS (Tailwind base)
```

---

## Routing Architecture

### Expo Router (File-Based)

Protocol Guide uses **Expo Router v6** with file-based routing. Route structure maps directly to the `app/` directory.

**Route Groups:**
- `(tabs)` - Tab-based navigation (parentheses hide from URL)
- `admin` - Nested stack navigation with sidebar
- `tools` - Stack navigation for standalone tools

**Navigation Patterns:**
```tsx
// Programmatic navigation
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/(tabs)");           // Navigate to tabs
router.push("/admin/analytics");  // Navigate to admin
router.replace("/login");         // Replace current screen
router.back();                    // Go back
```

### Route Configuration

**Root Layout (`app/_layout.tsx`):**
```tsx
export const unstable_settings = {
  initialRouteName: "index",  // Landing page for unauthenticated users
};

<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="tools" />
  <Stack.Screen name="oauth/callback" />
</Stack>
```

**Tabs Layout (`app/(tabs)/_layout.tsx`):**
```tsx
<Tabs screenOptions={{ headerShown: false }}>
  <Tabs.Screen name="index" options={{ title: "Search" }} />
  <Tabs.Screen name="calculator" options={{ title: "Dosing" }} />
  <Tabs.Screen name="profile" options={{ title: "Profile" }} />
  {/* Hidden tabs */}
  <Tabs.Screen name="coverage" options={{ href: null }} />
  <Tabs.Screen name="history" options={{ href: null }} />
</Tabs>
```

---

## Key Pages

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page with marketing content | No |
| `/(tabs)` | Main search interface | No (anonymous browsing) |
| `/(tabs)/calculator` | Medication dosing calculator | No |
| `/(tabs)/profile` | User profile, settings, subscription | Yes for full features |
| `/admin` | Agency admin dashboard | Yes (agency admin role) |
| `/tools/arrest-timer` | Cardiac arrest timer (Protocol 1210) | No |
| `/tools/dosing-calculator` | Pediatric dosing calculator | No |
| `/tools/rosc-checklist` | Post-ROSC bundle checklist | No |
| `/disclaimer` | Medical disclaimer | No |
| `/privacy` | Privacy policy | No |
| `/terms` | Terms of service | No |

---

## State Management

### Provider Hierarchy

```tsx
<ThemeProvider>
  <SafeAreaProvider>
    <GestureHandlerRootView>
      <trpc.Provider>
        <QueryClientProvider>
          <AuthProvider>
            <AppProvider>
              {/* App content */}
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  </SafeAreaProvider>
</ThemeProvider>
```

### State Approaches

| State Type | Solution | Location |
|------------|----------|----------|
| Server state | **React Query + tRPC** | `lib/trpc.ts`, `lib/query-client.ts` |
| Auth state | **Context + Supabase** | `lib/auth-context.tsx` |
| App state | **Context** | `lib/app-context.tsx` |
| Theme | **Context + localStorage** | `lib/theme-provider.tsx` |
| Form state | **Local useState** | Per-component |
| Search filters | **Custom hook** | `hooks/use-filter-state.ts` |
| Offline cache | **AsyncStorage** | `lib/offline-cache.ts` |
| Favorites | **AsyncStorage** | `hooks/use-favorites.ts` |

### tRPC Integration

Type-safe API calls via tRPC v11:

```tsx
// Query
const { data, isLoading } = trpc.user.usage.useQuery();

// Mutation
const mutation = trpc.subscription.createPortal.useMutation();
await mutation.mutateAsync({ returnUrl: window.location.href });

// With React Query options
const { data } = trpc.agencyAdmin.myAgencies.useQuery(undefined, {
  enabled: isAuthenticated,
  staleTime: 5 * 60 * 1000,
});
```

### Context Patterns

**Auth Context:**
```tsx
const { user, isAuthenticated, loading, logout } = useAuthContext();
```

**App Context:**
```tsx
const { selectedCounty, setSelectedCounty, messages, addMessage } = useAppContext();
```

**Theme Context:**
```tsx
const { colorScheme, toggleTheme, setThemePreference } = useThemeContext();
```

---

## Styling Architecture

### NativeWind (Tailwind for React Native)

Protocol Guide uses **NativeWind v4** - a universal styling solution that compiles Tailwind CSS to React Native StyleSheet.

**Configuration:**
```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}", ...],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--color-primary)", light: "...", dark: "..." },
        // ... semantic colors from theme.config.js
      },
    },
  },
};
```

**Usage:**
```tsx
// NativeWind classes
<View className="flex-1 bg-background p-4">
  <Text className="text-xl font-bold text-foreground">Title</Text>
</View>

// Combined with style prop
<View className="flex-1" style={{ gap: 12 }}>
```

### Theme System

**Color Tokens (semantic):**
- `primary` - Brand red (#A31621)
- `background` - Page background
- `surface` - Card backgrounds
- `foreground` - Primary text
- `muted` - Secondary text
- `border` - Borders
- `success`, `warning`, `error` - Status colors

**Theme Switching:**
```tsx
// CSS variables set on :root
:root[data-theme="dark"] {
  --color-background: #0F172A;
  --color-foreground: #F8FAFC;
}

:root:not([data-theme="dark"]) {
  --color-background: #FFFFFF;
  --color-foreground: #0F172A;
}
```

### StyleSheet Usage

For complex or performance-critical styles:
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 240,
    borderRightWidth: 1,
  },
});
```

### Design Tokens

```ts
// lib/design-tokens.ts
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radii = { sm: 4, md: 8, lg: 12, xl: 16 };
export const touchTargets = { min: 44, comfortable: 48, large: 56 };
```

---

## Component Patterns

### Client vs Server Components

**All components are client-side.** Expo/React Native doesn't have server components. However, the app is optimized for:
- **Lazy loading** below-the-fold sections
- **Suspense boundaries** for code splitting
- **Server-side data fetching** via tRPC

```tsx
// Lazy load below-fold sections
const SimulationSection = lazy(() => import("@/components/landing/simulation-section"));

<Suspense fallback={<SectionPlaceholder />}>
  <SimulationSection />
</Suspense>
```

### Screen Container

All screens wrap content in `ScreenContainer` for consistent SafeArea handling:

```tsx
<ScreenContainer edges={["top", "left", "right"]} className="px-4">
  {/* Screen content */}
</ScreenContainer>
```

### Error Boundaries

Multiple error boundaries for granular error handling:

```tsx
<ErrorBoundary section="general" errorTitle="Profile Error">
  <ProfileContent />
</ErrorBoundary>

<SearchResultsErrorBoundary>
  <FlatList data={messages} />
</SearchResultsErrorBoundary>
```

### Loading States

**Skeleton components** for loading states:
```tsx
if (isLoading) {
  return (
    <ScrollView>
      <SkeletonProfileHeader />
      <SkeletonSubscriptionCard />
      <SkeletonRecentQueries count={3} />
    </ScrollView>
  );
}
```

### Modal Pattern

Consistent modal implementation:
```tsx
<Modal
  visible={showLogoutModal}
  onDismiss={() => setShowLogoutModal(false)}
  title="Sign Out"
  message="Are you sure?"
  variant="confirm"
  buttons={[
    { label: "Cancel", onPress: handleCancel, variant: "secondary" },
    { label: "Sign Out", onPress: confirmLogout, variant: "destructive" },
  ]}
/>
```

---

## Key Features Implementation

### Voice Search

```tsx
const { voiceError, handleVoiceError, clearVoiceError } = useVoiceSearch();

<VoiceSearchButton
  onTranscription={(text) => handleSendMessage(text)}
  onError={handleVoiceError}
  disabled={isLoading}
  size="medium"
/>
```

### Offline Support

- **Service Worker** registration for PWA
- **AsyncStorage** for protocol caching
- **OfflineBanner** component for connectivity status

```tsx
const { cacheSize, clearCache, itemCount } = useOfflineCache();
```

### Authentication Flow

1. User clicks "Sign in with Google/Apple"
2. Supabase OAuth redirects to provider
3. Provider redirects to `/oauth/callback`
4. App extracts tokens, stores session
5. `AuthProvider` updates global auth state

```tsx
// OAuth initiation
await signInWithGoogle();
await signInWithApple();

// Auth state access
const { user, isAuthenticated, logout } = useAuthContext();
```

### Haptic Feedback

```tsx
import * as Haptics from "@/lib/haptics";

// On button press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// On success/error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

---

## SEO/AEO (Web)

Dynamic meta tags and structured data for web:

```tsx
<SEOHead
  title="EMS Protocol Search"
  description="AI-powered EMS protocol search..."
  path="/"
  keywords={["LA County EMS protocols", ...]}
/>

<OrganizationSchema />
<WebSiteSchema />
<MedicalWebPageSchema
  name={seoTitle}
  medicalAudience={["Paramedics", "EMTs"]}
  specialty="Emergency Medicine"
/>
```

---

## Performance Optimizations

1. **Lazy loading** - Below-fold components loaded on demand
2. **Memoization** - useMemo/useCallback for expensive computations
3. **React Query caching** - Aggressive cache times for EMS field use
4. **Image optimization** - WebP format, lazy loading
5. **Bundle splitting** - Expo's automatic code splitting
6. **Skeleton UI** - Instant perceived loading

---

## Development Commands

```bash
# Start development (server + metro bundler)
pnpm dev

# Metro only (web)
pnpm dev:metro

# Build for web
pnpm build:web

# Type checking
pnpm check

# Linting
pnpm lint

# Testing
pnpm test
pnpm test:e2e
```

---

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Backend API reference
- [Database Architecture](./DATABASE-ARCHITECTURE-ANALYSIS.md) - Schema details
- [Deployment](../DEPLOYMENT.md) - Deployment procedures
- [Security](./SECURITY.md) - Security considerations
