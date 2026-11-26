export type Specialty =
  | 'cardiorenal'
  | 'infectious'
  | 'cns'
  | 'endocrine_gi'
  | 'respiratory'
  | 'hematology_immune'
  | 'musculoskeletal_derm'
  | 'reproductive_sensory'
  | 'ai_informatics';

export type DeckFilter = Specialty | 'all';

export type CaseDifficulty = 'Foundational' | 'Clinical' | 'Board Prep';

export type DifficultyFilter = CaseDifficulty | 'all';

export type GameMode =
  | 'shift'
  | 'zen'
  | 'daily'
  | 'quick_review'
  | 'due_review'
  | 'timed_exam'
  | 'custom_study';

export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'COMPENDIUM'
  | 'SAFETY_SIM'
  | 'AUDIO_FLASHCARDS';

export type CaseMechanic =
  | 'prescribe_screen'
  | 'receptor_lock'
  | 'antidote_triage';

export type DosageForm =
  | 'tablet'
  | 'capsule'
  | 'iv_vial'
  | 'inhaler'
  | 'pen';

export interface Pharmacokinetics {
  bioavailability: string;
  halfLife: string;
  volumeOfDistribution: string;
  metabolism: string;
  excretion: string;
  proteinBinding: string;
  therapeuticTargetOrIndex?: string;
}

export interface DrugMonograph {
  id: string;
  genericName: string;
  brandNames: string;
  drugClass: string;
  chemicalClass: string;
  specialty: Specialty;
  dosageForm: DosageForm;
  molecularTarget: string;
  mechanism: string;
  pharmacokinetics: Pharmacokinetics;
  renalAndHepaticDosing: string;
  clinicalPearls: string;
  patientCounseling: string;
  contraindications: string;
  majorInteractions: string;
  monitoring: string;
  antidoteOrReversal?: string;
}

export interface LabMetric {
  label: string;
  value: string;
  flag?: 'high' | 'low' | 'normal';
}

export interface ClinicalCase {
  id: string;
  specialty: Specialty;
  mechanic: CaseMechanic;
  difficulty: CaseDifficulty;
  title: string;
  patientLine: string;
  presentation: string;
  labs: LabMetric[];
  activeMeds: string[];
  targetCue: string;
  promptQuestion: string;
  cardIds: [string, string, string, string];
  correctDrugId: string;
  distractorRationales: Record<string, string>;
  clinicalPearl: string;
  hints: [string, string, string];
  isQuickReview?: boolean;
  isCustomStudy?: boolean;
  sourceDocId?: string;
  sourceDocName?: string;
  citationNote?: string;
}

export interface CustomStudyDeck {
  docId: string;
  docName: string;
  mode: 'vignettes' | 'quick_review';
  generatedAt: string;
  cases: ClinicalCase[];
  drugs: DrugMonograph[];
}

export interface SrsRecord {
  itemId: string;
  kind: 'case' | 'drug';
  specialty: Specialty;
  dueDate: string; // YYYY-MM-DD
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string;
  lastResult: 'correct' | 'missed';
}

export interface CaseOutcome {
  caseId: string;
  caseTitle: string;
  specialty: Specialty;
  chosenDrugId: string;
  correctDrugId: string;
  isCorrect: boolean;
  hintsUsed: number;
  pointsEarned: number;
}

export interface SolvedOutcomeRecord extends CaseOutcome {
  gameMode: GameMode;
  solvedAt: string;
}

export type GeminiVoiceName = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export type VoiceProviderMode = 'gemini' | 'browser';

export interface PlayerProgress {
  masteredDrugIds: string[];
  totalCasesSolved: number;
  totalCasesAttempted: number;
  bestShiftScore: number;
  bestTimedExamScore?: number;
  dailyScore: number;
  dailyDate: string;
  bestStreak: number;
  studyStreakDays?: number;
  lastStudyDate?: string;
  perfectShiftsCompleted: number;
  unlockedAchievements: string[];
  solvedDilemmaIds: string[];
  solvedSafetyIds?: string[];
  bookmarkedCaseIds: string[];
  solvedOutcomes?: SolvedOutcomeRecord[];
  srsByCaseId?: Record<string, SrsRecord>;
  srsByDrugId?: Record<string, SrsRecord>;
}

export type PaipFactor =
  | 'augmented_healthcare'
  | 'ai_dehumanization'
  | 'information_misuse';

export interface PaipDilemmaCase {
  id: string;
  yearTier: 'Year 1 · Literacy' | 'Year 2 · Informatics' | 'Year 3 · CDSS & Ethics' | 'Year 4 · Capstone';
  paipFactor: PaipFactor;
  title: string;
  scenario: string;
  aiSystemNote: string;
  question: string;
  options: {
    label: string;
    isOptimal: boolean;
    feedback: string;
  }[];
  humanisticTakeaway: string;
}

export type SafetyScenarioCategory =
  | 'cyp450'
  | 'renal_dosing'
  | 'qtc_risk'
  | 'contraindication'
  | 'safe_verify';

export interface SafetyScenarioOption {
  id: string;
  label: string;
  actionType: 'adjust' | 'hold_switch' | 'contraindicated' | 'approve';
  isCorrect: boolean;
  rationale: string;
}

export interface SafetyScenario {
  id: string;
  category: SafetyScenarioCategory;
  specialty: Specialty;
  title: string;
  patientSummary: string;
  creatinineClearanceNote: string;
  labs: LabMetric[];
  activeMeds: string[];
  pendingOrder: string;
  promptQuestion: string;
  crclHint: string;
  options: SafetyScenarioOption[];
  clinicalReference: string;
}

export type AchievementCategory =
  | 'Clinical Performance'
  | 'Specialty Mastery'
  | 'Formulary';

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  getProgress: (progress: PlayerProgress) => AchievementProgress;
}

export interface StudyDocTopic {
  id: string;
  title: string;
  summary: string;
  keyTerms: string[];
}

export interface UploadedStudyDoc {
  id: string;
  displayName: string;
  fileFormatLabel: string;
  sizeBytes: number;
  uploadedAt: string;
  overview: string;
  initialExplanation: string;
  topics: StudyDocTopic[];
  suggestedQuestions: string[];
}

export interface StudyChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  topicTitle?: string;
  citationMode?: boolean;
  isAiGeneratedQuiz?: boolean;
}

export type BodySystemId =
  | 'cardiovascular'
  | 'respiratory'
  | 'nervous'
  | 'renal'
  | 'digestive'
  | 'endocrine'
  | 'immune'
  | 'hematologic'
  | 'musculoskeletal'
  | 'integumentary'
  | 'reproductive'
  | 'sensory';

export interface HumanBodySystem {
  id: BodySystemId;
  name: string;
  shortName: string;
  anatomicalScope: string;
  physiologySummary: string;
  keyReceptorsAndTargets: string[];
  diagnosticBiomarkers: string[];
  flagshipTherapies: string[];
  linkedDrugIds: string[];
  clinicalPearl: string;
  redFlagToxicities: string;
  relatedSpecialty: Specialty;
}

export type LiveUpdateCategory =
  | 'Guideline Update'
  | 'FDA Safety Alert'
  | 'New Approval'
  | 'Dosing & PK';

export interface LiveUpdateSource {
  title: string;
  uri: string;
}

export interface LiveClinicalUpdateItem {
  id: string;
  systemId: BodySystemId | 'general';
  systemLabel: string;
  category: LiveUpdateCategory;
  title: string;
  summary: string;
  clinicalImpact: string;
  affectedDrugs: string[];
  checkedAt: string;
  sources: LiveUpdateSource[];
}

export interface LiveUpdatesFeedState {
  autoUpdaterActive: boolean;
  isRefreshing: boolean;
  intervalHours: number;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  nextScheduledCheckAt: string | null;
  lastError: string | null;
  focusSystem: BodySystemId | 'all';
  updates: LiveClinicalUpdateItem[];
}

