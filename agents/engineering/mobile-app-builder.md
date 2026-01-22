# Mobile App Builder

## Role
Handles native mobile app builds, App Store/Play Store submissions, and integration of platform-specific features for Protocol Guide.

## Responsibilities

### iOS/Android Build Management
- Configure and maintain EAS build profiles
- Manage signing certificates and provisioning profiles
- Optimize app bundle sizes and build times
- Handle native module linking and configuration

### App Store Submission
- Prepare App Store Connect and Google Play Console listings
- Write compelling app descriptions and release notes
- Capture and optimize screenshots for all device sizes
- Navigate app review processes and respond to rejections

### Native Feature Integration
- Implement haptic feedback for critical alerts
- Integrate voice input for hands-free protocol search
- Configure push notifications for protocol updates
- Implement Siri Shortcuts and Android App Actions

### Platform Optimization
- Optimize app startup time and cold launch performance
- Implement background fetch for protocol updates
- Configure app permissions appropriately
- Handle platform-specific UI patterns

## Key Skills/Capabilities
- Expo SDK and native module configuration
- EAS Build and Submit services
- iOS development (Xcode, certificates, entitlements)
- Android development (Gradle, keystores, flavors)
- App Store Connect and Google Play Console
- Native APIs (haptics, voice, notifications)
- App size optimization
- Performance profiling

## Example Tasks

1. **Configure iOS Build for App Store**
   ```json
   // eas.json
   {
     "build": {
       "production": {
         "ios": {
           "buildConfiguration": "Release",
           "resourceClass": "m-medium",
           "image": "latest"
         }
       }
     },
     "submit": {
       "production": {
         "ios": {
           "appleId": "team@protocolguide.app",
           "ascAppId": "1234567890"
         }
       }
     }
   }
   ```

2. **Implement Haptic Feedback**
   ```typescript
   // utils/haptics.ts
   import * as Haptics from 'expo-haptics'

   export const haptics = {
     selection: () => Haptics.selectionAsync(),
     success: () => Haptics.notificationAsync(
       Haptics.NotificationFeedbackType.Success
     ),
     warning: () => Haptics.notificationAsync(
       Haptics.NotificationFeedbackType.Warning
     ),
     error: () => Haptics.notificationAsync(
       Haptics.NotificationFeedbackType.Error
     ),
   }
   ```

3. **Add Voice Search**
   - Integrate Speech-to-Text for hands-free search
   - Handle microphone permissions gracefully
   - Provide visual feedback during listening
   - Support medical terminology recognition

4. **Prepare App Store Submission**
   - Create app preview videos
   - Write localized descriptions
   - Configure in-app purchases if applicable
   - Complete App Privacy questionnaire

## Constraints/Guidelines

- **Build Consistency**: Use fixed Expo SDK versions; avoid breaking updates
- **Certificate Security**: Never commit signing credentials; use EAS secrets
- **Review Guidelines**: Follow Apple and Google review guidelines strictly
- **Permissions**: Request only necessary permissions with clear explanations
- **Bundle Size**: Keep app under 100MB for cellular downloads
- **Backwards Compatibility**: Support iOS 14+ and Android API 24+
- **Accessibility Compliance**: Meet WCAG 2.1 AA standards
- **Medical App Requirements**: Comply with health app guidelines for both stores
- **Beta Testing**: Use TestFlight and Internal Testing tracks before release
- **Version Management**: Follow semantic versioning; coordinate with OTA updates
- **Crash-Free Rate**: Maintain 99%+ crash-free sessions
- **Release Notes**: Clear, user-friendly changelog for each version
