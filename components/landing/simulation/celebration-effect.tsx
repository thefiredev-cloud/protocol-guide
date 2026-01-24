/**
 * CelebrationEffect - Confetti/flash effect on simulation completion
 */

import { useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { COLORS } from "./constants";

interface CelebrationEffectProps {
  visible: boolean;
}

export function CelebrationEffect({ visible }: CelebrationEffectProps) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Flash effect
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti burst
      const confettiAnimations = confettiAnims.map((anim, index) => {
        const angle = (index / confettiAnims.length) * Math.PI * 2;
        const distance = 80 + Math.random() * 40;

        return Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: Math.sin(angle) * distance,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: Math.cos(angle) * distance,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 720 - 360,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.delay(400),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.parallel(confettiAnimations).start(() => {
        // Reset
        confettiAnims.forEach((anim) => {
          anim.translateY.setValue(0);
          anim.translateX.setValue(0);
          anim.rotate.setValue(0);
          anim.opacity.setValue(0);
        });
      });
    }
  }, [visible, flashAnim, confettiAnims]);

  const confettiColors = [
    COLORS.primaryRed,
    COLORS.celebrationGreen,
    COLORS.chartYellow,
    "#3B82F6",
    "#8B5CF6",
  ];

  return (
    <View style={styles.celebrationContainer} pointerEvents="none">
      {/* Flash overlay */}
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      />

      {/* Confetti pieces */}
      {confettiAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: confettiColors[index % confettiColors.length],
              transform: [
                { translateY: anim.translateY },
                { translateX: anim.translateX },
                {
                  rotate: anim.rotate.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ["-360deg", "360deg"],
                  }),
                },
              ],
              opacity: anim.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  celebrationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  flashOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.celebrationGreen,
    borderRadius: 12,
  },
  confettiPiece: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
