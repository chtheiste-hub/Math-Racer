import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated as RNAnimated,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useWebSlideTransition } from "@/lib/web-slide";
import { fontScale, scale, maxContentWidth } from "@/lib/responsive";
import {
  getStats,
  getSessions,
  getWeakTables,
  clearAllData,
  type AllTimeStats,
  type SessionRecord,
  type PracticeType,
} from "@/lib/stats-storage";
import { useTranslation } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const PRACTICE_FILTERS: { value: PracticeType | "all"; label: string }[] = [
  { value: "all", label: "" },
  { value: "multiplication", label: "\u00D7" },
  { value: "division", label: "\u00F7" },
  { value: "addition", label: "+" },
  { value: "subtraction", label: "\u2212" },
];

const OPERATOR_LABELS: Record<PracticeType, string> = {
  multiplication: "\u00D7",
  division: "\u00F7",
  addition: "+",
  subtraction: "\u2212",
};

function TrendIcon({ trend }: { trend: "improving" | "declining" | "stable" }) {
  if (trend === "improving")
    return <Ionicons name="trending-up" size={14} color={Colors.success} />;
  if (trend === "declining")
    return <Ionicons name="trending-down" size={14} color={Colors.error} />;
  return <Ionicons name="remove" size={14} color={Colors.textMuted} />;
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const step = width / (data.length - 1);

  return (
    <View style={{ width, height, flexDirection: "row", alignItems: "flex-end" }}>
      {data.map((val, i) => {
        const barHeight = Math.max(2, ((val - min) / range) * height);
        const isLast = i === data.length - 1;
        return (
          <View
            key={i}
            style={{
              width: Math.max(3, step - 2),
              height: barHeight,
              backgroundColor: isLast ? Colors.accent : Colors.surfaceLight,
              borderRadius: 1.5,
              marginRight: i < data.length - 1 ? 2 : 0,
            }}
          />
        );
      })}
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { slideStyle, animateOut } = useWebSlideTransition();
  const { strings, language } = useTranslation();
  const [statsByType, setStatsByType] = useState<Record<string, AllTimeStats>>({});
  const [allSessions, setAllSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tables" | "history">("tables");
  const [practiceFilter, setPracticeFilter] = useState<PracticeType | "all">("all");

  const ADDITION_CATEGORY_NAMES: Record<number, string> = {
    1: strings.addCat1Title,
    2: strings.addCat2Title,
    3: strings.addCat3Title,
    4: strings.addCat4Title,
    5: strings.addCat5Title,
  };

  const SUBTRACTION_CATEGORY_NAMES: Record<number, string> = {
    1: strings.subCat1Title,
    2: strings.subCat2Title,
    3: strings.subCat3Title,
    4: strings.subCat4Title,
    5: strings.subCat5Title,
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    const [multStats, divStats, addStats, subStats, sess] = await Promise.all([
      getStats("multiplication"),
      getStats("division"),
      getStats("addition"),
      getStats("subtraction"),
      getSessions(),
    ]);
    setStatsByType({ multiplication: multStats, division: divStats, addition: addStats, subtraction: subStats });
    setAllSessions(sess);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const currentStats: AllTimeStats | null = (() => {
    if (practiceFilter === "all") {
      const combined: AllTimeStats = { tables: {}, totalSessions: 0, totalQuestions: 0, totalCorrect: 0 };
      for (const s of Object.values(statsByType)) {
        combined.totalSessions += s.totalSessions;
        combined.totalQuestions += s.totalQuestions;
        combined.totalCorrect += s.totalCorrect;
        for (const [tStr, td] of Object.entries(s.tables)) {
          const t = parseInt(tStr, 10);
          if (!combined.tables[t]) {
            combined.tables[t] = { table: t, totalAttempts: 0, totalCorrect: 0, recentSessions: [] };
          }
          combined.tables[t].totalAttempts += td.totalAttempts;
          combined.tables[t].totalCorrect += td.totalCorrect;
          combined.tables[t].recentSessions = [
            ...combined.tables[t].recentSessions,
            ...td.recentSessions,
          ].sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
        }
      }
      return combined;
    }
    return statsByType[practiceFilter] || null;
  })();

  const filteredSessions = practiceFilter === "all"
    ? allSessions
    : allSessions.filter((s) => s.practiceType === practiceFilter);

  const weakTables = currentStats ? getWeakTables(currentStats) : [];
  const overallAccuracy =
    currentStats && currentStats.totalQuestions > 0
      ? Math.round((currentStats.totalCorrect / currentStats.totalQuestions) * 100)
      : 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return strings.justNow;
    if (diffMins < 60) return t(strings, "minutesAgo", { count: diffMins });
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return t(strings, "hoursAgo", { count: diffHrs });
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return t(strings, "daysAgo", { count: diffDays });
    const locale = language === "no" ? "nb-NO" : "en-US";
    return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleClearData = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await clearAllData();
    setStatsByType({});
    setAllSessions([]);
    await loadData();
  };

  const tableOperator = practiceFilter === "all" ? "" : ` ${OPERATOR_LABELS[practiceFilter]}`;

  if (loading) {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const hasData = currentStats && currentStats.totalSessions > 0;

  return (
    <RNAnimated.View style={[styles.screen, slideStyle]}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundLight, Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Pressable
          onPress={async () => { await animateOut(); router.back(); }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>{strings.statistics}</Text>
        {(allSessions.length > 0) ? (
          <Pressable onPress={handleClearData} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles.filterRow}>
        {PRACTICE_FILTERS.map((f) => {
          const isActive = practiceFilter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => {
                setPracticeFilter(f.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {f.value === "all" ? strings.all : f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || webBottomInset) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!hasData ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="chart-line"
              size={48}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyTitle}>{strings.noDataYet}</Text>
            <Text style={styles.emptySubtext}>
              {practiceFilter === "all" ? strings.emptySubtext : strings.emptySubtextFiltered}
            </Text>
            <Pressable
              onPress={() => router.replace("/")}
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.emptyButtonText}>{strings.startPracticing}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.overviewCards}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewValue}>{currentStats!.totalSessions}</Text>
                <Text style={styles.overviewLabel}>{strings.sessions}</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewValue}>{currentStats!.totalQuestions}</Text>
                <Text style={styles.overviewLabel}>{strings.questions}</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={[styles.overviewValue, { color: overallAccuracy >= 80 ? Colors.success : overallAccuracy >= 50 ? Colors.accent : Colors.error }]}>
                  {overallAccuracy}%
                </Text>
                <Text style={styles.overviewLabel}>{strings.accuracy}</Text>
              </View>
            </Animated.View>

            <View style={styles.tabToggle}>
              <Pressable
                onPress={() => {
                  setActiveTab("tables");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.tabButton,
                  activeTab === "tables" && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "tables" && styles.tabButtonTextActive,
                  ]}
                >
                  {practiceFilter === "addition" || practiceFilter === "subtraction" ? strings.categories : strings.tables}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setActiveTab("history");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.tabButton,
                  activeTab === "history" && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "history" && styles.tabButtonTextActive,
                  ]}
                >
                  {strings.history}
                </Text>
              </Pressable>
            </View>

            {activeTab === "tables" && (
              <Animated.View entering={FadeInDown.delay(150)} style={styles.tablesSection}>
                {weakTables.map((item) => {
                  const tableData = currentStats!.tables[item.table];
                  const sparkData = tableData?.recentSessions.slice(-8).map((s) => s.percentage) || [];

                  return (
                    <View key={item.table} style={styles.tableStatsRow}>
                      <View style={styles.tableStatsLeft}>
                        <View style={[
                          styles.tableNumCircle,
                          {
                            borderColor: item.accuracy >= 80
                              ? Colors.success
                              : item.accuracy >= 50
                              ? Colors.accent
                              : Colors.error,
                          },
                        ]}>
                          <Text style={styles.tableNum}>{item.table}</Text>
                        </View>
                        <View style={styles.tableStatsInfo}>
                          <View style={styles.tableStatsNameRow}>
                            <Text style={styles.tableStatsName}>{practiceFilter === "addition" ? (ADDITION_CATEGORY_NAMES[item.table] || `${strings.categoryLabel} ${item.table}`) : practiceFilter === "subtraction" ? (SUBTRACTION_CATEGORY_NAMES[item.table] || `${strings.categoryLabel} ${item.table}`) : `${tableOperator}${item.table}`}</Text>
                            <TrendIcon trend={item.trend} />
                          </View>
                          <Text style={styles.tableStatsDetail}>
                            {tableData?.totalCorrect || 0}/{tableData?.totalAttempts || 0} {strings.correctSuffix}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.tableStatsRight}>
                        <MiniSparkline data={sparkData} />
                        <Text
                          style={[
                            styles.tableAccuracy,
                            {
                              color: item.accuracy >= 80
                                ? Colors.success
                                : item.accuracy >= 50
                                ? Colors.accent
                                : Colors.error,
                            },
                          ]}
                        >
                          {item.accuracy}%
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {weakTables.length === 0 && (
                  <View style={styles.noDataMessage}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                    <Text style={styles.noDataText}>
                      {practiceFilter === "addition" || practiceFilter === "subtraction" ? strings.noCategoriesData : strings.noTablesData}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {activeTab === "history" && (
              <Animated.View entering={FadeInDown.delay(150)} style={styles.historySection}>
                {filteredSessions.map((session) => {
                  const op = OPERATOR_LABELS[session.practiceType] || "\u00D7";
                  return (
                    <View key={session.id} style={styles.sessionCard}>
                      <View style={styles.sessionHeader}>
                        <View style={styles.sessionHeaderLeft}>
                          <View style={styles.sessionTypeBadge}>
                            <Text style={styles.sessionTypeText}>{op}</Text>
                          </View>
                          <Text style={styles.sessionDate}>
                            {formatDate(session.date)}
                          </Text>
                        </View>
                        <View style={[
                          styles.sessionAccuracyBadge,
                          {
                            backgroundColor:
                              session.accuracy >= 80
                                ? "rgba(45, 198, 83, 0.15)"
                                : session.accuracy >= 50
                                ? "rgba(244, 162, 97, 0.15)"
                                : "rgba(230, 57, 70, 0.15)",
                          },
                        ]}>
                          <Text
                            style={[
                              styles.sessionAccuracyText,
                              {
                                color:
                                  session.accuracy >= 80
                                    ? Colors.success
                                    : session.accuracy >= 50
                                    ? Colors.accent
                                    : Colors.error,
                              },
                            ]}
                          >
                            {session.accuracy}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.sessionStats}>
                        <View style={styles.sessionStat}>
                          <Ionicons name="checkmark" size={12} color={Colors.success} />
                          <Text style={styles.sessionStatText}>{session.correctAnswers}</Text>
                        </View>
                        <View style={styles.sessionStat}>
                          <Ionicons name="close" size={12} color={Colors.error} />
                          <Text style={styles.sessionStatText}>{session.wrongAnswers}</Text>
                        </View>
                        <View style={styles.sessionStat}>
                          <Ionicons name="timer-outline" size={12} color={Colors.textMuted} />
                          <Text style={styles.sessionStatText}>
                            {formatTime(session.elapsed)}
                          </Text>
                        </View>
                        <View style={styles.sessionStat}>
                          <MaterialCommunityIcons name="fire" size={12} color={Colors.accent} />
                          <Text style={styles.sessionStatText}>{session.bestStreak}</Text>
                        </View>
                      </View>
                      <View style={styles.sessionTables}>
                        {session.tableBreakdown.map((tb) => {
                          const pct = tb.total > 0 ? Math.round((tb.correct / tb.total) * 100) : 0;
                          return (
                            <View
                              key={tb.table}
                              style={[
                                styles.sessionTableChip,
                                {
                                  backgroundColor:
                                    pct >= 80
                                      ? "rgba(45, 198, 83, 0.1)"
                                      : pct >= 50
                                      ? "rgba(244, 162, 97, 0.1)"
                                      : "rgba(230, 57, 70, 0.1)",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.sessionTableText,
                                  {
                                    color:
                                      pct >= 80
                                        ? Colors.success
                                        : pct >= 50
                                        ? Colors.accent
                                        : Colors.error,
                                  },
                                ]}
                              >
                                {tb.table}{op} {tb.correct}/{tb.total}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}

                {filteredSessions.length === 0 && (
                  <View style={styles.noDataMessage}>
                    <MaterialCommunityIcons
                      name="history"
                      size={24}
                      color={Colors.textMuted}
                    />
                    <Text style={styles.noDataText}>
                      {strings.noSessionsYet}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: fontScale(20),
    color: Colors.text,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: scale(20),
    gap: scale(8),
    paddingBottom: scale(12),
  },
  filterChip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: 10,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(14),
    color: Colors.textMuted,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    gap: scale(20),
    paddingHorizontal: scale(20),
    maxWidth: maxContentWidth,
    width: "100%",
    alignSelf: "center" as const,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: fontScale(20),
    color: Colors.text,
  },
  emptySubtext: {
    fontFamily: "Outfit_400Regular",
    fontSize: fontScale(14),
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(15),
    color: Colors.white,
  },
  overviewCards: {
    flexDirection: "row",
    gap: 10,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewValue: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: fontScale(22),
    color: Colors.text,
  },
  overviewLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: fontScale(11),
    color: Colors.textMuted,
  },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: Colors.surfaceLight,
  },
  tabButtonText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    color: Colors.textMuted,
  },
  tabButtonTextActive: {
    color: Colors.white,
  },
  tablesSection: {
    gap: 8,
  },
  tableStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableStatsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  tableNumCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  tableNum: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  tableStatsInfo: {
    gap: 2,
    flex: 1,
  },
  tableStatsNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tableStatsName: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  tableStatsDetail: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  tableStatsRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  tableAccuracy: {
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
  },
  noDataMessage: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 30,
  },
  noDataText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  historySection: {
    gap: 10,
  },
  sessionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sessionTypeBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionTypeText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
    color: Colors.accent,
  },
  sessionDate: {
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    color: Colors.textMuted,
  },
  sessionAccuracyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionAccuracyText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
  },
  sessionStats: {
    flexDirection: "row",
    gap: 14,
  },
  sessionStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sessionStatText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sessionTables: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sessionTableChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sessionTableText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 11,
  },
});
