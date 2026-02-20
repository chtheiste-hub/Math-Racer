import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import Svg, { Path, Circle, Ellipse } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export type TrackerStyle = "racecar" | "chicken";

interface RaceTrackProps {
  progress: number;
  total: number;
  trackerStyle?: TrackerStyle;
}

export default function RaceTrack({ progress, total, trackerStyle = "racecar" }: RaceTrackProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const fraction = total > 0 ? progress / total : 0;
    animatedProgress.value = withSpring(fraction, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
  }, [progress, total]);

  const characterStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animatedProgress.value,
      [0, 1],
      [0, 1]
    );
    return {
      left: `${translateX * 100}%` as any,
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%` as any,
    };
  });

  if (trackerStyle === "chicken") {
    return <ChickenTrack progress={progress} total={total} characterStyle={characterStyle} progressBarStyle={progressBarStyle} />;
  }

  return <CarTrack characterStyle={characterStyle} progressBarStyle={progressBarStyle} />;
}

function CarTrack({ characterStyle, progressBarStyle }: {
  characterStyle: any;
  progressBarStyle: any;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <View style={styles.trackDashes}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>
          <Animated.View style={[styles.progressFill, progressBarStyle]} />
        </View>
        <Animated.View style={[styles.characterContainer, characterStyle]}>
          <View style={styles.characterIcon}>
            <MaterialCommunityIcons
              name="car-sports"
              size={28}
              color={Colors.primary}
            />
          </View>
        </Animated.View>
        <View style={styles.finishFlag}>
          <MaterialCommunityIcons
            name="flag-checkered"
            size={18}
            color={Colors.accentLight}
          />
        </View>
      </View>
    </View>
  );
}

function HenIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Ellipse cx="22" cy="30" rx="14" ry="12" fill="#F5F5F0" />
      <Ellipse cx="22" cy="32" rx="11" ry="9" fill="#FFFFFF" />
      <Ellipse cx="20" cy="28" rx="8" ry="5" fill="#E8E8E3" opacity="0.4" />
      <Path d="M8 28 Q5 26 7 24 Q9 25 11 27" fill="#F0F0EB" />
      <Path d="M9 30 Q5 29 6 26 Q8 27 10 29" fill="#E8E8E3" />
      <Path d="M10 32 Q6 32 7 29 Q9 30 11 31" fill="#F0F0EB" />
      <Path d="M8 34 Q4 38 6 42 Q8 40 10 38" fill="#F0F0EB" />
      <Path d="M6 35 Q2 39 5 43 Q7 41 9 39" fill="#E8E8E3" />
      <Path d="M5 36 Q1 40 4 44" stroke="#D0D0CB" strokeWidth="0.5" fill="none" />
      <Circle cx="32" cy="20" r="9" fill="#F5F5F0" />
      <Circle cx="32" cy="20" r="7.5" fill="#FFFFFF" />
      <Path d="M26 19 Q27 17 29 18" stroke="#E8E8E3" strokeWidth="0.5" fill="none" />
      <Circle cx="35" cy="18" r="2.2" fill="#1A1A1A" />
      <Circle cx="35.5" cy="17.3" r="0.7" fill="#FFFFFF" />
      <Path d="M38 21 L44 20 L38 23 Z" fill="#E8A030" />
      <Path d="M38 21.5 L42 21 L38 22.5 Z" fill="#D4901A" />
      <Path d="M37 23 L38 23.5 L37 24" fill="#E8A030" />
      <Path d="M30 12 Q31 5 33 7 Q32.5 10 31 13" fill="#E63946" />
      <Path d="M32 11 Q33 4 35 6 Q34.5 9 33 12" fill="#CC2233" />
      <Path d="M28 13 Q28.5 7 30 9 Q30 11 29 14" fill="#E63946" />
      <Path d="M31 13 Q32 10 33.5 11 Q33 13 32 14" fill="#B01E2E" />
      <Path d="M36 23 Q38 24 37 26 Q36 25 35 24" fill="#E63946" />
      <Path d="M36.5 24 Q37.5 25 37 26" fill="#CC2233" />
      <Ellipse cx="18" cy="40" rx="3" ry="1.5" fill="#E8A030" />
      <Path d="M16 40 L14 44 L16 43 L18 45 L20 43 L22 44 L20 40" fill="#E8A030" />
      <Path d="M15 44 L17 43.5 L19 45" stroke="#D4901A" strokeWidth="0.3" fill="none" />
      <Ellipse cx="26" cy="40" rx="3" ry="1.5" fill="#E8A030" />
      <Path d="M24 40 L22 44 L24 43 L26 45 L28 43 L30 44 L28 40" fill="#E8A030" />
      <Path d="M23 44 L25 43.5 L27 45" stroke="#D4901A" strokeWidth="0.3" fill="none" />
    </Svg>
  );
}

function ChickenTrack({ progress, total, characterStyle, progressBarStyle }: {
  progress: number;
  total: number;
  characterStyle: any;
  progressBarStyle: any;
}) {
  const headBob = useSharedValue(0);
  const prevProgress = useRef(progress);

  useEffect(() => {
    if (progress > prevProgress.current) {
      headBob.value = withSequence(
        withTiming(-6, { duration: 80 }),
        withTiming(2, { duration: 60 }),
        withTiming(-4, { duration: 70 }),
        withTiming(1, { duration: 50 }),
        withTiming(-2, { duration: 60 }),
        withTiming(0, { duration: 80 })
      );
    }
    prevProgress.current = progress;
  }, [progress]);

  const henBobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headBob.value }, { rotate: `${headBob.value * 2}deg` }],
  }));

  const seedPositions = [];
  const seedCount = Math.min(total, 30);
  for (let i = 0; i < seedCount; i++) {
    const pos = total > 0 ? ((i + 1) / total) * 100 : 0;
    const eaten = (i + 1) <= progress;
    seedPositions.push({ pos, eaten, key: i });
  }

  return (
    <View style={styles.container}>
      <View style={chickenStyles.trackContainerTall}>
        <View style={[styles.track, chickenStyles.groundTrack]}>
          <Animated.View style={[styles.progressFill, chickenStyles.grassFill, progressBarStyle]} />
          <View style={chickenStyles.grassBlades}>
            {Array.from({ length: 16 }).map((_, i) => (
              <View key={i} style={chickenStyles.grassBlade} />
            ))}
          </View>
        </View>
        {seedPositions.map((seed) => (
          <View
            key={seed.key}
            style={[
              chickenStyles.seed,
              { left: `${seed.pos}%` as any },
              seed.eaten && chickenStyles.seedEaten,
            ]}
          >
            {!seed.eaten && (
              <>
                <View style={chickenStyles.seedDot} />
                <View style={chickenStyles.seedShadow} />
              </>
            )}
          </View>
        ))}
        <Animated.View style={[chickenStyles.henContainer, characterStyle]}>
          <Animated.View style={henBobStyle}>
            <HenIcon size={36} />
          </Animated.View>
        </Animated.View>
        <View style={chickenStyles.barnIcon}>
          <MaterialCommunityIcons
            name="barn"
            size={20}
            color={Colors.accentLight}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  trackContainer: {
    height: 56,
    position: "relative",
    justifyContent: "center",
  },
  track: {
    height: 8,
    backgroundColor: Colors.trackGray,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  trackDashes: {
    position: "absolute",
    top: 3,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    height: 2,
  },
  dash: {
    width: 6,
    height: 2,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 1,
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
    opacity: 0.4,
  },
  characterContainer: {
    position: "absolute",
    top: -6,
    marginLeft: -14,
  },
  characterIcon: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  finishFlag: {
    position: "absolute",
    right: -2,
    top: -22,
  },
});

const chickenStyles = StyleSheet.create({
  trackContainerTall: {
    height: 64,
    position: "relative",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  groundTrack: {
    backgroundColor: "#3A2F1B",
    height: 10,
    borderRadius: 5,
  },
  grassFill: {
    backgroundColor: "#5A8F3C",
    opacity: 0.45,
  },
  grassBlades: {
    position: "absolute",
    top: -3,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    height: 4,
  },
  grassBlade: {
    width: 2,
    height: 4,
    backgroundColor: "#4A7A30",
    borderRadius: 1,
  },
  seed: {
    position: "absolute",
    bottom: 12,
    marginLeft: -4,
    width: 8,
    height: 12,
    alignItems: "center",
  },
  seedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E9C46A",
  },
  seedShadow: {
    width: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    marginTop: 1,
  },
  seedEaten: {
    opacity: 0,
  },
  henContainer: {
    position: "absolute",
    bottom: 6,
    marginLeft: -18,
  },
  barnIcon: {
    position: "absolute",
    right: -2,
    bottom: 14,
  },
});
