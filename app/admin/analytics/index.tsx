/**
 * Agency Analytics Dashboard
 * Professional analytics with charts, metrics, and export functionality
 */

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Types for our data
interface TimeSeriesData {
  date: string;
  count: number;
  avgTime?: number;
  noResults?: number;
}

interface ChartProps {
  data: TimeSeriesData[];
  height?: number;
  color: string;
  showLabels?: boolean;
  valueKey?: keyof TimeSeriesData;
}

// Simple bar chart component
function BarChart({ data, height = 120, color, showLabels = true, valueKey = "count" }: ChartProps) {
  const colors = useColors();
  const maxValue = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <View style={[styles.chartContainer, { height }]}>
      <View style={styles.chartBars}>
        {data.map((d, i) => {
          const value = Number(d[valueKey]) || 0;
          const barHeight = (value / maxValue) * (height - 30);
          // Show every 7th label for weekly granularity
          const showLabel = i % 7 === 0 || i === data.length - 1;

          return (
            <View key={d.date} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(barHeight, 2),
                    backgroundColor: color,
                    opacity: value > 0 ? 1 : 0.3,
                  },
                ]}
              />
              {showLabels && showLabel && (
                <Text style={[styles.barLabel, { color: colors.muted }]}>
                  {d.date.slice(5)} {/* MM-DD */}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Metric card with optional trend indicator
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor: string;
  trend?: { value: number; positive: boolean };
}

function MetricCard({ title, value, subtitle, icon, iconColor, trend }: MetricCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconWrapper, { backgroundColor: iconColor + "15" }]}>
          <IconSymbol name={icon as any} size={18} color={iconColor} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <IconSymbol
              name={trend.positive ? "arrow.up.right" : "arrow.down.right"}
              size={12}
              color={trend.positive ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend.positive ? colors.success : colors.error },
              ]}
            >
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricTitle, { color: colors.muted }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.metricSubtitle, { color: colors.muted }]}>{subtitle}</Text>
      )}
    </View>
  );
}

// Time period selector
type TimePeriod = 7 | 14 | 30 | 60 | 90;

export default function AnalyticsScreen() {
  const colors = useColors();
  const [period, setPeriod] = useState<TimePeriod>(30);
  const [activeTab, setActiveTab] = useState<"overview" | "protocols" | "users" | "errors">("overview");

  // Fetch agency data
  const { data: agencies } = trpc.agencyAdmin.myAgencies.useQuery();
  const agencyId = agencies?.[0]?.id;

  // Fetch analytics data
  const { data: searchData, isLoading: searchLoading } = trpc.agencyAdmin.getSearchAnalytics.useQuery(
    { agencyId: agencyId!, days: period },
    { enabled: !!agencyId }
  );

  const { data: protocolData, isLoading: protocolLoading } = trpc.agencyAdmin.getProtocolAnalytics.useQuery(
    { agencyId: agencyId!, days: period },
    { enabled: !!agencyId }
  );

  const { data: userData, isLoading: userLoading } = trpc.agencyAdmin.getUserAnalytics.useQuery(
    { agencyId: agencyId!, days: period },
    { enabled: !!agencyId }
  );

  const { data: errorData, isLoading: errorLoading } = trpc.agencyAdmin.getErrorAnalytics.useQuery(
    { agencyId: agencyId!, days: period },
    { enabled: !!agencyId }
  );

  const isLoading = searchLoading || protocolLoading || userLoading || errorLoading;

  // Export handler
  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      period: `Last ${period} days`,
      agency: agencies?.[0]?.name,
      search: searchData,
      protocols: protocolData,
      users: userData,
      errors: errorData,
    };

    // In a web context, this would download a JSON file
    // For React Native, we'd use Share or file system
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periods: { label: string; value: TimePeriod }[] = [
    { label: "7D", value: 7 },
    { label: "14D", value: 14 },
    { label: "30D", value: 30 },
    { label: "60D", value: 60 },
    { label: "90D", value: 90 },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: "chart.bar.fill" },
    { id: "protocols", label: "Protocols", icon: "doc.text.fill" },
    { id: "users", label: "Users", icon: "person.2.fill" },
    { id: "errors", label: "Errors", icon: "exclamationmark.triangle.fill" },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {agencies?.[0]?.name || "Loading..."}
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

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.periodButton,
              {
                backgroundColor: period === p.value ? colors.primary : colors.card,
                borderColor: period === p.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setPeriod(p.value)}
          >
            <Text
              style={[
                styles.periodButtonText,
                { color: period === p.value ? "#FFFFFF" : colors.foreground },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <IconSymbol
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.id ? colors.primary : colors.muted },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading analytics...</Text>
          </View>
        ) : activeTab === "overview" ? (
          <OverviewTab
            searchData={searchData}
            protocolData={protocolData}
            userData={userData}
            colors={colors}
            period={period}
          />
        ) : activeTab === "protocols" ? (
          <ProtocolsTab protocolData={protocolData} colors={colors} />
        ) : activeTab === "users" ? (
          <UsersTab userData={userData} colors={colors} />
        ) : (
          <ErrorsTab errorData={errorData} colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}

// Overview Tab
function OverviewTab({
  searchData,
  protocolData,
  userData,
  colors,
  period,
}: {
  searchData: any;
  protocolData: any;
  userData: any;
  colors: ReturnType<typeof useColors>;
  period: number;
}) {
  return (
    <>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Searches"
          value={searchData?.summary?.totalSearches?.toLocaleString() || 0}
          subtitle={`Last ${period} days`}
          icon="magnifyingglass"
          iconColor={colors.primary}
        />
        <MetricCard
          title="Active Users"
          value={userData?.activeMembers || 0}
          subtitle={`of ${userData?.totalMembers || 0} members`}
          icon="person.fill"
          iconColor={colors.success}
        />
        <MetricCard
          title="Protocols"
          value={protocolData?.totalProtocols || 0}
          subtitle={`${protocolData?.statusCounts?.published || 0} published`}
          icon="doc.text.fill"
          iconColor={colors.warning}
        />
        <MetricCard
          title="No Results Rate"
          value={`${searchData?.summary?.noResultsRate || 0}%`}
          subtitle="Search failure rate"
          icon="xmark.circle.fill"
          iconColor={colors.error}
        />
      </View>

      {/* Search Trend Chart */}
      <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Search Volume</Text>
          <Text style={[styles.chartSubtitle, { color: colors.muted }]}>
            Avg: {searchData?.summary?.avgSearchesPerDay || 0}/day
          </Text>
        </View>
        {searchData?.timeSeries && (
          <BarChart data={searchData.timeSeries} color={colors.primary} height={140} />
        )}
      </View>

      {/* Top Searches */}
      <View style={[styles.listSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Search Queries</Text>
        {searchData?.topQueries?.length > 0 ? (
          searchData.topQueries.slice(0, 8).map((q: any, i: number) => (
            <View
              key={i}
              style={[styles.listItem, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.listRank, { color: colors.muted }]}>{i + 1}</Text>
              <Text style={[styles.listText, { color: colors.foreground }]} numberOfLines={1}>
                {q.query}
              </Text>
              <Text style={[styles.listValue, { color: colors.primary }]}>{q.count}</Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>No search data available</Text>
        )}
      </View>

      {/* DAU Trend */}
      {userData?.dauTrend && userData.dauTrend.some((d: any) => d.count > 0) && (
        <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>Daily Active Users</Text>
          </View>
          <BarChart data={userData.dauTrend} color={colors.success} height={100} />
        </View>
      )}
    </>
  );
}

// Protocols Tab
function ProtocolsTab({ protocolData, colors }: { protocolData: any; colors: ReturnType<typeof useColors> }) {
  if (!protocolData) return null;

  const statusColors: Record<string, string> = {
    published: colors.success,
    approved: colors.primary,
    review: colors.warning,
    draft: colors.muted,
    archived: "#6B7280",
  };

  return (
    <>
      {/* Protocol Status Distribution */}
      <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Protocol Status</Text>
        <View style={styles.statusGrid}>
          {Object.entries(protocolData.statusCounts || {}).map(([status, count]) => (
            <View key={status} style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: statusColors[status] || colors.muted }]} />
              <Text style={[styles.statusLabel, { color: colors.foreground }]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
              <Text style={[styles.statusValue, { color: colors.muted }]}>{String(count)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Freshness Metrics */}
      <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Protocol Freshness</Text>
        <View style={styles.freshnessGrid}>
          <View style={styles.freshnessItem}>
            <Text style={[styles.freshnessValue, { color: colors.success }]}>
              {protocolData.freshness?.updatedLastMonth || 0}
            </Text>
            <Text style={[styles.freshnessLabel, { color: colors.muted }]}>Updated &lt;30d</Text>
          </View>
          <View style={styles.freshnessItem}>
            <Text style={[styles.freshnessValue, { color: colors.primary }]}>
              {protocolData.freshness?.updatedLast3Months || 0}
            </Text>
            <Text style={[styles.freshnessLabel, { color: colors.muted }]}>Updated &lt;90d</Text>
          </View>
          <View style={styles.freshnessItem}>
            <Text style={[styles.freshnessValue, { color: colors.warning }]}>
              {protocolData.freshness?.updatedLast6Months || 0}
            </Text>
            <Text style={[styles.freshnessLabel, { color: colors.muted }]}>Updated &lt;180d</Text>
          </View>
          <View style={styles.freshnessItem}>
            <Text style={[styles.freshnessValue, { color: colors.error }]}>
              {protocolData.freshness?.staleOver1Year || 0}
            </Text>
            <Text style={[styles.freshnessLabel, { color: colors.muted }]}>Stale &gt;1yr</Text>
          </View>
        </View>
      </View>

      {/* Stale Protocol Alerts */}
      {protocolData.staleProtocols?.length > 0 && (
        <View style={[styles.alertSection, { backgroundColor: colors.error + "10", borderColor: colors.error + "30" }]}>
          <View style={styles.alertHeader}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.error} />
            <Text style={[styles.alertTitle, { color: colors.error }]}>Stale Protocols Alert</Text>
          </View>
          <Text style={[styles.alertDescription, { color: colors.foreground }]}>
            The following protocols haven&apos;t been updated in over a year:
          </Text>
          {protocolData.staleProtocols.slice(0, 5).map((p: any) => (
            <View key={p.id} style={[styles.alertItem, { borderTopColor: colors.error + "20" }]}>
              <Text style={[styles.alertProtocol, { color: colors.foreground }]}>
                {p.protocolNumber}: {p.title}
              </Text>
              <Text style={[styles.alertDays, { color: colors.muted }]}>
                {p.daysSinceUpdate} days ago
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Most Viewed Protocols */}
      {protocolData.mostViewed?.length > 0 && (
        <View style={[styles.listSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Most Viewed Protocols</Text>
          {protocolData.mostViewed.slice(0, 10).map((p: any, i: number) => (
            <View key={i} style={[styles.listItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.listRank, { color: colors.muted }]}>{i + 1}</Text>
              <Text style={[styles.listText, { color: colors.foreground }]} numberOfLines={1}>
                {p.protocolNumber}
              </Text>
              <Text style={[styles.listValue, { color: colors.primary }]}>{p.views} views</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

// Users Tab
function UsersTab({ userData, colors }: { userData: any; colors: ReturnType<typeof useColors> }) {
  if (!userData) return null;

  return (
    <>
      {/* User Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Members"
          value={userData.totalMembers || 0}
          icon="person.2.fill"
          iconColor={colors.primary}
        />
        <MetricCard
          title="Active Members"
          value={userData.activeMembers || 0}
          subtitle={`${Math.round((userData.activeMembers / (userData.totalMembers || 1)) * 100)}% active`}
          icon="person.fill.checkmark"
          iconColor={colors.success}
        />
        <MetricCard
          title="Total Searches"
          value={userData.totalSearches?.toLocaleString() || 0}
          icon="magnifyingglass"
          iconColor={colors.warning}
        />
        <MetricCard
          title="Avg Searches/User"
          value={userData.avgSearchesPerUser || 0}
          icon="chart.bar.fill"
          iconColor={colors.primary}
        />
      </View>

      {/* Role Distribution */}
      <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Members by Role</Text>
        <View style={styles.roleGrid}>
          {Object.entries(userData.byRole || {}).map(([role, count]) => (
            <View key={role} style={styles.roleItem}>
              <Text style={[styles.roleValue, { color: colors.foreground }]}>{String(count)}</Text>
              <Text style={[styles.roleLabel, { color: colors.muted }]}>
                {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* User Activity Table */}
      <View style={[styles.tableSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>User Activity</Text>
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.tableHeaderCell, styles.tableCellName, { color: colors.muted }]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellRole, { color: colors.muted }]}>Role</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellSearches, { color: colors.muted }]}>Searches</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellLast, { color: colors.muted }]}>Last Active</Text>
        </View>
        {userData.users?.slice(0, 15).map((user: any) => (
          <View key={user.id} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.tableCellName]}>
              <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                {user.name || "Unnamed"}
              </Text>
              <Text style={[styles.userEmail, { color: colors.muted }]} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
            <Text style={[styles.tableCell, styles.tableCellRole, { color: colors.foreground }]}>
              {user.role?.replace("_", " ")}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellSearches, { color: colors.primary }]}>
              {user.searches}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellLast, { color: colors.muted }]}>
              {user.lastActive
                ? new Date(user.lastActive).toLocaleDateString()
                : "Never"}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

// Errors Tab
function ErrorsTab({ errorData, colors }: { errorData: any; colors: ReturnType<typeof useColors> }) {
  if (!errorData) return null;

  return (
    <>
      {/* Error Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Reports"
          value={errorData.summary?.total || 0}
          icon="exclamationmark.bubble.fill"
          iconColor={colors.warning}
        />
        <MetricCard
          title="Errors"
          value={errorData.summary?.errors || 0}
          icon="xmark.octagon.fill"
          iconColor={colors.error}
        />
        <MetricCard
          title="Suggestions"
          value={errorData.summary?.suggestions || 0}
          icon="lightbulb.fill"
          iconColor={colors.primary}
        />
        <MetricCard
          title="Resolution Rate"
          value={`${errorData.summary?.resolutionRate || 0}%`}
          icon="checkmark.circle.fill"
          iconColor={colors.success}
        />
      </View>

      {/* Feedback Trend */}
      {errorData.trend && (
        <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Feedback Volume</Text>
          <BarChart data={errorData.trend} color={colors.warning} height={100} />
        </View>
      )}

      {/* Recent Feedback */}
      <View style={[styles.listSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Feedback</Text>
        {errorData.recentFeedback?.length > 0 ? (
          errorData.recentFeedback.map((f: any) => (
            <View key={f.id} style={[styles.feedbackItem, { borderBottomColor: colors.border }]}>
              <View style={styles.feedbackHeader}>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        f.category === "error" ? colors.error + "20" : colors.primary + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: f.category === "error" ? colors.error : colors.primary },
                    ]}
                  >
                    {f.category}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        f.status === "resolved" ? colors.success + "20" : colors.warning + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: f.status === "resolved" ? colors.success : colors.warning },
                    ]}
                  >
                    {f.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.feedbackSubject, { color: colors.foreground }]}>{f.subject}</Text>
              <Text style={[styles.feedbackDate, { color: colors.muted }]}>
                {new Date(f.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>No feedback reports</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: "48.5%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  metricSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  chartSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  chartSubtitle: {
    fontSize: 12,
  },
  chartContainer: {
    width: "100%",
    overflow: "hidden",
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
    gap: 2,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "80%",
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 8,
    marginTop: 4,
    transform: [{ rotate: "-45deg" }],
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  listSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  listRank: {
    width: 24,
    fontSize: 12,
    fontWeight: "600",
  },
  listText: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  listValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 20,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 100,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 13,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  freshnessGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  freshnessItem: {
    alignItems: "center",
  },
  freshnessValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  freshnessLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  alertSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  alertDescription: {
    fontSize: 13,
    marginBottom: 12,
  },
  alertItem: {
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 8,
  },
  alertProtocol: {
    fontSize: 13,
    fontWeight: "500",
  },
  alertDays: {
    fontSize: 12,
    marginTop: 2,
  },
  roleGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roleItem: {
    alignItems: "center",
    padding: 12,
  },
  roleValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  roleLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  tableSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 13,
  },
  tableCellName: {
    flex: 2,
  },
  tableCellRole: {
    flex: 1,
    textAlign: "center",
  },
  tableCellSearches: {
    width: 60,
    textAlign: "center",
  },
  tableCellLast: {
    flex: 1,
    textAlign: "right",
  },
  userName: {
    fontSize: 13,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  feedbackItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  feedbackHeader: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  feedbackSubject: {
    fontSize: 14,
    marginBottom: 4,
  },
  feedbackDate: {
    fontSize: 11,
  },
});
