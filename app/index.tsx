import React, { useState, useEffect, useMemo } from "react";
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
import type { TrackerStyle } from "@/components/RaceTrack";
import { loadPreferences, savePreferences } from "@/lib/preferences";
import { isTablet, fontScale, scale, maxContentWidth } from "@/lib/responsive";
import { useTranslation } from "@/lib/language-context";

function SmallHenIcon({ size = 28, color = "#999" }: { size?: number; color?: string }) {
  const isAccent = color === Colors.accent;
  const bodyColor = isAccent ? "#F5F5F0" : "#999";
  const bellyColor = isAccent ? "#FFFFFF" : "#AAA";
  const beakColor = isAccent ? "#E8A030" : "#888";
  const combColor = isAccent ? "#E63946" : "#999";
  const wattleColor = isAccent ? "#CC2233" : "#888";
  const eyeColor = "#1A1A1A";
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Ellipse cx="22" cy="30" rx="14" ry="12" fill={bodyColor} />
      <Ellipse cx="22" cy="32" rx="11" ry="9" fill={bellyColor} />
      <Path d="M8 28 Q5 26 7 24 Q9 25 11 27" fill={bodyColor} />
      <Path d="M9 30 Q5 29 6 26 Q8 27 10 29" fill={isAccent ? "#E8E8E3" : "#888"} />
      <Path d="M8 34 Q4 38 6 42 Q8 40 10 38" fill={bodyColor} />
      <Circle cx="32" cy="20" r="9" fill={bodyColor} />
      <Circle cx="32" cy="20" r="7.5" fill={bellyColor} />
      <Circle cx="35" cy="18" r="2.2" fill={eyeColor} />
      <Circle cx="35.5" cy="17.3" r="0.7" fill="#FFFFFF" />
      <Path d="M38 21 L44 20 L38 23 Z" fill={beakColor} />
      <Path d="M30 12 Q31 5 33 7 Q32.5 10 31 13" fill={combColor} />
      <Path d="M32 11 Q33 4 35 6 Q34.5 9 33 12" fill={wattleColor} />
      <Path d="M28 13 Q28.5 7 30 9 Q30 11 29 14" fill={combColor} />
      <Path d="M36 23 Q38 24 37 26 Q36 25 35 24" fill={combColor} />
      <Path d="M16 40 L14 44 L16 43 L18 45 L20 43 L22 44 L20 40" fill={beakColor} />
      <Path d="M24 40 L22 44 L24 43 L26 45 L28 43 L30 44 L28 40" fill={beakColor} />
    </Svg>
  );
}

type PracticeArea = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  color: string;
};

export default function StartScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;
  const [trackerStyle, setTrackerStyle] = useState<TrackerStyle>("racecar");
  const { strings, language, setLanguage } = useTranslation();

  const TRACKER_OPTIONS = useMemo(() => [
    { value: "racecar" as TrackerStyle, label: strings.trackerRacecar },
    { value: "chicken" as TrackerStyle, label: strings.trackerHen },
  ], [strings]);

  const PRACTICE_AREAS: PracticeArea[] = useMemo(() => [
    {
      id: "multiplication",
      title: strings.multiplication,
      subtitle: strings.multiplicationSubtitle,
      icon: "multiplication",
      route: "/multiplication",
      color: Colors.primary,
    },
    {
      id: "division",
      title: strings.division,
      subtitle: strings.divisionSubtitle,
      icon: "division",
      route: "/division",
      color: Colors.secondaryLight,
    },
    {
      id: "addition",
      title: strings.addition,
      subtitle: strings.additionSubtitle,
      icon: "plus-circle-outline",
      route: "/addition",
      color: Colors.success,
    },
    {
      id: "subtraction",
      title: strings.subtraction,
      subtitle: strings.subtractionSubtitle,
      icon: "minus-circle-outline",
      route: "/subtraction",
      color: Colors.accent,
    },
  ], [strings]);

  useEffect(() => {
    loadPreferences().then((prefs) => {
      setTrackerStyle(prefs.trackerStyle);
    });
  }, []);

  const handleTrackerChange = (value: TrackerStyle) => {
    setTrackerStyle(value);
    savePreferences({ trackerStyle: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePress = (area: PracticeArea) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: area.route as any, params: { trackerStyle } });
  };

  const toggleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(language === "no" ? "en" : "no");
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
            paddingTop: (insets.top || webTopInset) + 20,
            paddingBottom: (insets.bottom || webBottomInset) + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              onPress={toggleLanguage}
              style={styles.langButton}
            >
              <Ionicons name="globe-outline" size={14} color={Colors.accent} style={{ marginBottom: -2 }} />
              <Text style={styles.langButtonText}>
                {language === "no" ? "EN" : "NO"}
              </Text>
            </Pressable>
            <MaterialCommunityIcons
              name="car-sports"
              size={40}
              color={Colors.primary}
            />
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
          <Text style={styles.title}>{strings.appTitle}</Text>
          <Text style={styles.subtitle}>{strings.whatToPractice}</Text>
        </View>

        <View style={styles.cards}>
          {PRACTICE_AREAS.map((area) => (
            <Pressable
              key={area.id}
              onPress={() => handlePress(area)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.cardIconWrap, { backgroundColor: area.color + "20" }]}>
                <MaterialCommunityIcons
                  name={area.icon}
                  size={32}
                  color={area.color}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{area.title}</Text>
                <Text style={styles.cardSubtitle}>{area.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.trackerSection}>
          <Text style={styles.sectionTitle}>{strings.progressTracker}</Text>
          <View style={styles.trackerRow}>
            {TRACKER_OPTIONS.map((opt) => {
              const isActive = trackerStyle === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleTrackerChange(opt.value)}
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
    paddingHorizontal: scale(20),
    gap: scale(32),
    maxWidth: maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    gap: scale(6),
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: scale(12),
  },
  langButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 1,
  },
  langButtonText: {
    fontFamily: "Outfit_700Bold",
    fontSize: fontScale(10),
    color: Colors.accent,
  },
  statsButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: fontScale(36),
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: fontScale(16),
    color: Colors.textMuted,
    marginTop: 2,
  },
  cards: {
    gap: scale(14),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(16),
    padding: scale(18),
    borderRadius: scale(16),
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardIconWrap: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(14),
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    gap: scale(3),
  },
  cardTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: fontScale(18),
    color: Colors.text,
  },
  cardSubtitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: fontScale(13),
    color: Colors.textSecondary,
  },
  trackerSection: {
    gap: scale(12),
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(16),
    color: Colors.textSecondary,
  },
  trackerRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  trackerCard: {
    flex: 1,
    alignItems: "center",
    gap: scale(8),
    paddingVertical: scale(16),
    borderRadius: scale(14),
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
    fontSize: fontScale(13),
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
