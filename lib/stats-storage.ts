import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "math_racer_stats";
const SESSIONS_KEY = "math_racer_sessions";

export interface TableStats {
  table: number;
  totalAttempts: number;
  totalCorrect: number;
  recentSessions: { date: string; correct: number; total: number; percentage: number }[];
}

export interface SessionRecord {
  id: string;
  date: string;
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

async function loadStats(): Promise<AllTimeStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { tables: {}, totalSessions: 0, totalQuestions: 0, totalCorrect: 0 };
}

async function saveStats(stats: AllTimeStats): Promise<void> {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

async function loadSessions(): Promise<SessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw);
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
  bestStreak: number
): Promise<void> {
  const stats = await loadStats();
  const sessions = await loadSessions();

  const now = new Date().toISOString();
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const tableBreakdown: Record<number, { correct: number; total: number }> = {};
  for (const r of results) {
    const t = r.question.a;
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

  await Promise.all([saveStats(stats), saveSessions(sessions)]);
}

export async function getStats(): Promise<AllTimeStats> {
  return loadStats();
}

export async function getSessions(): Promise<SessionRecord[]> {
  return loadSessions();
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
  await Promise.all([
    AsyncStorage.removeItem(STATS_KEY),
    AsyncStorage.removeItem(SESSIONS_KEY),
  ]);
}
