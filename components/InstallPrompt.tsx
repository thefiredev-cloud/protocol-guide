/**
 * Install Prompt Component
 * Shows a prompt to install the PWA on supported devices
 * Optimized for both iOS and Android/Chrome
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Platform, StyleSheet, Image } from 'react-native';
import Animated, { 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHOW_DELAY = 5000; // 5 seconds after page load

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installStep, setInstallStep] = useState<'prompt' | 'ios-instructions'>('prompt');
  const colors = useColors();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // Don't show if already installed
    if (standalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    let promptTimer: ReturnType<typeof setTimeout> | null = null;

    // Handle beforeinstallprompt event (Chrome/Edge/Samsung)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);

      // Show prompt after a delay
      promptTimer = setTimeout(() => {
        setShowPrompt(true);
      }, SHOW_DELAY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual install instructions after delay
    if (iOS && !standalone) {
      promptTimer = setTimeout(() => {
        setShowPrompt(true);
      }, SHOW_DELAY);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (promptTimer) clearTimeout(promptTimer);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIOS) {
      setInstallStep('ios-instructions');
      return;
    }

    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[Install] Error showing install prompt:', error);
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setInstallStep('prompt');
    // Remember dismissal
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // Don't render in non-web environments or if already installed
  if (Platform.OS !== 'web' || isStandalone || !showPrompt) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInDown.duration(400).springify()}
      exiting={SlideOutDown.duration(300)}
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      {installStep === 'prompt' ? (
        <View style={styles.content}>
          {/* Header with icon and dismiss */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Image 
                source={{ uri: '/icon-192.png' }} 
                style={styles.appIcon}
                resizeMode="contain"
              />
            </View>
            <Pressable
              onPress={handleDismiss}
              style={styles.dismissButton}
              accessibilityLabel="Dismiss install prompt"
              accessibilityRole="button"
            >
              <IconSymbol name="xmark" size={18} color={colors.muted} />
            </Pressable>
          </View>

          {/* Title and description */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Install Protocol Guide
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              {isIOS 
                ? 'Add to your home screen for quick access and offline use'
                : 'Install for quick access and offline protocol searches'
              }
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <IconSymbol name="bolt.fill" size={16} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.foreground }]}>
                Instant access
              </Text>
            </View>
            <View style={styles.benefit}>
              <IconSymbol name="wifi.slash" size={16} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.foreground }]}>
                Works offline
              </Text>
            </View>
            <View style={styles.benefit}>
              <IconSymbol name="bell.fill" size={16} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.foreground }]}>
                Push alerts
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleInstallClick}
              style={[styles.installButton, { backgroundColor: colors.primary }]}
              accessibilityLabel="Install Protocol Guide app"
              accessibilityRole="button"
            >
              <IconSymbol name="arrow.down.circle.fill" size={18} color="#fff" />
              <Text style={styles.installButtonText}>
                {isIOS ? 'How to Install' : 'Install Now'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // iOS Instructions
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Install on iOS
            </Text>
            <Pressable
              onPress={handleDismiss}
              style={styles.dismissButton}
              accessibilityLabel="Close instructions"
              accessibilityRole="button"
            >
              <IconSymbol name="xmark" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.iosSteps}>
            <View style={styles.iosStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  Tap the Share button
                </Text>
                <Text style={[styles.stepDescription, { color: colors.muted }]}>
                  Look for the share icon <Text style={styles.shareIcon}>⬆️</Text> in Safari
                </Text>
              </View>
            </View>

            <View style={styles.iosStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  Scroll and tap &quot;Add to Home Screen&quot;
                </Text>
                <Text style={[styles.stepDescription, { color: colors.muted }]}>
                  You may need to scroll down in the share menu
                </Text>
              </View>
            </View>

            <View style={styles.iosStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  Tap &quot;Add&quot;
                </Text>
                <Text style={[styles.stepDescription, { color: colors.muted }]}>
                  Protocol Guide will appear on your home screen
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => setInstallStep('prompt')}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <IconSymbol name="chevron.left" size={16} color={colors.foreground} />
            <Text style={[styles.backButtonText, { color: colors.foreground }]}>
              Back
            </Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 1000,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appIcon: {
    width: 56,
    height: 56,
  },
  dismissButton: {
    padding: 8,
    margin: -8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    gap: 10,
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  installButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iosSteps: {
    gap: 16,
    marginBottom: 20,
  },
  iosStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  shareIcon: {
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
