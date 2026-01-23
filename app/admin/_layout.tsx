/**
 * Agency Admin Layout
 * Provides sidebar navigation and agency context for admin screens
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "house.fill", path: "/admin" },
  { label: "Protocols", icon: "doc.text.fill", path: "/admin/protocols" },
  { label: "Team", icon: "person.2.fill", path: "/admin/team" },
  { label: "Settings", icon: "gearshape.fill", path: "/admin/settings" },
  { label: "Analytics", icon: "chart.bar.fill", path: "/admin/analytics" },
];

export default function AdminLayout() {
  const colors = useColors();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);

  // Fetch user's agencies
  const { data: agencies, isLoading: agenciesLoading } = trpc.agencyAdmin.myAgencies.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Select first agency by default
  useEffect(() => {
    if (agencies && agencies.length > 0 && !selectedAgencyId) {
      setSelectedAgencyId(agencies[0].id);
    }
  }, [agencies, selectedAgencyId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(tabs)/profile");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || agenciesLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!agencies || agencies.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <IconSymbol name="building.2" size={64} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Agency Access</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            You don't have admin access to any agencies. Contact your agency administrator.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.backButtonText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const selectedAgency = agencies.find((a) => a.id === selectedAgencyId) || agencies[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Agency Selector */}
        <View style={[styles.agencySelector, { borderBottomColor: colors.border }]}>
          <Text style={[styles.agencyLabel, { color: colors.muted }]}>Agency</Text>
          <TouchableOpacity style={[styles.agencyButton, { backgroundColor: colors.background }]}>
            <Text style={[styles.agencyName, { color: colors.foreground }]} numberOfLines={1}>
              {selectedAgency.name}
            </Text>
            <IconSymbol name="chevron.down" size={12} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <ScrollView style={styles.navList}>
          {navItems.map((item) => {
            const isActive = pathname === item.path ||
              (item.path !== "/admin" && pathname.startsWith(item.path));

            return (
              <TouchableOpacity
                key={item.path}
                style={[
                  styles.navItem,
                  isActive && { backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => router.push(item.path as any)}
              >
                <IconSymbol
                  name={item.icon as any}
                  size={20}
                  color={isActive ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: isActive ? colors.primary : colors.foreground },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Back to App */}
        <TouchableOpacity
          style={[styles.backLink, { borderTopColor: colors.border }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <IconSymbol name="arrow.left" size={16} color={colors.muted} />
          <Text style={[styles.backLinkText, { color: colors.muted }]}>Back to App</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 240,
    borderRightWidth: 1,
  },
  agencySelector: {
    padding: 16,
    borderBottomWidth: 1,
  },
  agencyLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  agencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
  },
  agencyName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  navList: {
    flex: 1,
    padding: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 12,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
  },
  backLinkText: {
    fontSize: 13,
    marginLeft: 8,
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
