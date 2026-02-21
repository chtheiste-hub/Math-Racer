import React, { useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { saveSessionResults, type PracticeType } from "@/lib/stats-storage";

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    correct: string;
    wrong: string;
    total: string;
    elapsed: string;
    streak: string;
    results: string;
    tables: string;
    practiceType: string;
  }>();

  const practiceType = params.practiceType || "multiplication";
  const operatorSymbol = practiceType === "division" ? "\u00F7" : practiceType === "addition" ? "+" : "x";

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const correct = parseInt(params.correct || "0", 10);
  const wrong = parseInt(params.wrong || "0", 10);
  const total = parseInt(params.total || "0", 10);
  const elapsed = parseInt(params.elapsed || "0", 10);
  const bestStreak = parseInt(params.streak || "0", 10);
  const tablesUsed = (params.tables || "").split(",").map(Number).filter(Boolean);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const parsedResults = useMemo(() => {
    try {
      return JSON.parse(params.results || "[]") as {
        question: { a: number; b: number; answer: number };
        userAnswer: number;
        correct: boolean;
      }[];
    } catch {
      return [];
    }
  }, [params.results]);

  const savedRef = useRef(false);
  useEffect(() => {
    if (!savedRef.current && parsedResults.length > 0) {
      savedRef.current = true;
      saveSessionResults(parsedResults, tablesUsed, elapsed, bestStreak, practiceType as PracticeType).catch(console.error);
    }
  }, [parsedResults]);

  const wrongResults = parsedResults.filter((r) => !r.correct);

  const tableBreakdown = useMemo(() => {
    const breakdown: Record<number, { correct: number; total: number }> = {};
    for (const r of parsedResults) {
      const table = r.question.a;
      if (!breakdown[table]) breakdown[table] = { correct: 0, total: 0 };
      breakdown[table].total++;
      if (r.correct) breakdown[table].correct++;
    }
    return Object.entries(breakdown)
      .map(([table, data]) => ({
        table: parseInt(table, 10),
        ...data,
        percentage: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => a.table - b.table);
  }, [parsedResults]);

  const weakTables = useMemo(() => {
    return tableBreakdown
      .filter((t) => t.percentage < 80)
      .sort((a, b) => a.percentage - b.percentage);
  }, [tableBreakdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getGrade = () => {
    if (accuracy >= 95) return { label: "Perfect", color: Colors.success, icon: "trophy" as const };
    if (accuracy >= 80) return { label: "Great", color: Colors.accent, icon: "star" as const };
    if (accuracy >= 60) return { label: "Good", color: Colors.secondaryLight, icon: "thumbs-up" as const };
    return { label: "Keep Practicing", color: Colors.textMuted, icon: "fitness" as const };
  };

  const grade = getGrade();

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace({
      pathname: "/practice",
      params: {
        tables: params.tables || "1,2,3,4,5,6,7,8,9,10",
        mode: "questions",
        questionCount: total.toString(),
        timeLimit: "0",
      },
    });
  };

  const handlePracticeWeak = () => {
    if (weakTables.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace({
      pathname: "/practice",
      params: {
        tables: weakTables.map((t) => t.table).join(","),
        mode: "questions",
        questionCount: "20",
        timeLimit: "0",
      },
    });
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/");
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundLight, Colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: (insets.top || webTopInset) + 16,
            paddingBottom: (insets.bottom || webBottomInset) + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroSection}>
          <View style={[styles.gradeCircle, { borderColor: grade.color }]}>
            <Ionicons name={grade.icon} size={36} color={grade.color} />
          </View>
          <Text style={styles.gradeLabel}>{grade.label}</Text>
          <Text style={styles.accuracyText}>{accuracy}% Accuracy</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.statValue}>{correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close-circle" size={20} color={Colors.error} />
            <Text style={styles.statValue}>{wrong}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="timer-outline" size={20} color={Colors.secondaryLight} />
            <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={20} color={Colors.accent} />
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </Animated.View>

        {weakTables.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250)} style={styles.focusSection}>
            <View style={styles.focusHeader}>
              <MaterialCommunityIcons name="target" size={20} color={Colors.accent} />
              <Text style={styles.focusTitleText}>Focus Areas</Text>
            </View>
            <Text style={styles.focusSubtext}>
              These tables need more practice:
            </Text>
            <View style={styles.focusChips}>
              {weakTables.map((t) => (
                <View key={t.table} style={styles.focusChip}>
                  <Text style={styles.focusChipNumber}>{t.table}x</Text>
                  <Text style={styles.focusChipPercent}>{t.percentage}%</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={handlePracticeWeak}
              style={({ pressed }) => [
                styles.focusButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <MaterialCommunityIcons name="target" size={16} color={Colors.white} />
              <Text style={styles.focusButtonText}>Practice These Tables</Text>
            </Pressable>
          </Animated.View>
        )}

        {tableBreakdown.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Per Table</Text>
            <View style={styles.tableBreakdownList}>
              {tableBreakdown.map((item) => (
                <View key={item.table} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{item.table}x</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor:
                            item.percentage >= 80
                              ? Colors.success
                              : item.percentage >= 50
                              ? Colors.accent
                              : Colors.error,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barPercent}>
                    {item.correct}/{item.total}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {wrongResults.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Review Mistakes</Text>
            <View style={styles.mistakesList}>
              {wrongResults.map((r, i) => (
                <View key={i} style={styles.mistakeRow}>
                  <Text style={styles.mistakeQuestion}>
                    {r.question.a} {operatorSymbol} {r.question.b}
                  </Text>
                  <Text style={styles.mistakeWrong}>{r.userAnswer}</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.mistakeCorrect}>{r.question.answer}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: (insets.bottom || webBottomInset) + 12 },
        ]}
      >
        <Pressable
          onPress={handleGoHome}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name="home" size={20} color={Colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={handlePlayAgain}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="restart"
              size={20}
              color={Colors.white}
            />
            <Text style={styles.primaryButtonText}>Race Again</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    gap: 24,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    gap: 8,
    paddingTop: 20,
  },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
  },
  gradeLabel: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: 28,
    color: Colors.text,
  },
  accuracyText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  focusSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(244, 162, 97, 0.3)",
  },
  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  focusTitleText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    color: Colors.accent,
  },
  focusSubtext: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
  focusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  focusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(230, 57, 70, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  focusChipNumber: {
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
    color: Colors.primary,
  },
  focusChipPercent: {
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
    color: Colors.textMuted,
  },
  focusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  focusButtonText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  tableBreakdownList: {
    gap: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tableLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    color: Colors.textMuted,
    width: 30,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  barPercent: {
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    color: Colors.textMuted,
    width: 36,
    textAlign: "right",
  },
  mistakesList: {
    gap: 6,
  },
  mistakeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.backgroundCard,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mistakeQuestion: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  mistakeWrong: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: Colors.error,
    textDecorationLine: "line-through",
  },
  mistakeCorrect: {
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    color: Colors.success,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(11, 22, 34, 0.95)",
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  primaryButtonText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 17,
    color: Colors.white,
  },
});
