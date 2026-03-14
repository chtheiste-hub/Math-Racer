import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "no" | "en";

const LANGUAGE_KEY = "math_racer_language";

export async function loadLanguage(): Promise<Language> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved === "en") return "en";
    return "no";
  } catch {
    return "no";
  }
}

export async function saveLanguage(lang: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {}
}

export interface Translations {
  appTitle: string;
  whatToPractice: string;
  progressTracker: string;
  trackerRacecar: string;
  trackerHen: string;

  multiplication: string;
  multiplicationSubtitle: string;
  division: string;
  divisionSubtitle: string;
  addition: string;
  additionSubtitle: string;
  subtraction: string;
  subtractionSubtitle: string;

  pickTablesSubtitle: string;
  pickDivisorsSubtitle: string;
  chooseCategorySubtitle: string;

  practiceMode: string;
  byQuestions: string;
  timed: string;
  startRace: string;
  category: string;

  multiplicationTables: string;
  divisionTables: string;
  selectAll: string;
  clearAll: string;

  min1: string;
  min2: string;
  min3: string;
  min5: string;

  addCat1Title: string;
  addCat1Desc: string;
  addCat2Title: string;
  addCat2Desc: string;
  addCat3Title: string;
  addCat3Desc: string;
  addCat4Title: string;
  addCat4Desc: string;
  addCat5Title: string;
  addCat5Desc: string;

  subCat1Title: string;
  subCat1Desc: string;
  subCat2Title: string;
  subCat2Desc: string;
  subCat3Title: string;
  subCat3Desc: string;
  subCat4Title: string;
  subCat4Desc: string;
  subCat5Title: string;
  subCat5Desc: string;

  answer: string;

  correct: string;
  wrong: string;
  time: string;
  bestStreak: string;
  accuracy: string;

  gradePerfect: string;
  gradeGreat: string;
  gradeGood: string;
  gradeKeepPracticing: string;

  focusAreas: string;
  focusSubtext: string;
  practiceTheseTables: string;
  keepPracticing: string;
  keepPracticingSubtext: string;
  practiceAgain: string;
  perTable: string;
  reviewMistakes: string;
  raceAgain: string;

  statistics: string;
  noDataYet: string;
  emptySubtext: string;
  emptySubtextFiltered: string;
  startPracticing: string;
  sessions: string;
  questions: string;
  tables: string;
  categories: string;
  history: string;
  all: string;
  correctSuffix: string;
  table: string;
  categoryLabel: string;
  noTablesData: string;
  noCategoriesData: string;
  noSessionsYet: string;

  justNow: string;
  minutesAgo_one: string;
  minutesAgo_other: string;
  hoursAgo_one: string;
  hoursAgo_other: string;
  daysAgo_one: string;
  daysAgo_other: string;
}

const no: Translations = {
  appTitle: "Matte-Racer",
  whatToPractice: "Hva vil du øve på?",
  progressTracker: "Fremgangsindikator",
  trackerRacecar: "Racerbil",
  trackerHen: "Høne",

  multiplication: "Multiplikasjon",
  multiplicationSubtitle: "Øv på gangetabellene 1\u201310",
  division: "Divisjon",
  divisionSubtitle: "Del innenfor 10\u00d7-tabellene",
  addition: "Addisjon",
  additionSubtitle: "Fra små tall til tosifrede",
  subtraction: "Subtraksjon",
  subtractionSubtitle: "Fra små tall til tosifrede",

  pickTablesSubtitle: "Velg tabeller og start øvingen",
  pickDivisorsSubtitle: "Velg divisorer og start øvingen",
  chooseCategorySubtitle: "Velg en kategori og start øvingen",

  practiceMode: "Øvingsmodus",
  byQuestions: "Antall oppgaver",
  timed: "På tid",
  startRace: "Start løp",
  category: "Kategori",

  multiplicationTables: "Gangetabeller",
  divisionTables: "Divisjonstabeller",
  selectAll: "Velg alle",
  clearAll: "Fjern alle",

  min1: "1 min",
  min2: "2 min",
  min3: "3 min",
  min5: "5 min",

  addCat1Title: "Små tall",
  addCat1Desc: "Svarene er 10 eller mindre",
  addCat2Title: "Opp til 10",
  addCat2Desc: "Finn det manglende tallet for å få 10",
  addCat3Title: "Over tiergrensen",
  addCat3Desc: "Ensifrede tall som krysser 10 (svar 11\u201319)",
  addCat4Title: "Over hele tiere",
  addCat4Desc: "Kryss en tiergrense fra 10\u201389",
  addCat5Title: "Tosifrede tall",
  addCat5Desc: "To tosifrede tall lagt sammen",

  subCat1Title: "Små tall",
  subCat1Desc: "Subtraksjon innenfor 10",
  subCat2Title: "Trekk fra 10",
  subCat2Desc: "Trekk fra 10",
  subCat3Title: "Over tiergrensen",
  subCat3Desc: "Under 10 (start 11\u201319)",
  subCat4Title: "Over hele tiere",
  subCat4Desc: "Kryss en tiergrense nedover",
  subCat5Title: "Tosifrede tall",
  subCat5Desc: "To tosifrede tall subtrahert",

  answer: "Svar",

  correct: "Riktig",
  wrong: "Feil",
  time: "Tid",
  bestStreak: "Beste rekke",
  accuracy: "Nøyaktighet",

  gradePerfect: "Perfekt",
  gradeGreat: "Flott",
  gradeGood: "Bra",
  gradeKeepPracticing: "Øv videre",

  focusAreas: "Fokusområder",
  focusSubtext: "Disse tabellene trenger mer øving:",
  practiceTheseTables: "Øv på disse tabellene",
  keepPracticing: "Fortsett å øve",
  keepPracticingSubtext: "Prøv denne kategorien igjen for å forbedre poengsummen!",
  practiceAgain: "Øv igjen",
  perTable: "Per tabell",
  reviewMistakes: "Se gjennom feil",
  raceAgain: "Kjør igjen",

  statistics: "Statistikk",
  noDataYet: "Ingen data ennå",
  emptySubtext: "Fullfør en øvingsøkt for å se statistikken din her",
  emptySubtextFiltered: "Fullfør en øvingsøkt for å se statistikken din her",
  startPracticing: "Start øving",
  sessions: "Økter",
  questions: "Oppgaver",
  tables: "Tabeller",
  categories: "Kategorier",
  history: "Historikk",
  all: "Alle",
  correctSuffix: "riktig",
  table: "tabell",
  categoryLabel: "Kategori",
  noTablesData: "Ingen øvingsdata registrert for noen tabeller ennå",
  noCategoriesData: "Ingen øvingsdata registrert for noen kategorier ennå",
  noSessionsYet: "Ingen økter registrert ennå",

  justNow: "Akkurat nå",
  minutesAgo_one: "for {count} minutt siden",
  minutesAgo_other: "for {count} minutter siden",
  hoursAgo_one: "for {count} time siden",
  hoursAgo_other: "for {count} timer siden",
  daysAgo_one: "for {count} dag siden",
  daysAgo_other: "for {count} dager siden",
};

const en: Translations = {
  appTitle: "Math Racer",
  whatToPractice: "What do you want to practice?",
  progressTracker: "Progress Tracker",
  trackerRacecar: "Racecar",
  trackerHen: "Hen",

  multiplication: "Multiplication",
  multiplicationSubtitle: "Master your times tables 1\u201310",
  division: "Division",
  divisionSubtitle: "Divide within the 10\u00d7 tables",
  addition: "Addition",
  additionSubtitle: "From small numbers to double digits",
  subtraction: "Subtraction",
  subtractionSubtitle: "From small numbers to double digits",

  pickTablesSubtitle: "Pick your tables and start practicing",
  pickDivisorsSubtitle: "Pick your divisors and start practicing",
  chooseCategorySubtitle: "Choose a category and start practicing",

  practiceMode: "Practice Mode",
  byQuestions: "By Questions",
  timed: "Timed",
  startRace: "Start Race",
  category: "Category",

  multiplicationTables: "Multiplication Tables",
  divisionTables: "Division Tables",
  selectAll: "Select All",
  clearAll: "Clear All",

  min1: "1 min",
  min2: "2 min",
  min3: "3 min",
  min5: "5 min",

  addCat1Title: "Small Numbers",
  addCat1Desc: "Answers are 10 or less",
  addCat2Title: "Adds Up to 10",
  addCat2Desc: "Find the missing number to make 10",
  addCat3Title: "Passing 10",
  addCat3Desc: "Single digits that cross 10 (answers 11\u201319)",
  addCat4Title: "Passing Whole Tens",
  addCat4Desc: "Cross a tens boundary from 10\u201389",
  addCat5Title: "Double Digits",
  addCat5Desc: "Two double-digit numbers added together",

  subCat1Title: "Small Numbers",
  subCat1Desc: "Subtract within 10",
  subCat2Title: "Subtract from 10",
  subCat2Desc: "Take away from 10",
  subCat3Title: "Passing 10",
  subCat3Desc: "Cross below 10 (start 11\u201319)",
  subCat4Title: "Passing Whole Tens",
  subCat4Desc: "Cross a tens boundary downward",
  subCat5Title: "Double Digits",
  subCat5Desc: "Two double-digit numbers subtracted",

  answer: "Answer",

  correct: "Correct",
  wrong: "Wrong",
  time: "Time",
  bestStreak: "Best Streak",
  accuracy: "Accuracy",

  gradePerfect: "Perfect",
  gradeGreat: "Great",
  gradeGood: "Good",
  gradeKeepPracticing: "Keep Practicing",

  focusAreas: "Focus Areas",
  focusSubtext: "These tables need more practice:",
  practiceTheseTables: "Practice These Tables",
  keepPracticing: "Keep Practicing",
  keepPracticingSubtext: "Try this category again to improve your score!",
  practiceAgain: "Practice Again",
  perTable: "Per Table",
  reviewMistakes: "Review Mistakes",
  raceAgain: "Race Again",

  statistics: "Statistics",
  noDataYet: "No data yet",
  emptySubtext: "Complete a practice session to see your statistics here",
  emptySubtextFiltered: "Complete a practice session to see your statistics here",
  startPracticing: "Start Practicing",
  sessions: "Sessions",
  questions: "Questions",
  tables: "Tables",
  categories: "Categories",
  history: "History",
  all: "All",
  correctSuffix: "correct",
  table: "Table",
  categoryLabel: "Category",
  noTablesData: "No practice data recorded yet for any tables",
  noCategoriesData: "No practice data recorded yet for any categories",
  noSessionsYet: "No sessions recorded yet",

  justNow: "Just now",
  minutesAgo_one: "{count}m ago",
  minutesAgo_other: "{count}m ago",
  hoursAgo_one: "{count}h ago",
  hoursAgo_other: "{count}h ago",
  daysAgo_one: "{count}d ago",
  daysAgo_other: "{count}d ago",
};

export const translations: Record<Language, Translations> = { no, en };

export function t(
  strings: Translations,
  key: string,
  vars?: Record<string, string | number>
): string {
  let result: string;
  const s = strings as Record<string, string>;

  if (vars && typeof vars.count === "number") {
    const pluralKey = vars.count === 1 ? `${key}_one` : `${key}_other`;
    if (pluralKey in s) {
      result = s[pluralKey];
    } else {
      result = s[key] || key;
    }
  } else {
    result = s[key] || key;
  }

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }

  return result;
}
