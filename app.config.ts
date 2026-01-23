// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
// e.g., "my-app" created at 2024-01-15 10:30:45 -> "space.manus.my.app.t20240115103045"
const bundleId = "space.manus.protocol.guide.t20260110193545";
// Extract timestamp from bundle ID and prefix with "manus" for deep link scheme
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "Protocol Guide",
  appSlug: "protocol-guide",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663070935654/tyHhHsYndGPqjhQD.jpeg",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "light",  // Light theme only for field use
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
  },
  android: {
    // Android config kept for potential future native builds
    adaptiveIcon: {
      backgroundColor: "#C41E3A",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    package: env.androidPackage,
  },
  web: {
    bundler: "metro",
    output: "single",  // Changed from "static" to fix JSX runtime error
    favicon: "./public/favicon.ico",
    // PWA Configuration
    template: "./web/index.html",
    manifest: {
      name: "Protocol Guide",
      short_name: "ProtocolGuide",
      description: "EMS Protocol Retrieval - AI-powered protocol search for EMS professionals",
      start_url: "/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#C41E3A",
      background_color: "#ffffff",
      scope: "/",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      categories: ["medical", "health", "productivity"],
    },
  },
  plugins: [
    "expo-router",
    // Native-only plugins removed for web-only PWA:
    // - expo-apple-authentication (uses Supabase OAuth instead)
    // - expo-audio (uses Web Audio API wrapper instead)
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: false,  // Disabled - causes JSX runtime issues with NativeWind
  },
};

export default config;
