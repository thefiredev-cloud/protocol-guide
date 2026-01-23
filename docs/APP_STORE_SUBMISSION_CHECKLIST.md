# Protocol Guide - App Store Submission Checklist

**Review Date**: 2026-01-22
**Status**: NOT READY FOR SUBMISSION
**Estimated Work**: 2-3 days to complete all requirements

---

## Executive Summary

Protocol Guide is currently configured as a **PWA-first application** deployed via Netlify. The Expo/React Native foundation supports native iOS builds, but critical configurations for App Store submission are **missing**.

### Critical Blockers (Must Fix)

| Item | Status | Priority |
|------|--------|----------|
| EAS Build Configuration (eas.json) | MISSING | P0 |
| Privacy Manifest (PrivacyInfo.xcprivacy) | MISSING | P0 |
| iOS Permissions Usage Descriptions | MISSING | P0 |
| App Store Connect Account Setup | UNKNOWN | P0 |
| Apple Developer Certificates | UNKNOWN | P0 |

---

## 1. Build Configuration

### 1.1 EAS Build Configuration (eas.json)
**Status**: MISSING - File does not exist

**Required**: Create `/eas.json` with the following:

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "resourceClass": "m-medium",
        "image": "latest"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### 1.2 App Configuration (app.config.ts)
**Status**: PARTIALLY CONFIGURED

**Current State**:
- Bundle ID: `space.manus.protocol.guide.t20260110193545` (Non-standard format with timestamp)
- Version: `1.0.0`
- iOS tablet support: Enabled
- New Architecture: Enabled

**Issues Found**:
- Bundle ID contains timestamp suffix - Consider standardizing to `com.protocolguide.app`
- No `infoPlist` configuration for usage descriptions
- No entitlements configured
- No associated domains for universal links

**Required Updates to `app.config.ts`**:

```typescript
ios: {
  supportsTablet: true,
  bundleIdentifier: "com.protocolguide.app", // Standardize bundle ID
  buildNumber: "1",
  infoPlist: {
    NSMicrophoneUsageDescription: "Protocol Guide uses the microphone for hands-free voice search to query EMS protocols while on scene.",
    NSSpeechRecognitionUsageDescription: "Protocol Guide uses speech recognition to convert your voice queries into text for protocol search.",
    NSCameraUsageDescription: "Protocol Guide may use the camera for future features like document scanning.",
    ITSAppUsesNonExemptEncryption: false,
    UIBackgroundModes: ["fetch", "remote-notification"],
    LSApplicationQueriesSchemes: ["mailto", "tel"],
  },
  entitlements: {
    "com.apple.developer.associated-domains": [
      "applinks:protocol-guide.com",
      "webcredentials:protocol-guide.com"
    ],
  },
  privacyManifests: {
    NSPrivacyAccessedAPITypes: [
      {
        NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
        NSPrivacyAccessedAPITypeReasons: ["CA92.1"]
      }
    ]
  }
},
```

---

## 2. App Icons & Assets

### 2.1 App Icon
**Status**: CONFIGURED

| Asset | Required Size | Current Size | Status |
|-------|---------------|--------------|--------|
| icon.png | 1024x1024 | 2048x2048 | OK (will scale down) |
| android-icon-foreground.png | 1024x1024 | OK | OK |
| android-icon-background.png | 1024x1024 | OK | OK |
| android-icon-monochrome.png | 1024x1024 | OK | OK |

**Note**: Icon is 2048x2048 which is fine - Expo will generate all required sizes.

### 2.2 Splash Screen
**Status**: CONFIGURED

| Asset | Required | Current | Status |
|-------|----------|---------|--------|
| splash-icon.png | 200+ width | 2048x2048 | OK |
| Background color | #ffffff | #ffffff | OK |
| Resize mode | contain | contain | OK |

### 2.3 PWA Icons
**Status**: INCORRECT DIMENSIONS

| Asset | Expected | Actual | Status |
|-------|----------|--------|--------|
| icon-192.png | 192x192 | 2048x2048 | FIX NEEDED |
| icon-512.png | 512x512 | 2048x2048 | FIX NEEDED |

**Action**: Resize PWA icons to correct dimensions or rely on manifest auto-generation.

---

## 3. Privacy & Compliance

### 3.1 Privacy Manifest (PrivacyInfo.xcprivacy)
**Status**: MISSING at project level

Apple requires privacy manifests for apps that access certain APIs. Create at project root or via config plugin.

**Required APIs to Declare**:
- UserDefaults (used by AsyncStorage)
- File timestamp (if accessing file modification dates)
- System boot time (if used)

### 3.2 App Privacy Details (App Store Connect)
**Status**: NOT CONFIGURED

Complete in App Store Connect:

| Data Type | Collected | Linked to User | Tracking |
|-----------|-----------|----------------|----------|
| Email Address | Yes | Yes | No |
| User ID | Yes | Yes | No |
| Search History | Yes | Yes | No |
| Usage Data | Yes | Yes | No |
| Diagnostics | Yes | No | No |

### 3.3 Medical App Disclaimer
**Status**: EXISTS in app description

Ensure the disclaimer is also displayed:
- During onboarding
- In the app settings/about section
- Before first protocol query

---

## 4. Required Capabilities & Permissions

### 4.1 iOS Permissions
**Status**: MISSING Usage Descriptions

| Permission | Currently Used | Usage Description | Status |
|------------|----------------|-------------------|--------|
| Microphone | Yes (voice input) | MISSING | REQUIRED |
| Speech Recognition | Yes (voice input) | MISSING | REQUIRED |
| Internet Access | Yes | Auto-granted | OK |
| Push Notifications | Planned | Not configured | OPTIONAL |

### 4.2 Background Modes
**Status**: NOT CONFIGURED

If implementing:
- Background fetch for protocol updates
- Remote notifications

Add to infoPlist: `UIBackgroundModes: ["fetch", "remote-notification"]`

### 4.3 Entitlements
**Status**: NOT CONFIGURED

Required entitlements:
- Associated Domains (for universal links)
- Push Notifications (if implementing)
- In-App Purchase (for subscriptions)

---

## 5. App Store Connect Setup

### 5.1 Account Requirements
**Status**: UNKNOWN - Verify these items

- [ ] Apple Developer Program membership ($99/year)
- [ ] App Store Connect access
- [ ] Certificates & Provisioning Profiles configured
- [ ] App ID registered in Developer Portal
- [ ] Bundle ID matches app.config.ts

### 5.2 App Store Listing
**Status**: DOCUMENTATION EXISTS (docs/APP_STORE_ASSETS.md)

| Item | Status | Location |
|------|--------|----------|
| App Name | Defined | APP_STORE_ASSETS.md |
| Subtitle | Defined | APP_STORE_ASSETS.md |
| Description | Defined | APP_STORE_ASSETS.md |
| Keywords | Defined | APP_STORE_ASSETS.md |
| Screenshots | NOT CREATED | Need 5+ for each device |
| App Preview Video | NOT CREATED | Optional but recommended |
| Privacy Policy URL | Defined | protocol-guide.com/privacy |
| Support URL | Defined | protocol-guide.com/support |

### 5.3 In-App Purchases
**Status**: NEEDS SETUP IN APP STORE CONNECT

| Product ID | Type | Price |
|------------|------|-------|
| com.protocolguide.pro.monthly | Auto-Renewable | $4.99 |
| com.protocolguide.pro.annual | Auto-Renewable | $39.00 |

**Note**: Currently using Stripe for web. Need to implement StoreKit for iOS native builds.

---

## 6. Technical Requirements

### 6.1 Minimum iOS Version
**Status**: NOT EXPLICITLY SET

Recommended: iOS 14.0+ (set in app.config.ts)

```typescript
ios: {
  deploymentTarget: "14.0",
}
```

### 6.2 Native Modules Check
**Status**: REVIEW NEEDED

Current Expo packages requiring native code:
- expo-router
- expo-video
- expo-splash-screen
- @react-native-async-storage/async-storage
- expo-clipboard
- expo-document-picker
- expo-file-system
- expo-crypto

All are Expo-managed and should work with EAS Build.

### 6.3 Missing Native Packages (Recommended)

For full iOS native experience:
```bash
npx expo install expo-haptics expo-notifications expo-apple-authentication
```

---

## 7. Pre-Submission Testing

### 7.1 TestFlight Checklist
- [ ] Create development build with EAS
- [ ] Test on physical iOS device
- [ ] Verify all permissions prompts appear correctly
- [ ] Test voice input functionality
- [ ] Test offline mode
- [ ] Test in-app purchases with sandbox account
- [ ] Verify deep links work
- [ ] Check accessibility (VoiceOver)
- [ ] Test on iPad (if supporting tablets)

### 7.2 App Review Preparation
- [ ] Prepare demo account credentials
- [ ] Document any special instructions for reviewers
- [ ] Ensure Medical Disclaimer is prominent
- [ ] Verify age rating questionnaire answers

---

## 8. Action Items (Priority Order)

### P0 - Critical (Must Complete)

1. **Create eas.json**
   - Configure build profiles
   - Set up submission credentials

2. **Update app.config.ts**
   - Add infoPlist usage descriptions
   - Configure entitlements
   - Add privacy manifests
   - Standardize bundle ID (optional)

3. **Set Up Apple Developer Account**
   - Create App ID
   - Generate certificates
   - Create provisioning profiles (or use EAS managed)

4. **Create Privacy Manifest**
   - Declare accessed APIs
   - Document data collection

### P1 - High Priority

5. **Implement Native Features**
   - Add expo-haptics for feedback
   - Implement StoreKit for in-app purchases
   - Configure push notifications

6. **Create App Store Screenshots**
   - iPhone 6.9" (15 Pro Max)
   - iPhone 6.7" (14 Pro Max)
   - iPhone 6.5" (11 Pro Max)
   - iPhone 5.5" (8 Plus)
   - iPad Pro 12.9"

7. **Test on Physical Devices**
   - Build development client
   - Full QA pass
   - TestFlight beta testing

### P2 - Before Submission

8. **Complete App Store Connect**
   - Upload screenshots
   - Enter all metadata
   - Configure in-app purchases
   - Complete App Privacy questionnaire

9. **Submit for Review**
   - Run EAS Submit
   - Monitor review status
   - Respond to any questions

---

## 9. Commands Reference

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Initialize EAS
```bash
eas build:configure
```

### Create Development Build
```bash
eas build --platform ios --profile development
```

### Create Production Build
```bash
eas build --platform ios --profile production
```

### Submit to App Store
```bash
eas submit --platform ios
```

### Run Prebuild (generates native projects)
```bash
npx expo prebuild --platform ios
```

---

## 10. Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple Privacy Manifest Requirements](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
- [Protocol Guide App Store Assets](./APP_STORE_ASSETS.md)

---

## Summary

Protocol Guide has a solid foundation with Expo SDK 54 and React Native 0.81, plus comprehensive marketing documentation. The primary gaps are:

1. **No EAS configuration** - Cannot build native iOS app
2. **No privacy manifest** - Required by Apple since Spring 2024
3. **No iOS permission descriptions** - Will crash or be rejected
4. **No App Store Connect setup** - No place to submit

**Recommendation**: Focus on P0 items first. Estimate 2-3 days to complete configuration, then additional time for TestFlight testing before App Store submission.
