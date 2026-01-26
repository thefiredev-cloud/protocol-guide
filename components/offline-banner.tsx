import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OfflineCache } from "@/lib/offline-cache";

type OfflineBannerProps = {
  showPendingCount?: boolean;
  onPress?: () => void;
};

export function OfflineBanner({ showPendingCount = true, onPress }: OfflineBannerProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const colors = useColors();
  
  // Pulse animation for the offline icon
  const pulseOpacity = useSharedValue(1);
  
  useEffect(() => {
    if (isOffline) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [isOffline, pulseOpacity]);
  
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Load pending search count
  useEffect(() => {
    if (isOffline && showPendingCount) {
      const loadPendingCount = async () => {
        const pending = await OfflineCache.getPendingSearches();
        setPendingCount(pending.length);
      };
      loadPendingCount();
      
      // Refresh periodically
      const interval = setInterval(loadPendingCount, 5000);
      return () => clearInterval(interval);
    }
  }, [isOffline, showPendingCount]);

  if (!isOffline) return null;

  const content = (
    <View style={styles.inner}>
      <Animated.View style={pulseStyle}>
        <IconSymbol name="wifi.slash" size={16} color="#1F2937" />
      </Animated.View>
      <Text style={styles.text}>
        You're offline
        {pendingCount > 0 && ` • ${pendingCount} pending`}
      </Text>
      <Text style={styles.subtext}>Using cached protocols</Text>
    </View>
  );

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(200)}
      style={[styles.container, { backgroundColor: colors.warning }]}
    >
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
          {content}
          <IconSymbol name="chevron.right" size={14} color="#1F2937" />
        </TouchableOpacity>
      ) : (
        content
      )}
    </Animated.View>
  );
}

/**
 * Compact offline dot indicator for headers
 */
export function OfflineDot() {
  const [isOffline, setIsOffline] = useState(false);
  const colors = useColors();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    
    NetInfo.fetch().then((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.dot, { backgroundColor: colors.warning }]}
    />
  );
}

/**
 * Full-screen offline state for when the app cannot function
 */
export function OfflineFullScreen() {
  const [isOffline, setIsOffline] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const colors = useColors();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    
    NetInfo.fetch().then((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOffline) {
      OfflineCache.getAllProtocols().then(protocols => {
        setCachedCount(protocols.length);
      });
    }
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
      <View style={[styles.fullScreenCard, { backgroundColor: colors.surface }]}>
        <IconSymbol name="wifi.slash" size={48} color={colors.warning} />
        <Text style={[styles.fullScreenTitle, { color: colors.foreground }]}>
          No Internet Connection
        </Text>
        <Text style={[styles.fullScreenText, { color: colors.muted }]}>
          {cachedCount > 0
            ? `You have ${cachedCount} cached protocols available offline.`
            : "Connect to the internet to search protocols."}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            NetInfo.fetch().then((state) => {
              setIsOffline(!state.isConnected);
            });
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  subtext: {
    fontSize: 11,
    color: "#374151",
    marginLeft: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 100,
  },
  fullScreenCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    maxWidth: 340,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fullScreenTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  fullScreenText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
