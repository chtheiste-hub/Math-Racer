import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_KEY = "math_racer_preferences";

export type SessionMode = "questions" | "timed";
export type TrackerStyle = "racecar" | "chicken";

export interface Preferences {
  trackerStyle: TrackerStyle;
  mode: SessionMode;
  questionCount: number;
  timeLimit: number;
}

const DEFAULTS: Preferences = {
  trackerStyle: "racecar",
  mode: "questions",
  questionCount: 20,
  timeLimit: 120,
};

export async function loadPreferences(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      trackerStyle: parsed.trackerStyle === "chicken" ? "chicken" : "racecar",
      mode: parsed.mode === "timed" ? "timed" : "questions",
      questionCount: typeof parsed.questionCount === "number" ? parsed.questionCount : DEFAULTS.questionCount,
      timeLimit: typeof parsed.timeLimit === "number" ? parsed.timeLimit : DEFAULTS.timeLimit,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function savePreferences(prefs: Partial<Preferences>): Promise<void> {
  try {
    const current = await loadPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch {}
}
