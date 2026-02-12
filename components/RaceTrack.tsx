import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
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

  return <CarTrack progress={progress} total={total} characterStyle={characterStyle} progressBarStyle={progressBarStyle} />;
}

function CarTrack({ total, characterStyle, progressBarStyle }: {
  progress: number;
  total: number;
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

function ChickenTrack({ progress, total, characterStyle, progressBarStyle }: {
  progress: number;
  total: number;
  characterStyle: any;
  progressBarStyle: any;
}) {
  const seedPositions = [];
  const seedCount = Math.min(total, 30);
  for (let i = 0; i < seedCount; i++) {
    const pos = total > 0 ? ((i + 1) / total) * 100 : 0;
    const eaten = (i + 1) <= progress;
    seedPositions.push({ pos, eaten, key: i });
  }

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        <View style={[styles.track, chickenStyles.groundTrack]}>
          <Animated.View style={[styles.progressFill, chickenStyles.grassFill, progressBarStyle]} />
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
              <View style={chickenStyles.seedDot} />
            )}
          </View>
        ))}
        <Animated.View style={[styles.characterContainer, characterStyle]}>
          <View style={styles.characterIcon}>
            <MaterialCommunityIcons
              name="bird"
              size={28}
              color="#F4A261"
            />
          </View>
        </Animated.View>
        <View style={chickenStyles.barnIcon}>
          <MaterialCommunityIcons
            name="barn"
            size={18}
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
  groundTrack: {
    backgroundColor: "#3A2F1B",
    height: 8,
  },
  grassFill: {
    backgroundColor: "#5A8F3C",
    opacity: 0.5,
  },
  seed: {
    position: "absolute",
    top: 2,
    marginLeft: -3,
    width: 6,
    height: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  seedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E9C46A",
  },
  seedEaten: {
    opacity: 0,
  },
  barnIcon: {
    position: "absolute",
    right: -2,
    top: -22,
  },
});
