/**
 * Service Unavailable Component
 *
 * Displays a user-friendly message when a service is temporarily unavailable.
 * Provides retry functionality and alternative actions.
 *
 * Features:
 * - User-friendly error messages (no technical jargon)
 * - Automatic retry with countdown
 * - Manual retry button
 * - Alternative action suggestions
 *
 * Usage:
 * ```tsx
 * <ServiceUnavailable
 *   service="search"
 *   onRetry={() => refetch()}
 *   retryIn={30}
 * />
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { spacing, radii, touchTargets } from "@/lib/design-tokens";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { addBreadcrumb } from "@/lib/sentry-client";

export type ServiceType = "search" | "voice" | "ai" | "database" | "general";

interface ServiceUnavailableProps {
  /** Which service is unavailable */
  service: ServiceType;
  /** Callback when user clicks retry */
  onRetry?: () => void;
  /** Seconds until auto-retry (optional) */
  retryIn?: number;
  /** Whether currently retrying */
  isRetrying?: boolean;
  /** Custom title override */
  title?: string;
  /** Custom message override */
  message?: string;
  /** Compact display mode */
  compact?: boolean;
  /** Alternative action to suggest */
  alternativeAction?: {
    label: string;
    onPress: () => void;
  };
}

// User-friendly service names and messages
const SERVICE_INFO: Record<
  ServiceType,
  {
    name: string;
    title: string;
    message: string;
    icon: string;
    suggestion: string;
  }
> = {
  search: {
    name: "Search",
    title: "Search Unavailable",
    message: "We're having trouble connecting to our search system right now.",
    icon: "magnifyingglass",
    suggestion: "Try checking your internet connection or searching again in a moment.",
  },
  voice: {
    name: "Voice",
    title: "Voice Search Unavailable",
    message: "Voice recognition is temporarily unavailable.",
    icon: "mic.fill",
    suggestion: "Try typing your search instead, or try voice search again in a moment.",
  },
  ai: {
    name: "AI Assistant",
    title: "AI Assistant Busy",
    message: "Our AI assistant is experiencing high demand right now.",
    icon: "sparkles",
    suggestion: "Your request will be processed shortly. Please wait a moment.",
  },
  database: {
    name: "Data",
    title: "Data Temporarily Unavailable",
    message: "We're having trouble loading your data right now.",
    icon: "externaldrive.fill",
    suggestion: "Please check your connection and try again.",
  },
  general: {
    name: "Service",
    title: "Something Went Wrong",
    message: "We encountered an unexpected issue.",
    icon: "exclamationmark.triangle.fill",
    suggestion: "Please try again. If the problem persists, restart the app.",
  },
};

export function ServiceUnavailable({
  service,
  onRetry,
  retryIn,
  isRetrying = false,
  title,
  message,
  compact = false,
  alternativeAction,
}: ServiceUnavailableProps) {
  const colors = useColors();
  const [countdown, setCountdown] = useState(retryIn || 0);
  const [hasAutoRetried, setHasAutoRetried] = useState(false);

  const serviceInfo = SERVICE_INFO[service];

  // Countdown timer for auto-retry
  useEffect(() => {
    if (!retryIn || countdown <= 0 || hasAutoRetried) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-retry when countdown reaches 0
          if (onRetry && !hasAutoRetried) {
            setHasAutoRetried(true);
            addBreadcrumb(`Auto-retry ${service} service`, "retry", { service });
            onRetry();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryIn, countdown, hasAutoRetried, onRetry, service]);

  // Reset countdown when retryIn changes
  useEffect(() => {
    if (retryIn) {
      setCountdown(retryIn);
      setHasAutoRetried(false);
    }
  }, [retryIn]);

  const handleRetry = useCallback(() => {
    addBreadcrumb(`Manual retry ${service} service`, "retry", { service });
    setCountdown(0);
    onRetry?.();
  }, [onRetry, service]);

  // Compact mode for inline display
  if (compact) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: `${colors.warning}15`,
          borderRadius: radii.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: `${colors.warning}30`,
        }}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <IconSymbol
          name={serviceInfo.icon as any}
          size={20}
          color={colors.warning}
          style={{ marginRight: spacing.sm }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {title || serviceInfo.title}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {message || serviceInfo.message}
          </Text>
        </View>
        {onRetry && (
          <Pressable
            onPress={handleRetry}
            disabled={isRetrying}
            style={({ pressed }) => ({
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.md,
              borderRadius: radii.md,
              backgroundColor: colors.primary,
              opacity: pressed || isRetrying ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                Retry
              </Text>
            )}
          </Pressable>
        )}
      </View>
    );
  }

  // Full display mode
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.xl,
      }}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.xl,
          padding: spacing.xl,
          maxWidth: 400,
          width: "100%",
          alignItems: "center",
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: `${colors.warning}20`,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.lg,
          }}
        >
          <IconSymbol
            name={serviceInfo.icon as any}
            size={32}
            color={colors.warning}
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: colors.foreground,
            textAlign: "center",
            marginBottom: spacing.sm,
          }}
          accessibilityRole="header"
        >
          {title || serviceInfo.title}
        </Text>

        {/* Message */}
        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
            textAlign: "center",
            lineHeight: 20,
            marginBottom: spacing.md,
          }}
        >
          {message || serviceInfo.message}
        </Text>

        {/* Suggestion */}
        <Text
          style={{
            fontSize: 13,
            color: colors.muted,
            textAlign: "center",
            lineHeight: 18,
            marginBottom: spacing.xl,
            fontStyle: "italic",
          }}
        >
          {serviceInfo.suggestion}
        </Text>

        {/* Countdown */}
        {countdown > 0 && !isRetrying && (
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: spacing.md,
            }}
          >
            Retrying automatically in {countdown}s...
          </Text>
        )}

        {/* Retry Button */}
        {onRetry && (
          <Pressable
            onPress={handleRetry}
            disabled={isRetrying}
            style={({ pressed }) => ({
              minHeight: touchTargets.minimum,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing["2xl"],
              borderRadius: radii.lg,
              backgroundColor: colors.primary,
              opacity: pressed || isRetrying ? 0.7 : 1,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            })}
            accessibilityRole="button"
            accessibilityLabel={isRetrying ? "Retrying" : "Try again"}
          >
            {isRetrying ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={{ marginRight: spacing.sm }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  Retrying...
                </Text>
              </>
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                Try Again
              </Text>
            )}
          </Pressable>
        )}

        {/* Alternative Action */}
        {alternativeAction && (
          <Pressable
            onPress={alternativeAction.onPress}
            style={({ pressed }) => ({
              marginTop: spacing.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={alternativeAction.label}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.primary,
                fontWeight: "500",
              }}
            >
              {alternativeAction.label}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default ServiceUnavailable;
