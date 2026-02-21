import AsyncStorage from "@react-native-async-storage/async-storage";

export type PracticeType = "multiplication" | "division" | "addition" | "subtraction";

const STATS_KEY_PREFIX = "math_racer_stats";
const SESSIONS_KEY = "math_racer_sessions";

function statsKeyFor(practiceType: PracticeType): string {
  return `${STATS_KEY_PREFIX}_${practiceType}`;
}

export interface TableStats {
  table: number;
  totalAttempts: number;
  totalCorrect: number;
  recentSessions: { date: string; correct: number; total: number; percentage: number }[];
}

export interface SessionRecord {
  id: string;
  date: string;
  practiceType: PracticeType;
  tables: number[];
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  elapsed: number;
  bestStreak: number;
  tableBreakdown: { table: number; correct: number; total: number }[];
}

export interface AllTimeStats {
  tables: Record<number, TableStats>;
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
}

async function loadStats(practiceType: PracticeType): Promise<AllTimeStats> {
  try {
    const raw = await AsyncStorage.getItem(statsKeyFor(practiceType));
    if (raw) return JSON.parse(raw);
    if (practiceType === "multiplication") {
      const legacy = await AsyncStorage.getItem("math_racer_stats");
      if (legacy) {
        const data = JSON.parse(legacy);
        await AsyncStorage.setItem(statsKeyFor("multiplication"), legacy);
        await AsyncStorage.removeItem("math_racer_stats");
        return data;
      }
    }
  } catch {}
  return { tables: {}, totalSessions: 0, totalQuestions: 0, totalCorrect: 0 };
}

async function saveStats(practiceType: PracticeType, stats: AllTimeStats): Promise<void> {
  await AsyncStorage.setItem(statsKeyFor(practiceType), JSON.stringify(stats));
}

async function loadSessions(): Promise<SessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionRecord[];
      return parsed.map((s) => ({
        ...s,
        practiceType: s.practiceType || "multiplication",
      }));
    }
  } catch {}
  return [];
}

async function saveSessions(sessions: SessionRecord[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function saveSessionResults(
  results: { question: { a: number; b: number; answer: number }; userAnswer: number; correct: boolean }[],
  tables: number[],
  elapsed: number,
  bestStreak: number,
  practiceType: PracticeType = "multiplication"
): Promise<void> {
  const stats = await loadStats(practiceType);
  const sessions = await loadSessions();

  const now = new Date().toISOString();
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const tableBreakdown: Record<number, { correct: number; total: number }> = {};
  for (const r of results) {
    const t = practiceType === "division" ? r.question.b
      : (practiceType === "addition" || practiceType === "subtraction") ? tables[0]
      : r.question.a;
    if (!tableBreakdown[t]) tableBreakdown[t] = { correct: 0, total: 0 };
    tableBreakdown[t].total++;
    if (r.correct) tableBreakdown[t].correct++;
  }

  for (const [tableStr, data] of Object.entries(tableBreakdown)) {
    const table = parseInt(tableStr, 10);
    if (!stats.tables[table]) {
      stats.tables[table] = { table, totalAttempts: 0, totalCorrect: 0, recentSessions: [] };
    }
    stats.tables[table].totalAttempts += data.total;
    stats.tables[table].totalCorrect += data.correct;
    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    stats.tables[table].recentSessions.push({
      date: now,
      correct: data.correct,
      total: data.total,
      percentage: pct,
    });
    if (stats.tables[table].recentSessions.length > 20) {
      stats.tables[table].recentSessions = stats.tables[table].recentSessions.slice(-20);
    }
  }

  const totalCorrect = results.filter((r) => r.correct).length;

  stats.totalSessions++;
  stats.totalQuestions += results.length;
  stats.totalCorrect += totalCorrect;

  const session: SessionRecord = {
    id,
    date: now,
    practiceType,
    tables,
    totalQuestions: results.length,
    correctAnswers: totalCorrect,
    wrongAnswers: results.length - totalCorrect,
    accuracy: results.length > 0 ? Math.round((totalCorrect / results.length) * 100) : 0,
    elapsed,
    bestStreak,
    tableBreakdown: Object.entries(tableBreakdown).map(([t, d]) => ({
      table: parseInt(t, 10),
      ...d,
    })),
  };

  sessions.unshift(session);
  if (sessions.length > 50) sessions.length = 50;

  await Promise.all([saveStats(practiceType, stats), saveSessions(sessions)]);
}

export async function getStats(practiceType: PracticeType): Promise<AllTimeStats> {
  return loadStats(practiceType);
}

export async function getAllStats(): Promise<Record<PracticeType, AllTimeStats>> {
  const types: PracticeType[] = ["multiplication", "division", "addition", "subtraction"];
  const results = await Promise.all(types.map((t) => loadStats(t)));
  const out: Record<string, AllTimeStats> = {};
  types.forEach((t, i) => { out[t] = results[i]; });
  return out as Record<PracticeType, AllTimeStats>;
}

export async function getSessions(practiceType?: PracticeType): Promise<SessionRecord[]> {
  const all = await loadSessions();
  if (!practiceType) return all;
  return all.filter((s) => s.practiceType === practiceType);
}

export function getWeakTables(stats: AllTimeStats): { table: number; accuracy: number; trend: "improving" | "declining" | "stable" }[] {
  const results: { table: number; accuracy: number; trend: "improving" | "declining" | "stable" }[] = [];

  for (let t = 1; t <= 10; t++) {
    const tableData = stats.tables[t];
    if (!tableData || tableData.totalAttempts === 0) continue;

    const accuracy = Math.round((tableData.totalCorrect / tableData.totalAttempts) * 100);
    let trend: "improving" | "declining" | "stable" = "stable";

    const recent = tableData.recentSessions;
    if (recent.length >= 3) {
      const lastThree = recent.slice(-3);
      const firstHalf = lastThree.slice(0, Math.ceil(lastThree.length / 2));
      const secondHalf = lastThree.slice(Math.ceil(lastThree.length / 2));
      const avgFirst = firstHalf.reduce((s, r) => s + r.percentage, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, r) => s + r.percentage, 0) / secondHalf.length;

      if (avgSecond - avgFirst > 5) trend = "improving";
      else if (avgFirst - avgSecond > 5) trend = "declining";
    }

    results.push({ table: t, accuracy, trend });
  }

  return results.sort((a, b) => a.accuracy - b.accuracy);
}

export async function clearAllData(): Promise<void> {
  const types: PracticeType[] = ["multiplication", "division", "addition", "subtraction"];
  await Promise.all([
    ...types.map((t) => AsyncStorage.removeItem(statsKeyFor(t))),
    AsyncStorage.removeItem(SESSIONS_KEY),
  ]);
}
