/**
 * SimulationTimer - Live timer display for training simulations
 *
 * Features:
 * - Prominent MM:SS.D display
 * - Pause/resume button
 * - Visual state indicators (running, paused, stopped)
 * - Pulse animation when running
 * - Professional training-focused design
 *
 * Accessibility: ARIA labels, reduced-motion support
 */

import { useRef, useEffect, useState, memo } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { prefersReducedMotion } from "./constants";

// Dark theme colors matching simulation-section.tsx
const TIMER_COLORS = {
  primaryRed: "#EF4444",
  textWhite: "#F1F5F9",
  textMuted: "#94A3B8",
  bgDark: "#0F172A",
  bgSurface: "#1E293B",
  border: "#334155",
  timerGreen: "#10B981",
  timerYellow: "#F59E0B",
  pausedBlue: "#3B82F6",
};

interface SimulationTimerProps {
  /** Formatted time string to display (e.g., "02:45.3") */
  formattedTime: string;
  /** Whether the timer is actively running */
  isRunning: boolean;
  /** Whether the timer is paused */
  isPaused: boolean;
  /** Callback when pause/resume button is pressed */
  onTogglePause?: () => void;
  /** Optional label above the timer */
  label?: string;
  /** Show compact version */
  compact?: boolean;
  /** Show pause/resume button */
  showPauseButton?: boolean;
}

/**
 * SimulationTimer Component
 *
 * Displays a prominent live timer for training simulations with optional
 * pause/resume functionality.
 */
export const SimulationTimer = memo(function SimulationTimer({
  formattedTime,
  isRunning,
  isPaused,
  onTogglePause,
  label = "Simulation Time",
  compact = false,
  showPauseButton = true,
}: SimulationTimerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion());

  // Check for reduced motion preference
  useEffect(() => {
    if (Platform.OS === "web") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Pulse animation when running
  useEffect(() => {
    if (isRunning && !isPaused && !reducedMotion) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, isPaused, pulseAnim, reducedMotion]);

  // Blinking dot animation when paused
  useEffect(() => {
    if (isPaused && !reducedMotion) {
      const blinkLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      blinkLoop.start();
      return () => blinkLoop.stop();
    } else {
      dotOpacity.setValue(1);
    }
  }, [isPaused, dotOpacity, reducedMotion]);

  // Determine timer color based on state
  const getTimerColor = () => {
    if (!isRunning) return TIMER_COLORS.textMuted;
    if (isPaused) return TIMER_COLORS.pausedBlue;
    return TIMER_COLORS.timerGreen;
  };

  // Determine status indicator color
  const getStatusColor = () => {
    if (!isRunning) return TIMER_COLORS.textMuted;
    if (isPaused) return TIMER_COLORS.timerYellow;
    return TIMER_COLORS.timerGreen;
  };

  // Status text
  const getStatusText = () => {
    if (!isRunning) return "Ready";
    if (isPaused) return "Paused";
    return "Running";
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Animated.View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(), opacity: dotOpacity },
          ]}
        />
        <Text
          style={[styles.compactTime, { color: getTimerColor() }]}
          accessibilityLabel={`Timer: ${formattedTime}`}
          accessibilityRole="timer"
        >
          {formattedTime}
        </Text>
        {showPauseButton && isRunning && onTogglePause && (
          <Pressable
            onPress={onTogglePause}
            style={styles.compactPauseButton}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? "Resume timer" : "Pause timer"}
          >
            <Text style={styles.compactPauseButtonText}>
              {isPaused ? "\u25B6" : "\u23F8"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Timer Display */}
      <View style={styles.timerRow}>
        {/* Status Indicator */}
        <Animated.View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(), opacity: dotOpacity },
          ]}
        />

        {/* Time Display */}
        <Text
          style={[styles.timerText, { color: getTimerColor() }]}
          accessibilityLabel={`Timer: ${formattedTime}`}
          accessibilityRole="timer"
          accessibilityLiveRegion="polite"
        >
          {formattedTime}
        </Text>

        {/* Pause/Resume Button */}
        {showPauseButton && isRunning && onTogglePause && (
          <Pressable
            onPress={onTogglePause}
            style={({ pressed }) => [
              styles.pauseButton,
              pressed && styles.pauseButtonPressed,
              isPaused && styles.pauseButtonPaused,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? "Resume timer" : "Pause timer"}
            accessibilityHint={
              isPaused
                ? "Double tap to resume the simulation timer"
                : "Double tap to pause the simulation timer"
            }
          >
            <Text style={styles.pauseButtonIcon}>
              {isPaused ? "\u25B6" : "\u23F8"}
            </Text>
            <Text style={styles.pauseButtonText}>
              {isPaused ? "Resume" : "Pause"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Status Text */}
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: TIMER_COLORS.bgDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TIMER_COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
        }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }),
  },
  label: {
    color: TIMER_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timerText: {
    fontSize: 36,
    fontWeight: "700",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "'SF Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
    }),
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TIMER_COLORS.bgSurface,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: TIMER_COLORS.border,
    gap: 6,
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
          transition: "background-color 0.15s ease",
        }
      : {}),
  },
  pauseButtonPressed: {
    backgroundColor: TIMER_COLORS.bgDark,
  },
  pauseButtonPaused: {
    borderColor: TIMER_COLORS.timerGreen,
  },
  pauseButtonIcon: {
    color: TIMER_COLORS.textWhite,
    fontSize: 14,
  },
  pauseButtonText: {
    color: TIMER_COLORS.textWhite,
    fontSize: 12,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
  },
  // Compact styles
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: TIMER_COLORS.bgDark,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: TIMER_COLORS.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactTime: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "'SF Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
    }),
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  compactPauseButton: {
    padding: 4,
  },
  compactPauseButtonText: {
    color: TIMER_COLORS.textWhite,
    fontSize: 12,
  },
});

export default SimulationTimer;
