import { memo } from "react";
import { View, Text } from "react-native";
import { SkeletonProtocolCard, Skeleton } from "@/components/ui/Skeleton";
import { useColors } from "@/hooks/use-colors";
import { spacing, radii } from "@/lib/design-tokens";

interface SearchLoadingSkeletonProps {
  /**
   * Number of skeleton cards to show
   * @default 3
   */
  count?: number;
  /**
   * Whether to show the results count skeleton
   * @default true
   */
  showResultsCount?: boolean;
  /**
   * Loading message to display
   */
  message?: string;
}

/**
 * Optimized loading skeleton for search results
 *
 * Features:
 * - Mimics actual search result cards
 * - Shows loading message for accessibility
 * - Smooth pulse animation
 * - Accessible to screen readers
 */
export const SearchLoadingSkeleton = memo(function SearchLoadingSkeleton({
  count = 3,
  showResultsCount = true,
  message = "Searching protocols...",
}: SearchLoadingSkeletonProps) {
  const colors = useColors();

  return (
    <View
      accessibilityRole="none"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      {/* Loading message */}
      <Text
        style={{
          fontSize: 14,
          color: colors.muted,
          marginBottom: spacing.md,
        }}
      >
        {message}
      </Text>

      {/* Results count skeleton */}
      {showResultsCount && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <Skeleton width={140} height={14} />
        </View>
      )}

      {/* Protocol card skeletons */}
      <View style={{ gap: spacing.md }}>
        {Array.from({ length: count }).map((_, index) => (
          <SearchResultCardSkeleton key={index} delay={index * 50} />
        ))}
      </View>
    </View>
  );
});

/**
 * Individual search result card skeleton
 * Matches the exact layout of the actual search result cards
 */
const SearchResultCardSkeleton = memo(function SearchResultCardSkeleton({
  delay = 0,
}: {
  delay?: number;
}) {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.border,
      }}
    >
      {/* Header row: Title and relevance badge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          {/* Protocol title */}
          <Skeleton
            width="85%"
            height={18}
            style={{ marginBottom: spacing.xs }}
          />
          {/* Protocol number */}
          <Skeleton width="40%" height={12} />
        </View>
        {/* Relevance badge */}
        <Skeleton width={60} height={24} borderRadius={radii.full} />
      </View>

      {/* Section indicator */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: spacing.sm,
        }}
      >
        <Skeleton variant="circle" width={14} height={14} />
        <Skeleton width={80} height={12} style={{ marginLeft: spacing.xs }} />
      </View>

      {/* Content preview (3 lines) */}
      <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
        <Skeleton width="100%" height={14} />
        <Skeleton width="95%" height={14} />
        <Skeleton width="70%" height={14} />
      </View>

      {/* Footer: Date badge and CTA */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Skeleton width={100} height={20} borderRadius={radii.full} />
        <Skeleton width={120} height={12} />
      </View>
    </View>
  );
});

/**
 * Compact search loading indicator
 * Use when space is limited or for inline loading states
 */
export const SearchLoadingIndicator = memo(function SearchLoadingIndicator() {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
      }}
      accessibilityRole="none"
      accessibilityLabel="Searching..."
    >
      <View style={{ marginRight: spacing.sm }}>
        <Skeleton variant="circle" width={20} height={20} />
      </View>
      <Skeleton width={120} height={14} />
    </View>
  );
});

/**
 * Empty search state with search suggestions skeleton
 */
export const SearchSuggestionsSkeleton = memo(
  function SearchSuggestionsSkeleton() {
    const colors = useColors();

    return (
      <View>
        {/* Example searches header */}
        <Skeleton width={140} height={14} style={{ marginBottom: spacing.md }} />

        {/* Search tags */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          {[80, 100, 90, 110, 70, 95, 85, 105].map((width, index) => (
            <Skeleton
              key={index}
              width={width}
              height={32}
              borderRadius={radii.full}
            />
          ))}
        </View>

        {/* Stats card skeleton */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
          }}
        >
          <Skeleton
            width={140}
            height={14}
            style={{ marginBottom: spacing.md }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Skeleton
                width={80}
                height={28}
                style={{ marginBottom: spacing.xs }}
              />
              <Skeleton width={100} height={12} />
            </View>
            <View>
              <Skeleton
                width={60}
                height={28}
                style={{ marginBottom: spacing.xs }}
              />
              <Skeleton width={80} height={12} />
            </View>
          </View>
        </View>
      </View>
    );
  }
);

export default SearchLoadingSkeleton;
