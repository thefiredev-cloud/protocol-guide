/**
 * RewardsInfo Component
 * 
 * Displays the referral rewards tier information.
 */

import { View, Text } from "react-native";
import { COLORS, TIER_COLORS } from "./constants";

export function RewardsInfo() {
  return (
    <View
      style={{
        backgroundColor: COLORS.bgSurface,
        borderRadius: 12,
        padding: 20,
      }}
    >
      <Text style={{ color: COLORS.textWhite, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
        Rewards
      </Text>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 10 }} />
          <Text style={{ color: COLORS.textMuted, fontSize: 14, flex: 1 }}>
            Each signup: <Text style={{ color: COLORS.textWhite, fontWeight: "600" }}>7 days Pro free</Text>
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TIER_COLORS.silver, marginRight: 10 }} />
          <Text style={{ color: COLORS.textMuted, fontSize: 14, flex: 1 }}>
            3 referrals: <Text style={{ color: COLORS.textWhite, fontWeight: "600" }}>+30 days bonus</Text>
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TIER_COLORS.gold, marginRight: 10 }} />
          <Text style={{ color: COLORS.textMuted, fontSize: 14, flex: 1 }}>
            5 referrals: <Text style={{ color: COLORS.textWhite, fontWeight: "600" }}>6 months Pro free</Text>
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TIER_COLORS.platinum, marginRight: 10 }} />
          <Text style={{ color: COLORS.textMuted, fontSize: 14, flex: 1 }}>
            10 referrals: <Text style={{ color: COLORS.textWhite, fontWeight: "600" }}>1 year Pro free</Text>
          </Text>
        </View>
      </View>

      <Text style={{ color: COLORS.textDim, fontSize: 12, marginTop: 12, fontStyle: "italic" }}>
        Your crew member also gets a 14-day Pro trial (vs 7-day standard).
      </Text>
    </View>
  );
}
