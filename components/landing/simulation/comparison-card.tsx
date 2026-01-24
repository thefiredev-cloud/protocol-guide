/**
 * ComparisonCard - Enhanced card with hover lift effect
 */

import { useRef } from "react";
import { View, Text, Animated, StyleSheet, Platform } from "react-native";
import { COLORS } from "./constants";

interface ComparisonCardProps {
  label: string;
  value: string;
  description: string;
  variant: "standard" | "protocol";
}

export function ComparisonCard({ label, value, description, variant }: ComparisonCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    if (Platform.OS === "web") {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === "web") {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        variant === "protocol" && styles.cardProtocol,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
      // @ts-expect-error - Web-only hover events
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, variant === "protocol" && styles.cardValueProtocol]}>
        {value}
      </Text>
      <Text style={styles.cardDescription}>{description}</Text>

      {variant === "protocol" && (
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>AI Powered</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          transition: "box-shadow 0.2s ease",
        }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
  },
  cardProtocol: {
    borderColor: COLORS.primaryRed,
    borderWidth: 2,
  },
  cardLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardValue: {
    color: COLORS.textWhite,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardValueProtocol: {
    color: COLORS.primaryRed,
  },
  cardDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  cardBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.primaryRed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
