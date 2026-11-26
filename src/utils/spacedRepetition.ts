import {
  ClinicalCase,
  DeckFilter,
  DrugMonograph,
  PlayerProgress,
  Specialty,
  SrsRecord,
} from '../types/pharma';
import { SPECIALTY_META } from '../data/drugs';
import { getTodayDateKey } from './daily';
import { buildQuickReviewDeck } from './quickReview';

const ALL_SPECIALTIES: Specialty[] = [
  'cardiorenal',
  'infectious',
  'cns',
  'endocrine_gi',
  'respiratory',
  'hematology_immune',
  'musculoskeletal_derm',
  'reproductive_sensory',
  'ai_informatics',
];

export function addDaysToDateKey(dateKey: string, days: number): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return dateKey;
  }
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
  return dt.toISOString().slice(0, 10);
}

function updateSingleSrsRecord(
  prev: SrsRecord | undefined,
  itemId: string,
  kind: 'case' | 'drug',
  specialty: Specialty,
  isCorrect: boolean,
  hintsUsed: number,
  todayKey: string
): SrsRecord {
  const nowIso = new Date().toISOString();
  const baseEase = prev?.easeFactor ?? 2.5;

  if (!isCorrect) {
    return {
      itemId,
      kind,
      specialty,
      dueDate: todayKey, // Immediately due for same-day / next-queue review
      intervalDays: 0,
      easeFactor: Math.max(1.3, Number((baseEase - 0.2).toFixed(2))),
      repetitions: 0,
      lapses: (prev?.lapses ?? 0) + 1,
      lastReviewedAt: nowIso,
      lastResult: 'missed',
    };
  }

  const prevReps = prev?.repetitions ?? 0;
  const prevInterval = prev?.intervalDays ?? 0;
  const hintPenalty = hintsUsed > 0 ? 0.1 * hintsUsed : 0;
  const nextEase = Math.max(
    1.3,
    Number((baseEase + (hintsUsed === 0 ? 0.08 : -hintPenalty)).toFixed(2))
  );

  let nextInterval: number;
  if (prevReps === 0) {
    nextInterval = hintsUsed > 0 ? 1 : 2;
  } else if (prevReps === 1) {
    nextInterval = 4;
  } else {
    nextInterval = Math.max(2, Math.round(prevInterval * nextEase));
  }

  return {
    itemId,
    kind,
    specialty,
    dueDate: addDaysToDateKey(todayKey, nextInterval),
    intervalDays: nextInterval,
    easeFactor: nextEase,
    repetitions: prevReps + 1,
    lapses: prev?.lapses ?? 0,
    lastReviewedAt: nowIso,
    lastResult: 'correct',
  };
}

export function computeNextStudyStreak(
  prevStreak: number,
  lastStudyDate: string | undefined,
  todayKey: string
): { studyStreakDays: number; lastStudyDate: string } {
  if (!lastStudyDate) {
    return { studyStreakDays: 1, lastStudyDate: todayKey };
  }
  if (lastStudyDate === todayKey) {
    return {
      studyStreakDays: Math.max(1, prevStreak),
      lastStudyDate: todayKey,
    };
  }
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  if (lastStudyDate === yesterdayKey) {
    return {
      studyStreakDays: Math.max(1, prevStreak) + 1,
      lastStudyDate: todayKey,
    };
  }
  return { studyStreakDays: 1, lastStudyDate: todayKey };
}

export function applySrsUpdate(
  progress: PlayerProgress,
  clinicalCase: ClinicalCase,
  isCorrect: boolean,
  hintsUsed: number,
  todayKey = getTodayDateKey()
): Pick<
  PlayerProgress,
  'srsByCaseId' | 'srsByDrugId' | 'studyStreakDays' | 'lastStudyDate'
> {
  const prevCaseMap = progress.srsByCaseId ?? {};
  const prevDrugMap = progress.srsByDrugId ?? {};

  const nextCaseMap = clinicalCase.isCustomStudy || clinicalCase.isQuickReview
    ? prevCaseMap
    : {
        ...prevCaseMap,
        [clinicalCase.id]: updateSingleSrsRecord(
          prevCaseMap[clinicalCase.id],
          clinicalCase.id,
          'case',
          clinicalCase.specialty,
          isCorrect,
          hintsUsed,
          todayKey
        ),
      };

  const nextDrugMap = clinicalCase.isCustomStudy
    ? prevDrugMap
    : {
        ...prevDrugMap,
        [clinicalCase.correctDrugId]: updateSingleSrsRecord(
          prevDrugMap[clinicalCase.correctDrugId],
          clinicalCase.correctDrugId,
          'drug',
          clinicalCase.specialty,
          isCorrect,
          hintsUsed,
          todayKey
        ),
      };

  const streakUpdate = computeNextStudyStreak(
    progress.studyStreakDays ?? 0,
    progress.lastStudyDate,
    todayKey
  );

  return {
    srsByCaseId: nextCaseMap,
    srsByDrugId: nextDrugMap,
    ...streakUpdate,
  };
}

export interface DueTodaySummary {
  dueCases: ClinicalCase[];
  dueCaseRecords: SrsRecord[];
  dueDrugIds: string[];
  unmasteredDrugs: DrugMonograph[];
  totalDueCount: number;
}

export function getDueTodaySummary(
  progress: PlayerProgress,
  allCases: readonly ClinicalCase[],
  allDrugs: readonly DrugMonograph[],
  todayKey = getTodayDateKey()
): DueTodaySummary {
  const caseMap = new Map(allCases.map((c) => [c.id, c]));
  const srsCases = Object.values(progress.srsByCaseId ?? {});
  const dueCaseRecords = srsCases
    .filter((rec) => rec.dueDate <= todayKey && caseMap.has(rec.itemId))
    .sort((a, b) => {
      // Missed items & more lapses come first, then oldest due date
      if (a.lastResult !== b.lastResult) {
        return a.lastResult === 'missed' ? -1 : 1;
      }
      if (a.lapses !== b.lapses) return b.lapses - a.lapses;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const dueCases = dueCaseRecords
    .map((r) => caseMap.get(r.itemId))
    .filter((c): c is ClinicalCase => Boolean(c));

  const masteredSet = new Set(progress.masteredDrugIds);
  const srsDrugs = Object.values(progress.srsByDrugId ?? {});
  const dueDrugIds = srsDrugs
    .filter((rec) => rec.dueDate <= todayKey)
    .sort((a, b) => b.lapses - a.lapses)
    .map((r) => r.itemId);

  const unmasteredDrugs = allDrugs.filter((d) => !masteredSet.has(d.id));

  // Total actionable items due today: scheduled due cases + due drugs (deduplicated conceptually by counting due cases + up to remaining unmastered/due drugs)
  const scheduledDrugOnly = dueDrugIds.filter(
    (id) => !dueCases.some((c) => c.correctDrugId === id)
  );
  const totalDueCount =
    dueCases.length +
    scheduledDrugOnly.length +
    (dueCases.length === 0 && scheduledDrugOnly.length === 0
      ? Math.min(5, unmasteredDrugs.length)
      : 0);

  return {
    dueCases,
    dueCaseRecords,
    dueDrugIds,
    unmasteredDrugs,
    totalDueCount,
  };
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildDueReviewDeck(
  progress: PlayerProgress,
  allCases: readonly ClinicalCase[],
  allDrugs: readonly DrugMonograph[],
  specialtyFilter: DeckFilter = 'all',
  todayKey = getTodayDateKey()
): ClinicalCase[] {
  const summary = getDueTodaySummary(progress, allCases, allDrugs, todayKey);
  const TARGET_DECK_SIZE = 8;

  const filteredDueCases =
    specialtyFilter === 'all'
      ? summary.dueCases
      : summary.dueCases.filter((c) => c.specialty === specialtyFilter);

  const otherDueCases =
    specialtyFilter === 'all'
      ? []
      : summary.dueCases.filter((c) => c.specialty !== specialtyFilter);

  const selectedCases = [...filteredDueCases, ...otherDueCases]
    .slice(0, TARGET_DECK_SIZE)
    .map((c) => ({
      ...c,
      cardIds: shuffle(c.cardIds) as [string, string, string, string],
    }));

  if (selectedCases.length < TARGET_DECK_SIZE) {
    const needed = TARGET_DECK_SIZE - selectedCases.length;
    const coveredDrugIds = new Set(selectedCases.map((c) => c.correctDrugId));
    const moaPool = buildQuickReviewDeck(
      allDrugs,
      progress.masteredDrugIds,
      specialtyFilter
    ).filter((c) => !coveredDrugIds.has(c.correctDrugId));

    selectedCases.push(...moaPool.slice(0, needed));
  }

  return selectedCases;
}

export interface SpecialtyAnalyticsRow {
  specialty: Specialty;
  label: string;
  shortLabel: string;
  masteredCount: number;
  totalDrugs: number;
  masteryPct: number;
  solvedCount: number;
  attemptCount: number;
  accuracyPct: number | null;
  dueCount: number;
}

export function computeSpecialtyAnalytics(
  progress: PlayerProgress,
  allCases: readonly ClinicalCase[],
  allDrugs: readonly DrugMonograph[],
  todayKey = getTodayDateKey()
): {
  rows: SpecialtyAnalyticsRow[];
  weakestSpecialty: SpecialtyAnalyticsRow | null;
  overallAccuracyPct: number | null;
} {
  const masteredSet = new Set(progress.masteredDrugIds);
  const outcomes = progress.solvedOutcomes ?? [];
  const summary = getDueTodaySummary(progress, allCases, allDrugs, todayKey);

  const rows: SpecialtyAnalyticsRow[] = ALL_SPECIALTIES.map((specialty) => {
    const meta = SPECIALTY_META[specialty];
    const drugsInSpec = allDrugs.filter((d) => d.specialty === specialty);
    const masteredCount = drugsInSpec.filter((d) => masteredSet.has(d.id)).length;
    const masteryPct =
      drugsInSpec.length > 0
        ? Math.round((masteredCount / drugsInSpec.length) * 100)
        : 0;

    const specOutcomes = outcomes.filter((o) => o.specialty === specialty);
    const attemptCount = specOutcomes.length;
    const solvedCount = specOutcomes.filter((o) => o.isCorrect).length;
    const accuracyPct =
      attemptCount > 0 ? Math.round((solvedCount / attemptCount) * 100) : null;

    const dueCount =
      summary.dueCases.filter((c) => c.specialty === specialty).length +
      summary.unmasteredDrugs.filter((d) => d.specialty === specialty).length;

    return {
      specialty,
      label: meta.label,
      shortLabel: meta.shortLabel,
      masteredCount,
      totalDrugs: drugsInSpec.length,
      masteryPct,
      solvedCount,
      attemptCount,
      accuracyPct,
      dueCount,
    };
  });

  // Identify weakest specialty: lowest accuracy (with attempts) or lowest mastery %
  const sortedWeak = [...rows].sort((a, b) => {
    const scoreA =
      a.accuracyPct !== null ? a.accuracyPct * 0.6 + a.masteryPct * 0.4 : a.masteryPct;
    const scoreB =
      b.accuracyPct !== null ? b.accuracyPct * 0.6 + b.masteryPct * 0.4 : b.masteryPct;
    return scoreA - scoreB;
  });

  const overallAccuracyPct =
    progress.totalCasesAttempted > 0
      ? Math.round((progress.totalCasesSolved / progress.totalCasesAttempted) * 100)
      : null;

  return {
    rows,
    weakestSpecialty: sortedWeak[0] ?? null,
    overallAccuracyPct,
  };
}
