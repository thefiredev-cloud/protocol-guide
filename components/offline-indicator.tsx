import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { IconSymbol } from "./ui/icon-symbol";
import { OfflineCache } from "@/lib/offline-cache";
import NetInfo from "@react-native-community/netinfo";

type OfflineIndicatorProps = {
  isOnline?: boolean;
  showCacheInfo?: boolean;
};

/**
 * Shows a banner when the device is offline
 * Informs paramedics they're using cached data
 */
export function OfflineIndicator({ isOnline: propIsOnline, showCacheInfo = false }: OfflineIndicatorProps) {
  const colors = useColors();
  const [isOnline, setIsOnline] = useState(propIsOnline ?? true);
  const [cacheCount, setCacheCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Use prop if provided, otherwise monitor network
  useEffect(() => {
    if (propIsOnline !== undefined) {
      setIsOnline(propIsOnline);
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, [propIsOnline]);

  // Load cache info when offline
  useEffect(() => {
    if (!isOnline && showCacheInfo) {
      const loadCacheInfo = async () => {
        const protocols = await OfflineCache.getAllProtocols();
        const pending = await OfflineCache.getPendingSearches();
        setCacheCount(protocols.length);
        setPendingCount(pending.length);
      };
      loadCacheInfo();
    }
  }, [isOnline, showCacheInfo]);

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={[styles.container, { backgroundColor: colors.warning }]}
    >
      <View style={styles.content}>
        <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#000" />
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>
            Offline Mode - Using cached protocols
          </Text>
          {showCacheInfo && (
            <Text style={styles.subText}>
              {cacheCount} cached • {pendingCount} pending sync
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Small offline badge for headers or cards
 */
export function OfflineBadge() {
  const colors = useColors();

  return (
    <View style={[styles.badge, { backgroundColor: `${colors.warning}30` }]}>
      <View style={[styles.badgeDot, { backgroundColor: colors.warning }]} />
      <Text style={[styles.badgeText, { color: colors.warning }]}>
        Offline
      </Text>
    </View>
  );
}

/**
 * Syncing indicator - shows when background sync is in progress
 */
export function SyncingIndicator({ isSyncing }: { isSyncing: boolean }) {
  const colors = useColors();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [isSyncing, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!isSyncing) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.syncContainer}
    >
      <Animated.View style={animatedStyle}>
        <IconSymbol name="arrow.triangle.2.circlepath" size={14} color={colors.primary} />
      </Animated.View>
      <Text style={[styles.syncText, { color: colors.muted }]}>
        Syncing...
      </Text>
    </Animated.View>
  );
}

/**
 * Connection status indicator with auto-retry
 */
export function ConnectionStatus() {
  const colors = useColors();
  const [isOnline, setIsOnline] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
      setLastChecked(new Date());
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsOnline(state.isConnected ?? true);
    setLastChecked(new Date());
  };

  return (
    <TouchableOpacity 
      onPress={checkConnection}
      style={[
        styles.statusContainer,
        { 
          backgroundColor: isOnline 
            ? `${colors.success}20` 
            : `${colors.warning}20` 
        }
      ]}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.statusDot, 
          { backgroundColor: isOnline ? colors.success : colors.warning }
        ]} 
      />
      <Text style={[styles.statusText, { color: colors.foreground }]}>
        {isOnline ? "Online" : "Offline"}
      </Text>
      {lastChecked && (
        <Text style={[styles.statusTime, { color: colors.muted }]}>
          {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: 8,
    alignItems: "center",
  },
  mainText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  subText: {
    fontSize: 11,
    color: "#374151",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  syncContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  syncText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusTime: {
    fontSize: 11,
  },
});
