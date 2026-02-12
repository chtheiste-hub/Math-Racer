import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface RaceTrackProps {
  progress: number;
  total: number;
}

export default function RaceTrack({ progress, total }: RaceTrackProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const fraction = total > 0 ? progress / total : 0;
    animatedProgress.value = withSpring(fraction, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
  }, [progress, total]);

  const carStyle = useAnimatedStyle(() => {
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

  const markers = [];
  for (let i = 0; i <= total; i++) {
    const position = total > 0 ? (i / total) * 100 : 0;
    markers.push(
      <View
        key={i}
        style={[
          styles.marker,
          {
            left: `${position}%`,
            backgroundColor: i === 0 || i === total ? Colors.accent : Colors.trackGray,
            width: i === 0 || i === total ? 3 : 1,
          },
        ]}
      />
    );
  }

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
          {markers}
        </View>
        <Animated.View style={[styles.carContainer, carStyle]}>
          <View style={styles.carIcon}>
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
  marker: {
    position: "absolute",
    top: -2,
    height: 12,
    borderRadius: 1,
  },
  carContainer: {
    position: "absolute",
    top: -6,
    marginLeft: -14,
  },
  carIcon: {
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
