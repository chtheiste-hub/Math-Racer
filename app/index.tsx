import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

type PracticeArea = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string | null;
  color: string;
  available: boolean;
};

const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: "multiplication",
    title: "Multiplication",
    subtitle: "Master your times tables 1-10",
    icon: "multiplication",
    route: "/multiplication",
    color: Colors.primary,
    available: true,
  },
  {
    id: "division",
    title: "Division",
    subtitle: "Practice dividing numbers",
    icon: "division",
    route: null,
    color: Colors.secondaryLight,
    available: false,
  },
];

export default function StartScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handlePress = (area: PracticeArea) => {
    if (!area.available || !area.route) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(area.route as any);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundLight, Colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: (insets.top || webTopInset) + 20,
            paddingBottom: (insets.bottom || webBottomInset) + 20,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ width: 40 }} />
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
          <Text style={styles.title}>Math Racer</Text>
          <Text style={styles.subtitle}>What do you want to practice?</Text>
        </View>

        <View style={styles.cards}>
          {PRACTICE_AREAS.map((area) => (
            <Pressable
              key={area.id}
              onPress={() => handlePress(area)}
              style={({ pressed }) => [
                styles.card,
                !area.available && styles.cardDisabled,
                pressed && area.available && styles.cardPressed,
              ]}
            >
              <View style={[styles.cardIconWrap, { backgroundColor: area.available ? area.color + "20" : Colors.backgroundCard }]}>
                <MaterialCommunityIcons
                  name={area.icon}
                  size={32}
                  color={area.available ? area.color : Colors.textMuted}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, !area.available && styles.cardTitleDisabled]}>
                  {area.title}
                </Text>
                <Text style={[styles.cardSubtitle, !area.available && styles.cardSubtitleDisabled]}>
                  {area.subtitle}
                </Text>
              </View>
              {area.available ? (
                <Ionicons name="chevron-forward" size={22} color={Colors.textMuted} />
              ) : (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 40,
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: 36,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cards: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  cardTitleDisabled: {
    color: Colors.textMuted,
  },
  cardSubtitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardSubtitleDisabled: {
    color: Colors.textMuted,
  },
  comingSoonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
  },
  comingSoonText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
