import React, { useState } from "react";
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
import type { TrackerStyle } from "@/components/RaceTrack";

type SessionMode = "questions" | "timed";

export type SubtractionCategory = "1" | "2" | "3" | "4" | "5";

const SUBTRACTION_CATEGORIES: { id: SubtractionCategory; title: string; description: string; examples: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  {
    id: "1",
    title: "Small Numbers",
    description: "Subtract within 10",
    examples: "7 − 3 = 4",
    icon: "numeric-1-circle",
  },
  {
    id: "2",
    title: "Subtract from 10",
    description: "Take away from 10",
    examples: "10 − 4 = 6",
    icon: "numeric-2-circle",
  },
  {
    id: "3",
    title: "Passing 10",
    description: "Cross below 10 (start 11–19)",
    examples: "15 − 8 = 7",
    icon: "numeric-3-circle",
  },
  {
    id: "4",
    title: "Passing Whole Tens",
    description: "Cross a tens boundary downward",
    examples: "32 − 5 = 27",
    icon: "numeric-4-circle",
  },
  {
    id: "5",
    title: "Double Digits",
    description: "Two double-digit numbers subtracted",
    examples: "68 − 23 = 45",
    icon: "numeric-5-circle",
  },
];

const QUESTION_OPTIONS = [10, 15, 20, 30, 50];
const TIME_OPTIONS = [
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

export default function SubtractionScreen() {
  const insets = useSafeAreaInsets();
  const routeParams = useLocalSearchParams<{ trackerStyle: string }>();
  const trackerStyle = (routeParams.trackerStyle || "racecar") as TrackerStyle;
  const [selectedCategory, setSelectedCategory] = useState<SubtractionCategory>("1");
  const [mode, setMode] = useState<SessionMode>("questions");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(120);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const startPractice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: "/practice",
      params: {
        tables: selectedCategory,
        mode,
        questionCount: mode === "questions" ? questionCount.toString() : "999",
        timeLimit: mode === "timed" ? timeLimit.toString() : "0",
        trackerStyle,
        practiceType: "subtraction",
        subtractionCategory: selectedCategory,
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
                router.replace("/");
              }}
              style={styles.navButton}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.accent} />
            </Pressable>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="minus-circle-outline"
                size={28}
                color={Colors.accent}
              />
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/history");
              }}
              style={styles.navButton}
            >
              <Ionicons name="stats-chart" size={20} color={Colors.accent} />
            </Pressable>
          </View>
          <Text style={styles.heroTitle}>Subtraction</Text>
          <Text style={styles.heroSubtitle}>
            Choose a category and start practicing
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryList}>
            {SUBTRACTION_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.categoryCard,
                    isActive && styles.categoryCardActive,
                  ]}
                >
                  <View style={styles.categoryLeft}>
                    <MaterialCommunityIcons
                      name={cat.icon}
                      size={28}
                      color={isActive ? Colors.accent : Colors.textMuted}
                    />
                    <View style={styles.categoryTextWrap}>
                      <Text style={[styles.categoryTitle, isActive && styles.categoryTitleActive]}>
                        {cat.title}
                      </Text>
                      <Text style={styles.categoryDesc}>{cat.description}</Text>
                      <Text style={styles.categoryExample}>{cat.examples}</Text>
                    </View>
                  </View>
                  {isActive && (
                    <View style={styles.categoryCheck}>
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

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
  navButton: {
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
  categoryList: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryCardActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(244, 162, 97, 0.06)",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  categoryTextWrap: {
    flex: 1,
    gap: 2,
  },
  categoryTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  categoryTitleActive: {
    color: Colors.accent,
  },
  categoryDesc: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  categoryExample: {
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
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
});
