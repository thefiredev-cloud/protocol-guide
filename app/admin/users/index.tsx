/**
 * Enterprise User Management Screen
 * View and manage all users across the agency
 * 
 * Features:
 * - User list with activity metrics
 * - Filter by role, status, activity level
 * - Usage statistics per user
 * - Export user data
 */

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useMemo } from "react";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { IconSymbol } from "@/components/ui/icon-symbol";

type FilterRole = "all" | "owner" | "admin" | "protocol_author" | "member";
type FilterStatus = "all" | "active" | "pending" | "suspended";
type SortBy = "name" | "searches" | "lastActive" | "joinedAt";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  protocol_author: "Protocol Author",
  member: "Member",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "#9333EA",
  admin: "#2563EB",
  protocol_author: "#059669",
  member: "#6B7280",
};

export default function UserManagementScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("searches");
  const [sortAsc, setSortAsc] = useState(false);

  // Fetch agency data
  const { data: agencies } = trpc.agencyAdmin.myAgencies.useQuery();
  const agencyId = agencies?.[0]?.id;
  const agency = agencies?.[0];

  // Fetch user analytics
  const { data: userData, isLoading } = trpc.agencyAdmin.getUserAnalytics.useQuery(
    { agencyId: agencyId!, days: 30 },
    { enabled: !!agencyId }
  );

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!userData?.users) return [];

    let users = [...userData.users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      users = users.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      users = users.filter((u) => u.status === statusFilter);
    }

    // Sort
    users.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "searches":
          comparison = (b.searches || 0) - (a.searches || 0);
          break;
        case "lastActive":
          const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          comparison = dateB - dateA;
          break;
        case "joinedAt":
          const joinA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
          const joinB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
          comparison = joinB - joinA;
          break;
      }
      return sortAsc ? -comparison : comparison;
    });

    return users;
  }, [userData?.users, searchQuery, roleFilter, statusFilter, sortBy, sortAsc]);

  // Export handler
  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      agency: agency?.name,
      totalUsers: userData?.totalMembers,
      activeUsers: userData?.activeMembers,
      users: filteredUsers.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        searches: u.searches,
        lastActive: u.lastActive,
        joinedAt: u.joinedAt,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActivityLevel = (searches: number) => {
    if (searches >= 50) return { label: "High", color: colors.success };
    if (searches >= 10) return { label: "Medium", color: colors.warning };
    if (searches > 0) return { label: "Low", color: colors.primary };
    return { label: "Inactive", color: colors.muted };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Check if enterprise tier
  const isEnterprise = agency?.subscriptionTier === "enterprise";

  if (!isEnterprise) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <View style={[styles.upgradeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.upgradeIcon, { backgroundColor: colors.primary + "15" }]}>
            <IconSymbol name="lock.fill" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.upgradeTitle, { color: colors.foreground }]}>Enterprise Feature</Text>
          <Text style={[styles.upgradeDescription, { color: colors.muted }]}>
            User management with detailed activity tracking is available on the Enterprise plan.
            Upgrade to get full visibility into how your team uses Protocol Guide.
          </Text>
          <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.upgradeButtonText}>Learn About Enterprise</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>User Management</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {userData?.totalMembers || 0} members • {userData?.activeMembers || 0} active
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={handleExport}
        >
          <IconSymbol name="arrow.down.doc.fill" size={16} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {userData?.totalSearches?.toLocaleString() || 0}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Total Searches</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {userData?.avgSearchesPerUser || 0}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Avg per User</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            {Math.round(((userData?.activeMembers || 0) / (userData?.totalMembers || 1)) * 100)}%
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Engagement</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search users..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters Row */}
        <View style={styles.filterRow}>
          {/* Role Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.muted }]}>Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {(["all", "owner", "admin", "protocol_author", "member"] as FilterRole[]).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: roleFilter === role ? colors.primary : colors.card,
                        borderColor: roleFilter === role ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setRoleFilter(role)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: roleFilter === role ? "#FFFFFF" : colors.foreground },
                      ]}
                    >
                      {role === "all" ? "All" : ROLE_LABELS[role] || role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.muted }]}>Status</Text>
            <View style={styles.filterChips}>
              {(["all", "active", "pending", "suspended"] as FilterStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: statusFilter === status ? colors.success : colors.card,
                      borderColor: statusFilter === status ? colors.success : colors.border,
                    },
                  ]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: statusFilter === status ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* User Table */}
      <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Table Header */}
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tableHeaderCell, styles.cellUser]}
            onPress={() => {
              if (sortBy === "name") setSortAsc(!sortAsc);
              else {
                setSortBy("name");
                setSortAsc(false);
              }
            }}
          >
            <Text style={[styles.headerText, { color: colors.muted }]}>User</Text>
            {sortBy === "name" && (
              <IconSymbol
                name={sortAsc ? "chevron.up" : "chevron.down"}
                size={10}
                color={colors.muted}
              />
            )}
          </TouchableOpacity>
          <Text style={[styles.tableHeaderCell, styles.cellRole, styles.headerText, { color: colors.muted }]}>
            Role
          </Text>
          <TouchableOpacity
            style={[styles.tableHeaderCell, styles.cellSearches]}
            onPress={() => {
              if (sortBy === "searches") setSortAsc(!sortAsc);
              else {
                setSortBy("searches");
                setSortAsc(false);
              }
            }}
          >
            <Text style={[styles.headerText, { color: colors.muted }]}>Searches</Text>
            {sortBy === "searches" && (
              <IconSymbol
                name={sortAsc ? "chevron.up" : "chevron.down"}
                size={10}
                color={colors.muted}
              />
            )}
          </TouchableOpacity>
          <Text style={[styles.tableHeaderCell, styles.cellActivity, styles.headerText, { color: colors.muted }]}>
            Activity
          </Text>
          <TouchableOpacity
            style={[styles.tableHeaderCell, styles.cellLast]}
            onPress={() => {
              if (sortBy === "lastActive") setSortAsc(!sortAsc);
              else {
                setSortBy("lastActive");
                setSortAsc(false);
              }
            }}
          >
            <Text style={[styles.headerText, { color: colors.muted }]}>Last Active</Text>
            {sortBy === "lastActive" && (
              <IconSymbol
                name={sortAsc ? "chevron.up" : "chevron.down"}
                size={10}
                color={colors.muted}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Table Body */}
        <ScrollView style={styles.tableBody}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>Loading users...</Text>
            </View>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const activity = getActivityLevel(user.searches);
              return (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.tableRow, { borderBottomColor: colors.border }]}
                >
                  {/* User Info */}
                  <View style={[styles.tableCell, styles.cellUser]}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                        {user.name || "Unnamed User"}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.muted }]} numberOfLines={1}>
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  {/* Role */}
                  <View style={[styles.tableCell, styles.cellRole]}>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: (ROLE_COLORS[user.role || "member"] || colors.muted) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          { color: ROLE_COLORS[user.role || "member"] || colors.muted },
                        ]}
                      >
                        {ROLE_LABELS[user.role || "member"] || user.role}
                      </Text>
                    </View>
                  </View>

                  {/* Searches */}
                  <View style={[styles.tableCell, styles.cellSearches]}>
                    <Text style={[styles.searchCount, { color: colors.primary }]}>
                      {user.searches.toLocaleString()}
                    </Text>
                  </View>

                  {/* Activity Level */}
                  <View style={[styles.tableCell, styles.cellActivity]}>
                    <View style={[styles.activityBadge, { backgroundColor: activity.color + "20" }]}>
                      <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
                      <Text style={[styles.activityText, { color: activity.color }]}>
                        {activity.label}
                      </Text>
                    </View>
                  </View>

                  {/* Last Active */}
                  <View style={[styles.tableCell, styles.cellLast]}>
                    <Text style={[styles.lastActive, { color: colors.foreground }]}>
                      {formatDate(user.lastActive)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="person.slash.fill" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Users Found</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No users match the selected filters"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          Showing {filteredUsers.length} of {userData?.totalMembers || 0} users
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: "row",
    gap: 24,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableHeaderCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableCell: {
    flexDirection: "row",
    alignItems: "center",
  },
  cellUser: {
    flex: 2.5,
    gap: 12,
  },
  cellRole: {
    flex: 1.2,
    justifyContent: "center",
  },
  cellSearches: {
    flex: 0.8,
    justifyContent: "center",
  },
  cellActivity: {
    flex: 1,
    justifyContent: "center",
  },
  cellLast: {
    flex: 1,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  searchCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  activityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  lastActive: {
    fontSize: 13,
    textAlign: "right",
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
  upgradeCard: {
    width: "80%",
    maxWidth: 400,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  upgradeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  upgradeDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
