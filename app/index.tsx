import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Ellipse } from "react-native-svg";
import Colors from "@/constants/colors";
import TableSelector from "@/components/TableSelector";
import type { TrackerStyle } from "@/components/RaceTrack";

type SessionMode = "questions" | "timed";

function SmallHenIcon({ size = 28, color = "#999" }: { size?: number; color?: string }) {
  const isAccent = color === Colors.accent;
  const bodyColor = isAccent ? "#D4883E" : "#999";
  const bellyColor = isAccent ? "#E8A94F" : "#AAA";
  const beakColor = isAccent ? "#E07020" : "#888";
  const combColor = isAccent ? "#E63946" : "#999";
  const eyeColor = "#1A1A1A";
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Ellipse cx="22" cy="30" rx="14" ry="12" fill={bodyColor} />
      <Ellipse cx="22" cy="32" rx="11" ry="9" fill={bellyColor} />
      <Path d="M8 34 Q4 38 6 42 Q8 40 10 38" fill={bodyColor} />
      <Circle cx="32" cy="20" r="9" fill={bodyColor} />
      <Circle cx="32" cy="20" r="7.5" fill={bellyColor} />
      <Circle cx="35" cy="18" r="2" fill={eyeColor} />
      <Circle cx="35.5" cy="17.5" r="0.6" fill="#FFFFFF" />
      <Path d="M38 21 L44 20 L38 23 Z" fill={beakColor} />
      <Path d="M30 12 Q32 6 34 8 Q33 11 31 13" fill={combColor} />
      <Path d="M32 11 Q34 5 36 7 Q35 10 33 12" fill={combColor} />
      <Path d="M16 40 L14 44 L16 43 L18 45 L20 43 L22 44 L20 40" fill={beakColor} />
      <Path d="M24 40 L22 44 L24 43 L26 45 L28 43 L30 44 L28 40" fill={beakColor} />
    </Svg>
  );
}

const TRACKER_OPTIONS: { value: TrackerStyle; label: string }[] = [
  { value: "racecar", label: "Racecar" },
  { value: "chicken", label: "Hen" },
];

const QUESTION_OPTIONS = [10, 15, 20, 30, 50];
const TIME_OPTIONS = [
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTables, setSelectedTables] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  );
  const [mode, setMode] = useState<SessionMode>("questions");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(120);
  const [trackerStyle, setTrackerStyle] = useState<TrackerStyle>("racecar");

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
            <View style={{ width: 40 }} />
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="car-sports"
                size={36}
                color={Colors.primary}
              />
              <MaterialCommunityIcons
                name="multiplication"
                size={24}
                color={Colors.accent}
                style={{ marginLeft: 8 }}
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
          <Text style={styles.heroTitle}>Math Racer</Text>
          <Text style={styles.heroSubtitle}>
            Master your multiplication tables
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Tracker</Text>
          <View style={styles.trackerRow}>
            {TRACKER_OPTIONS.map((opt) => {
              const isActive = trackerStyle === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setTrackerStyle(opt.value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.trackerCard,
                    isActive && styles.trackerCardActive,
                  ]}
                >
                  {opt.value === "chicken" ? (
                    <SmallHenIcon size={28} color={isActive ? Colors.accent : Colors.textMuted} />
                  ) : (
                    <MaterialCommunityIcons
                      name="car-sports"
                      size={28}
                      color={isActive ? Colors.accent : Colors.textMuted}
                    />
                  )}
                  <Text
                    style={[
                      styles.trackerLabel,
                      isActive && styles.trackerLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isActive && (
                    <View style={styles.trackerCheck}>
                      <Ionicons name="checkmark" size={10} color={Colors.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
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
    gap: 24,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 6,
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 34,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    color: Colors.textMuted,
  },
  section: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
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
    paddingVertical: 12,
    borderRadius: 11,
  },
  modeButtonActive: {
    backgroundColor: Colors.surfaceLight,
  },
  modeButtonText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
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
    paddingHorizontal: 18,
    paddingVertical: 10,
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
    fontSize: 14,
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
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(11, 22, 34, 0.95)",
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
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: Colors.white,
  },
  trackerRow: {
    flexDirection: "row",
    gap: 10,
  },
  trackerCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: "relative",
  },
  trackerCardActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(244, 162, 97, 0.08)",
  },
  trackerLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
    color: Colors.textMuted,
  },
  trackerLabelActive: {
    color: Colors.accent,
  },
  trackerCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
});
