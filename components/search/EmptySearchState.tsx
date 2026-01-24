import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { RecentSearches } from "@/components/recent-searches";

interface EmptySearchStateProps {
  onSelectSearch: (text: string) => void;
}

export function EmptySearchState({ onSelectSearch }: EmptySearchStateProps) {
  const colors = useColors();

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center px-6">
        <IconSymbol name="magnifyingglass" size={40} color={colors.muted} />
        <Text className="text-lg font-semibold text-foreground mt-3">
          Quick Protocol Search
        </Text>
        <Text className="text-sm text-muted text-center mt-1">
          Type or tap the mic to speak
        </Text>
        <View className="mt-4 gap-1">
          <Text className="text-xs text-muted text-center italic">
            {'"cardiac arrest adult"'}
          </Text>
          <Text className="text-xs text-muted text-center italic">
            {'"pediatric seizure"'}
          </Text>
          <Text className="text-xs text-muted text-center italic">
            {'"vtach amiodarone dose"'}
          </Text>
        </View>
      </View>
      <RecentSearches onSelectSearch={onSelectSearch} />
    </View>
  );
}
