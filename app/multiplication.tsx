import React, { useState, useCallback, useEffect } from "react";
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
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import TableSelector from "@/components/TableSelector";
import type { TrackerStyle } from "@/components/RaceTrack";
import { loadPreferences, savePreferences, type SessionMode } from "@/lib/preferences";
import { isTablet, fontScale, scale, maxContentWidth } from "@/lib/responsive";

const QUESTION_OPTIONS = [10, 15, 20, 30, 50];
const TIME_OPTIONS = [
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

export default function MultiplicationScreen() {
  const insets = useSafeAreaInsets();
  const routeParams = useLocalSearchParams<{ trackerStyle: string }>();
  const trackerStyle = (routeParams.trackerStyle || "racecar") as TrackerStyle;
  const [selectedTables, setSelectedTables] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  );
  const [mode, setMode] = useState<SessionMode>("questions");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(120);

  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences().then((prefs) => {
      setMode(prefs.mode);
      setQuestionCount(prefs.questionCount);
      setTimeLimit(prefs.timeLimit);
      setPrefsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (prefsLoaded) savePreferences({ mode, questionCount, timeLimit });
  }, [mode, questionCount, timeLimit, prefsLoaded]);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const toggleTable = useCallback((table: number) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) {
        if (next.size > 1) next.delete(table);
      } else {
        next.add(table);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedTables(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedTables(new Set([1]));
  }, []);

  const startPractice = () => {
    if (selectedTables.size === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: "/practice",
      params: {
        tables: Array.from(selectedTables).join(","),
        mode,
        questionCount: mode === "questions" ? questionCount.toString() : "999",
        timeLimit: mode === "timed" ? timeLimit.toString() : "0",
        trackerStyle,
        practiceType: "multiplication",
      },
    });
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
            paddingBottom: (insets.bottom || webBottomInset) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.topRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.statsButton}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.accent} />
            </Pressable>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="multiplication"
                size={28}
                color={Colors.accent}
              />
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/history");
              }}
              style={styles.statsButton}
            >
              <Ionicons name="stats-chart" size={20} color={Colors.accent} />
            </Pressable>
          </View>
          <Text style={styles.heroTitle}>Multiplication</Text>
          <Text style={styles.heroSubtitle}>
            Pick your tables and start practicing
          </Text>
        </View>

        <TableSelector
          selectedTables={selectedTables}
          onToggle={toggleTable}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Mode</Text>
          <View style={styles.modeToggle}>
            <Pressable
              onPress={() => {
                setMode("questions");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.modeButton,
                mode === "questions" && styles.modeButtonActive,
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={mode === "questions" ? Colors.white : Colors.textMuted}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "questions" && styles.modeButtonTextActive,
                ]}
              >
                By Questions
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode("timed");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.modeButton,
                mode === "timed" && styles.modeButtonActive,
              ]}
            >
              <Ionicons
                name="timer-outline"
                size={18}
                color={mode === "timed" ? Colors.white : Colors.textMuted}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "timed" && styles.modeButtonTextActive,
                ]}
              >
                Timed
              </Text>
            </Pressable>
          </View>

          {mode === "questions" ? (
            <View style={styles.optionsRow}>
              {QUESTION_OPTIONS.map((count) => (
                <Pressable
                  key={count}
                  onPress={() => {
                    setQuestionCount(count);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.optionChip,
                    questionCount === count && styles.optionChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      questionCount === count && styles.optionChipTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.optionsRow}>
              {TIME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setTimeLimit(opt.value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.optionChip,
                    timeLimit === opt.value && styles.optionChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      timeLimit === opt.value && styles.optionChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: (insets.bottom || webBottomInset) + 12 },
        ]}
      >
        <Pressable
          onPress={startPractice}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="flag-checkered"
              size={22}
              color={Colors.white}
            />
            <Text style={styles.startButtonText}>Start Race</Text>
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
    gap: scale(24),
    maxWidth: maxContentWidth,
    width: "100%",
    alignSelf: "center" as const,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    gap: scale(6),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: scale(6),
  },
  statsButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroTitle: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: fontScale(34),
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: fontScale(15),
    color: Colors.textMuted,
  },
  section: {
    paddingHorizontal: scale(20),
    gap: scale(12),
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(16),
    color: Colors.textSecondary,
  },
  modeToggle: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: scale(12),
    borderRadius: 11,
  },
  modeButtonActive: {
    backgroundColor: Colors.surfaceLight,
  },
  modeButtonText: {
    fontFamily: "Outfit_500Medium",
    fontSize: fontScale(14),
    color: Colors.textMuted,
  },
  modeButtonTextActive: {
    color: Colors.white,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  optionChip: {
    paddingHorizontal: scale(18),
    paddingVertical: scale(10),
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondaryLight,
  },
  optionChipText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(14),
    color: Colors.textMuted,
  },
  optionChipTextActive: {
    color: Colors.accent,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: 12,
    backgroundColor: "rgba(11, 22, 34, 0.95)",
    maxWidth: maxContentWidth,
    width: "100%",
    alignSelf: "center" as const,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  startButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
    paddingVertical: scale(16),
    borderRadius: 16,
  },
  startButtonText: {
    fontFamily: "Outfit_700Bold",
    fontSize: fontScale(18),
    color: Colors.white,
  },
});
