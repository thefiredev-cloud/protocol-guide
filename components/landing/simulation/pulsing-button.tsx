/**
 * Pulsing Button - Animated CTA button with pulse ring effect
 */

import * as React from "react";
import { useRef, useEffect } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet, Platform, ViewStyle } from "react-native";
import { COLORS } from "./constants";

interface PulsingButtonProps {
  onPress: () => void;
  label: string;
  isRunning: boolean;
}

export function PulsingButton({ onPress, label, isRunning }: PulsingButtonProps) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isRunning) {
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
      return;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [isRunning, pulseScale, pulseOpacity]);

  return (
    <View style={styles.buttonContainer}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
      <Pressable
        onPress={onPress}
        style={({ pressed, hovered }) =>
          [
            styles.button,
            pressed && styles.buttonPressed,
            hovered && styles.buttonHovered,
          ] as ViewStyle[]
        }
      >
        <Text style={styles.buttonText}>{isRunning ? "Running..." : label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: COLORS.primaryRed,
    borderRadius: 10,
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    position: "relative",
    zIndex: 1,
    ...(Platform.OS === "web"
      ? {
          transitionProperty: "transform, background-color",
          transitionDuration: "150ms",
        }
      : {}),
  },
  buttonHovered: {
    backgroundColor: "#7A1C2A",
    ...(Platform.OS === "web"
      ? {
          transform: [{ scale: 1.02 }],
        }
      : {}),
  },
  buttonPressed: {
    backgroundColor: "#6B1825",
    ...(Platform.OS === "web"
      ? {
          transform: [{ scale: 0.98 }],
        }
      : {}),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PulsingButton;
