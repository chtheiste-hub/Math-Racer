import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import type { TrackerStyle } from "@/components/RaceTrack";
import { loadPreferences, savePreferences, type SessionMode } from "@/lib/preferences";
import { isTablet, fontScale, scale, maxContentWidth } from "@/lib/responsive";
import { useWebSlideTransition } from "@/lib/web-slide";
import { useTranslation } from "@/lib/language-context";

export type AdditionCategory = "1" | "2" | "3" | "4" | "5";

const QUESTION_OPTIONS = [10, 15, 20, 30, 50];

export default function AdditionScreen() {
  const insets = useSafeAreaInsets();
  const routeParams = useLocalSearchParams<{ trackerStyle: string }>();
  const trackerStyle = (routeParams.trackerStyle || "racecar") as TrackerStyle;
  const [selectedCategory, setSelectedCategory] = useState<AdditionCategory>("1");
  const [mode, setMode] = useState<SessionMode>("questions");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(120);
  const { strings } = useTranslation();

  const ADDITION_CATEGORIES = useMemo(() => [
    { id: "1" as AdditionCategory, title: strings.addCat1Title, description: strings.addCat1Desc, examples: "3 + 4 = 7", icon: "numeric-1-circle" as keyof typeof MaterialCommunityIcons.glyphMap },
    { id: "2" as AdditionCategory, title: strings.addCat2Title, description: strings.addCat2Desc, examples: "3 + ? = 10", icon: "numeric-2-circle" as keyof typeof MaterialCommunityIcons.glyphMap },
    { id: "3" as AdditionCategory, title: strings.addCat3Title, description: strings.addCat3Desc, examples: "7 + 5 = 12", icon: "numeric-3-circle" as keyof typeof MaterialCommunityIcons.glyphMap },
    { id: "4" as AdditionCategory, title: strings.addCat4Title, description: strings.addCat4Desc, examples: "27 + 5 = 32", icon: "numeric-4-circle" as keyof typeof MaterialCommunityIcons.glyphMap },
    { id: "5" as AdditionCategory, title: strings.addCat5Title, description: strings.addCat5Desc, examples: "23 + 45 = 68", icon: "numeric-5-circle" as keyof typeof MaterialCommunityIcons.glyphMap },
  ], [strings]);

  const TIME_OPTIONS = useMemo(() => [
    { label: strings.min1, value: 60 },
    { label: strings.min2, value: 120 },
    { label: strings.min3, value: 180 },
    { label: strings.min5, value: 300 },
  ], [strings]);

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

  const { slideStyle, animateOut } = useWebSlideTransition();

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
        practiceType: "addition",
        additionCategory: selectedCategory,
      },
    });
  };

  return (
    <Animated.View style={[styles.screen, slideStyle]}>
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
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await animateOut();
                router.back();
              }}
              style={styles.navButton}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.accent} />
            </Pressable>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={28}
                color={Colors.success}
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
          <Text style={styles.heroTitle}>{strings.addition}</Text>
          <Text style={styles.heroSubtitle}>
            {strings.chooseCategorySubtitle}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.category}</Text>
          <View style={styles.categoryList}>
            {ADDITION_CATEGORIES.map((cat) => {
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
                      color={isActive ? Colors.success : Colors.textMuted}
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
          <Text style={styles.sectionTitle}>{strings.practiceMode}</Text>
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
                {strings.byQuestions}
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
                {strings.timed}
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
            <Text style={styles.startButtonText}>{strings.startRace}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  content: { gap: scale(24), maxWidth: maxContentWidth, width: "100%", alignSelf: "center" },
  heroSection: { alignItems: "center", paddingHorizontal: scale(20), paddingTop: scale(12), gap: scale(6) },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: scale(6) },
  navButton: { width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: Colors.backgroundCard, justifyContent: "center", alignItems: "center" },
  iconRow: { flexDirection: "row", alignItems: "center" },
  heroTitle: { fontFamily: "Outfit_800ExtraBold", fontSize: fontScale(34), color: Colors.text, letterSpacing: -0.5 },
  heroSubtitle: { fontFamily: "Outfit_400Regular", fontSize: fontScale(15), color: Colors.textMuted },
  section: { paddingHorizontal: scale(20), gap: scale(12) },
  sectionTitle: { fontFamily: "Outfit_600SemiBold", fontSize: fontScale(16), color: Colors.textSecondary },
  categoryList: { gap: 10 },
  categoryCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: scale(16), borderRadius: scale(14), backgroundColor: Colors.backgroundCard, borderWidth: 1.5, borderColor: Colors.border },
  categoryCardActive: { borderColor: Colors.success, backgroundColor: "rgba(45, 198, 83, 0.06)" },
  categoryLeft: { flexDirection: "row", alignItems: "center", gap: scale(14), flex: 1 },
  categoryTextWrap: { flex: 1, gap: 2 },
  categoryTitle: { fontFamily: "Outfit_700Bold", fontSize: fontScale(15), color: Colors.text },
  categoryTitleActive: { color: Colors.success },
  categoryDesc: { fontFamily: "Outfit_400Regular", fontSize: fontScale(12), color: Colors.textMuted },
  categoryExample: { fontFamily: "Outfit_500Medium", fontSize: fontScale(12), color: Colors.textSecondary, marginTop: 2 },
  categoryCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.success, justifyContent: "center", alignItems: "center" },
  modeToggle: { flexDirection: "row", gap: 10, backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 4 },
  modeButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: scale(12), borderRadius: 11 },
  modeButtonActive: { backgroundColor: Colors.surfaceLight },
  modeButtonText: { fontFamily: "Outfit_500Medium", fontSize: fontScale(14), color: Colors.textMuted },
  modeButtonTextActive: { color: Colors.white },
  optionsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  optionChip: { paddingHorizontal: scale(18), paddingVertical: scale(10), borderRadius: 20, backgroundColor: Colors.backgroundCard, borderWidth: 1.5, borderColor: Colors.border },
  optionChipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondaryLight },
  optionChipText: { fontFamily: "Outfit_600SemiBold", fontSize: fontScale(14), color: Colors.textMuted },
  optionChipTextActive: { color: Colors.accent },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: scale(20), paddingTop: 12, backgroundColor: "rgba(11, 22, 34, 0.95)", maxWidth: maxContentWidth, width: "100%", alignSelf: "center" },
  startButton: { borderRadius: 16, overflow: "hidden" },
  startButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  startButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(10), paddingVertical: scale(16), borderRadius: 16 },
  startButtonText: { fontFamily: "Outfit_700Bold", fontSize: fontScale(18), color: Colors.white },
});
