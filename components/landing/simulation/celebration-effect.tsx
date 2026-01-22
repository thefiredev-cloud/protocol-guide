/**
 * Celebration Effect - Confetti animation for simulation completion
 */

import * as React from "react";
import { useRef, useEffect } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { COLORS, CONFETTI_COUNT } from "./constants";

// Confetti particle component
function ConfettiParticle({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          delay: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: 120,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 100,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(rotate, {
          toValue: (Math.random() - 0.5) * 4,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animations.start();
  }, [delay, opacity, scale, translateY, translateX, rotate]);

  const colors = [
    COLORS.primaryRed,
    COLORS.celebrationGold,
    COLORS.celebrationGreen,
    COLORS.chartYellow,
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: startX,
        top: 0,
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        backgroundColor: color,
        opacity,
        transform: [
          { translateY },
          { translateX },
          { scale },
          {
            rotate: rotate.interpolate({
              inputRange: [-4, 4],
              outputRange: ["-720deg", "720deg"],
            }),
          },
        ],
      }}
    />
  );
}

// Celebration overlay component
export function CelebrationEffect({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <View style={styles.celebrationContainer} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiParticle key={i} delay={i * 50} startX={20 + (i / CONFETTI_COUNT) * 260} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  celebrationContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 10,
  },
});

export default CelebrationEffect;
