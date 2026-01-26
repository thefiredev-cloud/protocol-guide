/**
 * CookieConsentBanner - GDPR/CCPA Compliant Cookie Consent
 * 
 * Displays a minimal, non-intrusive cookie consent banner for analytics cookies.
 * Essential cookies (authentication, security) are exempt from consent.
 * 
 * Features:
 * - Minimal UI that doesn't block app usage
 * - Persistent consent storage via AsyncStorage
 * - Support for granular consent (analytics, marketing, etc.)
 * - GDPR-compliant consent tracking
 * - Works on all platforms (iOS, Android, Web)
 */

import { useEffect, useState } from "react";
import { View, Text, Pressable, Animated, Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "@/lib/haptics";

const CONSENT_STORAGE_KEY = "cookie_consent_v1";

export type CookieConsent = {
  /** Consent has been given/denied */
  decided: boolean;
  /** Timestamp when consent was recorded */
  timestamp: string;
  /** Essential cookies - always true, cannot be disabled */
  essential: true;
  /** Analytics cookies - user can opt out */
  analytics: boolean;
  /** Marketing cookies - for future use */
  marketing: boolean;
  /** Version of consent policy agreed to */
  policyVersion: string;
};

const CURRENT_POLICY_VERSION = "1.0";

type CookieConsentBannerProps = {
  /** Callback when consent is updated */
  onConsentUpdate?: (consent: CookieConsent) => void;
};

export function CookieConsentBanner({ onConsentUpdate }: CookieConsentBannerProps) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const slideAnim = useState(new Animated.Value(100))[0]; // Start off-screen

  // Check existing consent on mount
  useEffect(() => {
    checkExistingConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const checkExistingConsent = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const consent: CookieConsent = JSON.parse(stored);
        // Check if consent is valid and for current policy version
        if (consent.decided && consent.policyVersion === CURRENT_POLICY_VERSION) {
          // Consent already given, don't show banner
          setVisible(false);
          onConsentUpdate?.(consent);
        } else {
          // Policy version changed or invalid, show banner again
          setVisible(true);
        }
      } else {
        // No consent recorded, show banner
        setVisible(true);
      }
    } catch (error) {
      console.error("Failed to check cookie consent:", error);
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const saveConsent = async (consent: CookieConsent) => {
    try {
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
      onConsentUpdate?.(consent);
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    }
  };

  const handleAcceptAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const consent: CookieConsent = {
      decided: true,
      timestamp: new Date().toISOString(),
      essential: true,
      analytics: true,
      marketing: true,
      policyVersion: CURRENT_POLICY_VERSION,
    };

    await saveConsent(consent);
    animateOut();
  };

  const handleAcceptEssential = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const consent: CookieConsent = {
      decided: true,
      timestamp: new Date().toISOString(),
      essential: true,
      analytics: false,
      marketing: false,
      policyVersion: CURRENT_POLICY_VERSION,
    };

    await saveConsent(consent);
    animateOut();
  };

  const handleCustomize = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetails(!showDetails);
  };

  const handlePrivacyPolicy = () => {
    // Navigate to privacy policy (use Linking for web, router for native)
    if (Platform.OS === "web") {
      Linking.openURL("/privacy");
    } else {
      // Will be handled by the app's router
      Linking.openURL("protocol-guide://privacy");
    }
  };

  const animateOut = () => {
    Animated.timing(slideAnim, {
      toValue: 200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  // Don't render anything while checking existing consent or if not visible
  if (loading || !visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: Platform.OS === "web" ? 20 : 100, // Account for tab bar on mobile
        left: 16,
        right: 16,
        transform: [{ translateY: slideAnim }],
        zIndex: 1000,
      }}
    >
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Main Banner */}
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-start mb-3">
            <IconSymbol 
              name="shield.lefthalf.filled" 
              size={20} 
              color={colors.primary} 
            />
            <View className="flex-1 ml-2">
              <Text className="text-base font-semibold text-foreground">
                Cookie Preferences
              </Text>
              <Text className="text-sm text-muted mt-1" style={{ lineHeight: 18 }}>
                We use cookies to improve your experience. Essential cookies are required for the app to work. Analytics cookies help us understand usage patterns.
              </Text>
            </View>
          </View>

          {/* Learn More Link */}
          <Pressable 
            onPress={handlePrivacyPolicy}
            className="mb-4"
          >
            <Text 
              className="text-sm underline"
              style={{ color: colors.primary }}
            >
              Learn more in our Privacy Policy
            </Text>
          </Pressable>

          {/* Expanded Details */}
          {showDetails && (
            <View 
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: colors.muted + "10" }}
            >
              <CookieCategory
                name="Essential Cookies"
                description="Required for authentication, security, and basic functionality."
                required
                colors={colors}
              />
              <CookieCategory
                name="Analytics Cookies"
                description="Help us understand how users interact with the app to improve the experience."
                colors={colors}
              />
              <CookieCategory
                name="Marketing Cookies"
                description="Used for personalized content and advertising (not currently in use)."
                colors={colors}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleAcceptEssential}
              className="flex-1 py-3 rounded-xl items-center justify-center"
              style={{
                backgroundColor: colors.muted + "20",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                Essential Only
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCustomize}
              className="py-3 px-4 rounded-xl items-center justify-center"
              style={{
                backgroundColor: colors.muted + "20",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol 
                name={showDetails ? "chevron.up" : "chevron.down"} 
                size={16} 
                color={colors.foreground} 
              />
            </Pressable>

            <Pressable
              onPress={handleAcceptAll}
              className="flex-1 py-3 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-sm font-medium text-white">
                Accept All
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function CookieCategory({ 
  name, 
  description, 
  required = false,
  colors,
}: { 
  name: string; 
  description: string; 
  required?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View className="mb-3 last:mb-0">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-foreground">{name}</Text>
        {required ? (
          <Text className="text-xs text-muted">Always on</Text>
        ) : (
          <Text className="text-xs" style={{ color: colors.primary }}>Optional</Text>
        )}
      </View>
      <Text className="text-xs text-muted mt-1" style={{ lineHeight: 16 }}>
        {description}
      </Text>
    </View>
  );
}

// ============ Hook for accessing consent state ============

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsent();
  }, []);

  const loadConsent = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        setConsent(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load cookie consent:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (updates: Partial<CookieConsent>) => {
    const newConsent: CookieConsent = {
      decided: true,
      timestamp: new Date().toISOString(),
      essential: true,
      analytics: consent?.analytics ?? false,
      marketing: consent?.marketing ?? false,
      policyVersion: CURRENT_POLICY_VERSION,
      ...updates,
    };

    try {
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
    } catch (error) {
      console.error("Failed to update cookie consent:", error);
    }
  };

  const resetConsent = async () => {
    try {
      await AsyncStorage.removeItem(CONSENT_STORAGE_KEY);
      setConsent(null);
    } catch (error) {
      console.error("Failed to reset cookie consent:", error);
    }
  };

  return {
    consent,
    loading,
    hasConsented: consent?.decided ?? false,
    analyticsEnabled: consent?.analytics ?? false,
    marketingEnabled: consent?.marketing ?? false,
    updateConsent,
    resetConsent,
  };
}
