import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { CachedProtocol, formatCacheTime } from "@/lib/offline-cache";
import { IconSymbol } from "./ui/icon-symbol";

type CachedProtocolsListProps = {
  protocols: CachedProtocol[];
  onSelect: (query: string, response: string, protocolRefs?: string[]) => void;
  isOffline?: boolean;
};

/**
 * Displays a list of cached protocols for quick access
 * Especially useful when offline in the field
 */
export function CachedProtocolsList({ protocols, onSelect, isOffline }: CachedProtocolsListProps) {
  const colors = useColors();

  if (protocols.length === 0) {
    return null;
  }

  return (
    <View className="mt-4">
      <View className="flex-row items-center mb-3">
        <IconSymbol name="arrow.down.circle.fill" size={18} color={colors.primary} />
        <Text className="text-sm font-semibold text-foreground ml-2">
          {isOffline ? "Available Offline" : "Recently Viewed"}
        </Text>
        {isOffline && (
          <View
            className="ml-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${colors.warning}20` }}
          >
            <Text className="text-xs" style={{ color: colors.warning }}>
              Cached
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {protocols.map((protocol) => (
          <CachedProtocolCard
            key={protocol.id}
            protocol={protocol}
            onPress={() => onSelect(protocol.query, protocol.response, protocol.protocolRefs)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type CachedProtocolCardProps = {
  protocol: CachedProtocol;
  onPress: () => void;
};

function CachedProtocolCard({ protocol, onPress }: CachedProtocolCardProps) {
  const colors = useColors();

  // Extract protocol title from response if available
  const protocolMatch = protocol.response.match(/^PROTOCOL:\s*(.+?)(?:\n|$)/im);
  const protocolTitle = protocolMatch ? protocolMatch[1].trim() : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mr-3 p-3 rounded-xl border"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        width: 200,
      }}
    >
      {/* Query */}
      <Text
        className="text-sm font-medium text-foreground mb-1"
        numberOfLines={1}
      >
        {protocol.query}
      </Text>

      {/* Protocol Title */}
      {protocolTitle && (
        <Text
          className="text-xs mb-2"
          style={{ color: colors.primary }}
          numberOfLines={1}
        >
          {protocolTitle}
        </Text>
      )}

      {/* County and Time */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted" numberOfLines={1}>
          {protocol.countyName}
        </Text>
        <Text className="text-xs text-muted">
          {formatCacheTime(protocol.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Full-page cached protocols view for the profile/settings
 */
type CachedProtocolsFullListProps = {
  protocols: CachedProtocol[];
  onSelect: (protocol: CachedProtocol) => void;
  onDelete: (id: string) => void;
};

export function CachedProtocolsFullList({ 
  protocols, 
  onSelect, 
  onDelete 
}: CachedProtocolsFullListProps) {
  const colors = useColors();

  if (protocols.length === 0) {
    return (
      <View className="items-center justify-center py-8">
        <IconSymbol name="arrow.down.circle.fill" size={40} color={colors.muted} />
        <Text className="text-muted mt-3 text-center">
          No cached protocols yet.{"\n"}
          Search for protocols to save them offline.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {protocols.map((protocol) => (
        <TouchableOpacity
          key={protocol.id}
          onPress={() => onSelect(protocol)}
          activeOpacity={0.7}
          className="p-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-base font-medium text-foreground mb-1">
                {protocol.query}
              </Text>
              <Text className="text-sm text-muted" numberOfLines={2}>
                {protocol.response.slice(0, 100)}...
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-xs text-muted">
                  {protocol.countyName}
                </Text>
                <Text className="text-xs text-muted mx-2">•</Text>
                <Text className="text-xs text-muted">
                  {formatCacheTime(protocol.timestamp)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => onDelete(protocol.id)}
              className="p-2"
              activeOpacity={0.7}
            >
              <IconSymbol name="xmark" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
