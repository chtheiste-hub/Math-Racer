import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { fontScale, scale, maxContentWidth, numPadButtonSize } from "@/lib/responsive";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import RaceTrack, { type TrackerStyle } from "@/components/RaceTrack";
import { WebSlideView } from "@/lib/web-slide";
import { useTranslation } from "@/lib/language-context";

interface Question {
  a: number;
  b: number;
  answer: number;
}

type PracticeType = "multiplication" | "division" | "addition" | "subtraction";

function generateMultiplicationQuestion(tables: number[]): Question {
  const a = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a * b };
}

function generateDivisionQuestion(tables: number[]): Question {
  const divisor = tables[Math.floor(Math.random() * tables.length)];
  const quotient = Math.floor(Math.random() * 10) + 1;
  const dividend = divisor * quotient;
  return { a: dividend, b: divisor, answer: quotient };
}

function generateAdditionQuestion(category: string): Question {
  switch (category) {
    case "1": {
      const answer = Math.floor(Math.random() * 10) + 1;
      const a = Math.floor(Math.random() * answer) + 1;
      const b = answer - a;
      return { a: Math.max(a, 1), b: Math.max(b, 0), answer: a + Math.max(b, 0) };
    }
    case "2": {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = 10 - a;
      return { a, b, answer: b };
    }
    case "3": {
      const a = Math.floor(Math.random() * 7) + 2;
      const minB = 11 - a;
      const maxB = Math.min(9, 19 - a);
      const b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
      return { a, b, answer: a + b };
    }
    case "4": {
      const tens = (Math.floor(Math.random() * 8) + 1) * 10;
      const ones = Math.floor(Math.random() * 9) + 1;
      const a = tens + ones;
      const nextTen = tens + 10;
      const minB = nextTen - a;
      const maxB = Math.min(9, nextTen + 9 - a);
      const b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
      return { a, b, answer: a + b };
    }
    case "5":
    default: {
      const a = Math.floor(Math.random() * 89) + 11;
      const b = Math.floor(Math.random() * 89) + 11;
      return { a, b, answer: a + b };
    }
  }
}

function generateSubtractionQuestion(category: string): Question {
  switch (category) {
    case "1": {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      return { a, b, answer: a - b };
    }
    case "2": {
      const b = Math.floor(Math.random() * 9) + 1;
      return { a: 10, b, answer: 10 - b };
    }
    case "3": {
      const a = Math.floor(Math.random() * 9) + 11;
      const onesA = a % 10;
      const minB = onesA + 1;
      const maxB = Math.min(9, a - 1);
      const b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
      return { a, b, answer: a - b };
    }
    case "4": {
      const tens = (Math.floor(Math.random() * 8) + 2) * 10;
      const ones = Math.floor(Math.random() * 8) + 1;
      const a = tens + ones;
      const b = ones + Math.floor(Math.random() * (10 - ones)) + 1;
      return { a, b, answer: a - b };
    }
    case "5":
    default: {
      const b = Math.floor(Math.random() * 89) + 11;
      const a = b + Math.floor(Math.random() * 89) + 11;
      return { a, b, answer: a - b };
    }
  }
}

function generateQuestion(tables: number[], practiceType: PracticeType, categoryOverride?: string): Question {
  if (practiceType === "division") {
    return generateDivisionQuestion(tables);
  }
  if (practiceType === "addition") {
    return generateAdditionQuestion(categoryOverride || "1");
  }
  if (practiceType === "subtraction") {
    return generateSubtractionQuestion(categoryOverride || "1");
  }
  return generateMultiplicationQuestion(tables);
}

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tables: string;
    mode: string;
    questionCount: string;
    timeLimit: string;
    trackerStyle: string;
    practiceType: string;
    additionCategory: string;
    subtractionCategory: string;
  }>();

  const tables = (params.tables || "1").split(",").map(Number);
  const mode = params.mode || "questions";
  const totalQuestions = parseInt(params.questionCount || "20", 10);
  const timeLimit = parseInt(params.timeLimit || "0", 10);
  const trackerStyle = (params.trackerStyle || "racecar") as TrackerStyle;
  const practiceType = (params.practiceType || "multiplication") as PracticeType;
  const additionCategory = params.additionCategory || "1";
  const subtractionCategory = params.subtractionCategory || "1";
  const categoryOverride = practiceType === "subtraction" ? subtractionCategory : additionCategory;

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { strings } = useTranslation();

  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    generateQuestion(tables, practiceType, categoryOverride)
  );
  const [inputValue, setInputValue] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [results, setResults] = useState<
    { question: Question; userAnswer: number; correct: boolean }[]
  >([]);

  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shakeX = useSharedValue(0);
  const scaleCorrect = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const correctPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleCorrect.value }],
  }));

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
  }));

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      setElapsedTime(elapsed);

      if (mode === "timed") {
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeRemaining(remaining);
        if (remaining === 0) {
          finishSession();
        }
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleNumberPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const finishSession = useCallback(() => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (isFinished) {
      const finalElapsed = Math.floor((Date.now() - startTime.current) / 1000);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/results",
        params: {
          correct: correctAnswers.toString(),
          wrong: wrongAnswers.toString(),
          total: questionsAnswered.toString(),
          elapsed: finalElapsed.toString(),
          streak: streak.toString(),
          results: JSON.stringify(results),
          tables: params.tables,
          practiceType,
          additionCategory,
          subtractionCategory,
        },
      });
    }
  }, [isFinished]);

  const handleNumberPress = (num: string) => {
    if (isFinished || feedback) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue((prev) => {
      if (prev.length >= 3) return prev;
      return prev + num;
    });
  };

  const handleDelete = () => {
    if (isFinished || feedback) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (inputValue === "" || isFinished || feedback) return;

    const userAnswer = parseInt(inputValue, 10);
    const isCorrect = userAnswer === currentQuestion.answer;

    const result = {
      question: currentQuestion,
      userAnswer,
      correct: isCorrect,
    };

    setResults((prev) => [...prev, result]);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectAnswers((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setFeedback("correct");
      scaleCorrect.value = withSequence(
        withSpring(1.1, { damping: 4 }),
        withSpring(1)
      );
      feedbackOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrongAnswers((prev) => prev + 1);
      setStreak(0);
      setFeedback("wrong");
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      feedbackOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 600 })
      );
    }

    const newTotal = questionsAnswered + 1;
    setQuestionsAnswered(newTotal);

    setTimeout(() => {
      setFeedback(null);
      setInputValue("");
      if (mode === "questions" && newTotal >= totalQuestions) {
        finishSession();
      } else {
        setCurrentQuestion(generateQuestion(tables, practiceType, categoryOverride));
      }
    }, isCorrect ? 400 : 700);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressTotal = mode === "questions" ? totalQuestions : 1;
  const progressCurrent =
    mode === "questions"
      ? questionsAnswered
      : Math.min(1, elapsedTime / timeLimit);

  const numpadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["del", "0", "go"],
  ];

  return (
    <WebSlideView style={styles.screen}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundLight]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Pressable
          onPress={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.statText}>{correctAnswers}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="close-circle" size={14} color={Colors.error} />
            <Text style={styles.statText}>{wrongAnswers}</Text>
          </View>
          {streak >= 3 && (
            <View style={[styles.statBadge, styles.streakBadge]}>
              <MaterialCommunityIcons
                name="fire"
                size={14}
                color={Colors.accent}
              />
              <Text style={[styles.statText, { color: Colors.accent }]}>
                {streak}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.timerBadge}>
          <Ionicons name="timer-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.timerText}>
            {mode === "timed"
              ? formatTime(timeRemaining)
              : formatTime(elapsedTime)}
          </Text>
        </View>
      </View>

      <RaceTrack
        progress={mode === "questions" ? questionsAnswered : Math.floor((elapsedTime / timeLimit) * 100)}
        total={mode === "questions" ? totalQuestions : 100}
        trackerStyle={trackerStyle}
      />

      {mode === "questions" && (
        <Text style={styles.progressLabel}>
          {questionsAnswered} / {totalQuestions}
        </Text>
      )}

      <Animated.View style={[styles.questionArea, shakeStyle]}>
        <Animated.View style={correctPulseStyle}>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {practiceType === "addition" && additionCategory === "2"
                ? `${currentQuestion.a} + ? = 10`
                : `${currentQuestion.a} ${practiceType === "division" ? "\u00F7" : practiceType === "addition" ? "+" : practiceType === "subtraction" ? "\u2212" : "x"} ${currentQuestion.b}`}
            </Text>
            <View style={styles.equalsRow}>
              <Text style={styles.equalsSign}>=</Text>
              <View style={styles.answerBox}>
                <Text
                  style={[
                    styles.answerText,
                    inputValue === "" && styles.answerPlaceholder,
                    feedback === "correct" && { color: Colors.success },
                    feedback === "wrong" && { color: Colors.error },
                  ]}
                >
                  {inputValue || "?"}
                </Text>
              </View>
            </View>
            {feedback === "wrong" && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                style={styles.correctAnswerHint}
              >
                {strings.answer}: {currentQuestion.answer}
              </Animated.Text>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[styles.feedbackOverlay, feedbackStyle]}>
          {feedback === "correct" && (
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
          )}
          {feedback === "wrong" && (
            <Ionicons name="close-circle" size={48} color={Colors.error} />
          )}
        </Animated.View>
      </Animated.View>

      <View style={[styles.numpad, { paddingBottom: (insets.bottom || (Platform.OS === "web" ? 34 : 0)) + 12 }]}>
        {numpadRows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.numpadRow}>
            {row.map((key) => {
              if (key === "del") {
                return (
                  <Pressable
                    key={key}
                    onPress={handleDelete}
                    style={({ pressed }) => [
                      styles.numpadKey,
                      styles.numpadAction,
                      pressed && styles.numpadKeyPressed,
                    ]}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={24}
                      color={Colors.textSecondary}
                    />
                  </Pressable>
                );
              }
              if (key === "go") {
                return (
                  <Pressable
                    key={key}
                    onPress={handleSubmit}
                    style={({ pressed }) => [
                      styles.numpadKey,
                      styles.numpadGo,
                      pressed && styles.numpadGoPressed,
                      inputValue === "" && styles.numpadGoDisabled,
                    ]}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={24}
                      color={inputValue === "" ? Colors.textMuted : Colors.white}
                    />
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={key}
                  onPress={() => handleNumberPress(key)}
                  style={({ pressed }) => [
                    styles.numpadKey,
                    pressed && styles.numpadKeyPressed,
                  ]}
                >
                  <Text style={styles.numpadKeyText}>{key}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </WebSlideView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingBottom: scale(8),
    maxWidth: maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(12),
  },
  streakBadge: {
    backgroundColor: "rgba(244, 162, 97, 0.15)",
  },
  statText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(14),
    color: Colors.text,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(12),
  },
  timerText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(14),
    color: Colors.textSecondary,
  },
  progressLabel: {
    fontFamily: "Outfit_500Medium",
    fontSize: fontScale(13),
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: -4,
    marginBottom: 4,
  },
  questionArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(20),
    position: "relative",
  },
  questionCard: {
    alignItems: "center",
    gap: scale(8),
  },
  questionText: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: fontScale(48),
    color: Colors.text,
    letterSpacing: 2,
  },
  equalsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  equalsSign: {
    fontFamily: "Outfit_700Bold",
    fontSize: fontScale(36),
    color: Colors.textMuted,
  },
  answerBox: {
    minWidth: scale(100),
    borderBottomWidth: 3,
    borderBottomColor: Colors.secondaryLight,
    paddingHorizontal: scale(16),
    paddingVertical: 4,
    alignItems: "center",
  },
  answerText: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: fontScale(44),
    color: Colors.accent,
  },
  answerPlaceholder: {
    color: Colors.textMuted,
    opacity: 0.4,
  },
  correctAnswerHint: {
    fontFamily: "Outfit_500Medium",
    fontSize: fontScale(16),
    color: Colors.textMuted,
    marginTop: scale(8),
  },
  feedbackOverlay: {
    position: "absolute",
    top: 10,
    right: 30,
  },
  numpad: {
    paddingHorizontal: scale(24),
    gap: scale(8),
    maxWidth: maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  numpadRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  numpadKey: {
    flex: 1,
    height: scale(56),
    borderRadius: scale(14),
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numpadKeyPressed: {
    backgroundColor: Colors.surfaceLight,
    transform: [{ scale: 0.96 }],
  },
  numpadAction: {
    backgroundColor: Colors.surface,
  },
  numpadGo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  numpadGoPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.96 }],
  },
  numpadGoDisabled: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  numpadKeyText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: fontScale(24),
    color: Colors.text,
  },
});
