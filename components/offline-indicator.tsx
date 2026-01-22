import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp } from "react-native-reanimated";
import { IconSymbol } from "./ui/icon-symbol";

type OfflineIndicatorProps = {
  isOnline: boolean;
};

/**
 * Shows a banner when the device is offline
 * Informs paramedics they're using cached data
 */
export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  const colors = useColors();

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      className="px-4 py-2 flex-row items-center justify-center"
      style={{ backgroundColor: colors.warning }}
    >
      <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#000" />
      <Text className="text-sm font-medium ml-2" style={{ color: "#000" }}>
        Offline Mode - Using cached protocols
      </Text>
    </Animated.View>
  );
}

/**
 * Small offline badge for headers or cards
 */
export function OfflineBadge() {
  const colors = useColors();

  return (
    <View
      className="px-2 py-1 rounded-full flex-row items-center"
      style={{ backgroundColor: `${colors.warning}30` }}
    >
      <View
        className="w-2 h-2 rounded-full mr-1"
        style={{ backgroundColor: colors.warning }}
      />
      <Text className="text-xs font-medium" style={{ color: colors.warning }}>
        Offline
      </Text>
    </View>
  );
}
