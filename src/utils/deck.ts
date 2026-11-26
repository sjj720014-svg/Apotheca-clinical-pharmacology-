import {
  CaseDifficulty,
  ClinicalCase,
  DeckFilter,
  DifficultyFilter,
} from '../types/pharma';

export interface DifficultyOption {
  id: DifficultyFilter;
  label: string;
  detail: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'all',
    label: 'All Levels',
    detail: 'Mixed Foundational, Clinical & Board Prep cases',
  },
  {
    id: 'Foundational',
    label: 'Novice',
    detail: 'Foundational · Core mechanisms & first-line choices',
  },
  {
    id: 'Clinical',
    label: 'Resident',
    detail: 'Clinical · Interactions, renal dosing & monitoring',
  },
  {
    id: 'Board Prep',
    label: 'Specialist',
    detail: 'Board Prep · Complex toxicities & therapeutic traps',
  },
];

export const DIFFICULTY_DISPLAY: Record<CaseDifficulty, string> = {
  Foundational: 'Novice (Foundational)',
  Clinical: 'Resident (Clinical)',
  'Board Prep': 'Specialist (Board Prep)',
};

export function filterClinicalCases(
  cases: ClinicalCase[],
  specialtyFilter: DeckFilter,
  difficultyFilter: DifficultyFilter
): ClinicalCase[] {
  return cases.filter((c) => {
    if (specialtyFilter !== 'all' && c.specialty !== specialtyFilter) {
      return false;
    }
    if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) {
      return false;
    }
    return true;
  });
}
