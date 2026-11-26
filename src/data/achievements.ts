import { AchievementDefinition, PlayerProgress, Specialty } from '../types/pharma';
import { DRUG_MAP } from './drugs';

function countMasteredInSpecialty(
  masteredDrugIds: string[],
  specialty: Specialty
): number {
  let count = 0;
  for (const id of masteredDrugIds) {
    if (DRUG_MAP[id]?.specialty === specialty) {
      count++;
    }
  }
  return count;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_prescription',
    title: 'First Prescription',
    description: 'Successfully resolve your first clinical case.',
    category: 'Clinical Performance',
    getProgress: (p) => ({
      current: Math.min(1, p.totalCasesSolved),
      target: 1,
    }),
  },
  {
    id: 'perfect_shift',
    title: 'Perfect Shift',
    description: 'Complete a 5-case Clinical Shift or Daily Challenge with 5/5 accuracy.',
    category: 'Clinical Performance',
    getProgress: (p) => ({
      current: Math.min(1, p.perfectShiftsCompleted),
      target: 1,
    }),
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Achieve a 5× consecutive therapeutic streak in a single round.',
    category: 'Clinical Performance',
    getProgress: (p) => ({
      current: Math.min(5, p.bestStreak),
      target: 5,
    }),
  },
  {
    id: 'daily_rounds',
    title: 'Daily Rounds',
    description: 'Score points in today’s shared Daily Challenge.',
    category: 'Clinical Performance',
    getProgress: (p) => ({
      current: p.dailyScore > 0 ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'cardiorenal_fellow',
    title: 'Cardiorenal Fellow',
    description: 'Master 6 Cardiovascular & Renal drug monographs.',
    category: 'Specialty Mastery',
    getProgress: (p) => ({
      current: Math.min(6, countMasteredInSpecialty(p.masteredDrugIds, 'cardiorenal')),
      target: 6,
    }),
  },
  {
    id: 'stewardship_specialist',
    title: 'Stewardship Specialist',
    description: 'Master 6 Infectious Disease drug monographs.',
    category: 'Specialty Mastery',
    getProgress: (p) => ({
      current: Math.min(6, countMasteredInSpecialty(p.masteredDrugIds, 'infectious')),
      target: 6,
    }),
  },
  {
    id: 'neuro_pharmacist',
    title: 'Neuropsych Pharmacist',
    description: 'Master 6 CNS, Pain & Psychiatry drug monographs.',
    category: 'Specialty Mastery',
    getProgress: (p) => ({
      current: Math.min(6, countMasteredInSpecialty(p.masteredDrugIds, 'cns')),
      target: 6,
    }),
  },
  {
    id: 'toxicology_responder',
    title: 'Toxicology Responder',
    description: 'Master 6 Endocrine, GI & Antidote drug monographs.',
    category: 'Specialty Mastery',
    getProgress: (p) => ({
      current: Math.min(6, countMasteredInSpecialty(p.masteredDrugIds, 'endocrine_gi')),
      target: 6,
    }),
  },
  {
    id: 'clinical_scholar',
    title: 'Clinical Scholar',
    description: 'Solve 25 clinical cases accurately across all study modes.',
    category: 'Formulary',
    getProgress: (p) => ({
      current: Math.min(25, p.totalCasesSolved),
      target: 25,
    }),
  },
  {
    id: 'pharmacology_expert',
    title: 'Pharmacology Expert',
    description: 'Master 25 distinct drug monographs in the Formulary Compendium.',
    category: 'Formulary',
    getProgress: (p) => ({
      current: Math.min(25, p.masteredDrugIds.length),
      target: 25,
    }),
  },
  {
    id: 'informatics_steward',
    title: 'Informatics Steward',
    description: 'Master 4 AI, PGx & Pharmacoinformatics drug monographs.',
    category: 'Specialty Mastery',
    getProgress: (p) => ({
      current: Math.min(4, countMasteredInSpecialty(p.masteredDrugIds, 'ai_informatics')),
      target: 4,
    }),
  },
  {
    id: 'ethical_guardian',
    title: 'Ethical Guardian',
    description: 'Resolve all 6 PAIP ethical & CDSS dilemmas in the AI & Ethics Lab.',
    category: 'Formulary',
    getProgress: (p) => ({
      current: Math.min(6, (p.solvedDilemmaIds ?? []).length),
      target: 6,
    }),
  },
];

export function evaluateUnlockedAchievements(
  progress: PlayerProgress
): string[] {
  const unlocked = new Set(progress.unlockedAchievements);
  for (const achievement of ACHIEVEMENTS) {
    const { current, target } = achievement.getProgress(progress);
    if (current >= target) {
      unlocked.add(achievement.id);
    }
  }
  return Array.from(unlocked);
}
