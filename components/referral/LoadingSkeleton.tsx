/**
 * LoadingSkeleton Component
 * 
 * Loading state skeleton for the referral dashboard.
 */

import { View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "./constants";

export function LoadingSkeleton() {
  return (
    <View style={{ gap: 16 }}>
      {/* Header Skeleton */}
      <View
        style={{
          backgroundColor: COLORS.bgSurface,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <Skeleton width={200} height={20} style={{ marginRight: "auto" }} />
          <Skeleton variant="circle" width={40} height={40} />
        </View>
        <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={14} style={{ marginBottom: 20 }} />

        {/* Code box skeleton */}
        <View
          style={{
            backgroundColor: COLORS.bgDark,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <Skeleton width={120} height={11} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Skeleton width={150} height={28} style={{ marginRight: "auto" }} />
            <Skeleton width={60} height={32} borderRadius={6} />
          </View>
        </View>

        {/* Share buttons skeleton */}
        <View style={{ flexDirection: "row", marginTop: 16, gap: 8 }}>
          <Skeleton width={70} height={50} borderRadius={8} style={{ flex: 1 }} />
          <Skeleton width={70} height={50} borderRadius={8} style={{ flex: 1 }} />
          <Skeleton width={70} height={50} borderRadius={8} style={{ flex: 1 }} />
          <Skeleton width={70} height={50} borderRadius={8} style={{ flex: 1 }} />
        </View>
      </View>

      {/* Stats Skeleton */}
      <View
        style={{
          backgroundColor: COLORS.bgSurface,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <Skeleton width={140} height={16} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 8, padding: 12, alignItems: "center" }}>
            <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={11} />
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 8, padding: 12, alignItems: "center" }}>
            <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={11} />
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 8, padding: 12, alignItems: "center" }}>
            <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={11} />
          </View>
        </View>
      </View>
    </View>
  );
}
