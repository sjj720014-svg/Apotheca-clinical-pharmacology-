import { ClinicalCase, Specialty } from '../types/pharma';

const SPECIALTIES: Specialty[] = [
  'cardiorenal',
  'infectious',
  'cns',
  'endocrine_gi',
  'respiratory',
  'hematology_immune',
  'musculoskeletal_derm',
  'reproductive_sensory',
];

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Deterministically curates 5 cases for a given UTC calendar date:
 * 1 case from 4 rotating clinical specialties + 1 Board Prep / Clinical wildcard,
 * ensuring every player receives the exact same daily round and card order.
 */
export function buildDailyChallengeDeck(
  allCases: readonly ClinicalCase[],
  dateKey: string = getTodayDateKey()
): ClinicalCase[] {
  const rng = createRng(hashSeed(`apotheca-daily:${dateKey}`));
  const picked: ClinicalCase[] = [];
  const pickedIds = new Set<string>();

  const dailySpecialties = seededShuffle(SPECIALTIES, rng).slice(0, 4);
  for (const specialty of dailySpecialties) {
    const candidates = allCases.filter((c) => c.specialty === specialty);
    const ordered = seededShuffle(candidates, rng);
    if (ordered.length > 0) {
      picked.push(ordered[0]);
      pickedIds.add(ordered[0].id);
    }
  }

  const remaining = allCases.filter(
    (c) => !pickedIds.has(c.id) && c.difficulty !== 'Foundational'
  );
  const fallbackRemaining =
    remaining.length > 0
      ? remaining
      : allCases.filter((c) => !pickedIds.has(c.id));

  const wildcardPool = seededShuffle(fallbackRemaining, rng);
  if (wildcardPool.length > 0) {
    picked.push(wildcardPool[0]);
  }

  return seededShuffle(picked, rng).map((c) => ({
    ...c,
    cardIds: seededShuffle(c.cardIds, rng) as [string, string, string, string],
  }));
}
