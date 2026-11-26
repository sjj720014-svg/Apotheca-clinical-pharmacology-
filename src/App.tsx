/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BodySystemId,
  CaseOutcome,
  ClinicalCase,
  CustomStudyDeck,
  DeckFilter,
  DifficultyFilter,
  DrugMonograph,
  GameMode,
  GameState,
  GeminiVoiceName,
  LiveUpdatesFeedState,
  PlayerProgress,
  SolvedOutcomeRecord,
  Specialty,
  StudyChatMessage,
  UploadedStudyDoc,
  VoiceProviderMode,
} from './types/pharma';
import { DRUG_MAP, DRUG_MONOGRAPHS } from './data/drugs';
import { CLINICAL_CASES } from './data/cases';
import { evaluateUnlockedAchievements } from './data/achievements';
import { soundEngine } from './utils/sound';
import { AmbientPreset, ambientMusic } from './utils/ambientMusic';
import { voiceEngine } from './utils/voice';
import { buildDailyChallengeDeck, getTodayDateKey } from './utils/daily';
import { filterClinicalCases } from './utils/deck';
import { buildQuickReviewDeck } from './utils/quickReview';
import { applySrsUpdate, buildDueReviewDeck } from './utils/spacedRepetition';
import {
  downloadProgressBackup,
  pickRandomClinicalPearl,
  syncProgressToBrowserCache,
} from './utils/progressBackup';
import {
  fetchLiveClinicalUpdates,
  loadAutoUpdateEnabled,
  loadCachedLiveUpdates,
  persistLiveUpdatesLocally,
  saveAutoUpdateEnabled,
  triggerLiveClinicalRefresh,
} from './utils/liveUpdater';
import { TitleScreen } from './components/TitleScreen';
import { GameBoard } from './components/GameBoard';
import { PauseModal } from './components/PauseModal';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { CompendiumModal, CompendiumSection } from './components/CompendiumModal';
import { SafetySimulatorModal } from './components/SafetySimulatorModal';
import { AudioFlashcardsModal } from './components/AudioFlashcardsModal';
import { StudyAudioProps } from './components/StudyAudioPopover';
import { ClinicalPearlToast, PearlToastData } from './components/ClinicalPearlToast';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  ApothecaThemeId,
  applyThemeToDocument,
  loadSavedThemeId,
  saveThemeId,
} from './utils/themes';

const STORAGE_KEY = 'apotheca_progress_v1';
const AUDIO_STORAGE_KEY = 'apotheca_audio_v1';
const SHIFT_CASE_COUNT = 5;
const TIMED_EXAM_CASE_COUNT = 10;
const TIMED_EXAM_SECONDS = 12 * 60; // 12:00 NAPLEX/OSCE sprint
const MAX_STORED_OUTCOMES = 150;

interface AudioPrefs {
  muted: boolean;
  voiceEnabled: boolean;
  voiceProvider: VoiceProviderMode;
  hasExplicitProvider: boolean;
  geminiVoice: GeminiVoiceName;
  browserVoiceURI: string | null;
  speechRate: number;
  musicEnabled: boolean;
  musicVolume: number;
  musicPreset: AmbientPreset;
}

function loadAudioPrefs(): AudioPrefs {
  const defaults: AudioPrefs = {
    muted: false,
    voiceEnabled: true,
    voiceProvider: 'gemini',
    hasExplicitProvider: false,
    geminiVoice: 'Kore',
    browserVoiceURI: null,
    speechRate: 0.98,
    musicEnabled: false,
    musicVolume: 0.45,
    musicPreset: 'felt_pads',
  };
  try {
    const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>;
    const hasExplicitProvider =
      parsed.voiceProvider === 'gemini' || parsed.voiceProvider === 'browser';
    return {
      muted: Boolean(parsed.muted),
      voiceEnabled: parsed.voiceEnabled !== false,
      voiceProvider: parsed.voiceProvider === 'browser' ? 'browser' : 'gemini',
      hasExplicitProvider,
      geminiVoice:
        parsed.geminiVoice &&
        ['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'].includes(
          parsed.geminiVoice
        )
          ? parsed.geminiVoice
          : 'Kore',
      browserVoiceURI:
        typeof parsed.browserVoiceURI === 'string' && parsed.browserVoiceURI
          ? parsed.browserVoiceURI
          : null,
      speechRate:
        typeof parsed.speechRate === 'number'
          ? Math.max(0.75, Math.min(1.3, parsed.speechRate))
          : 0.98,
      musicEnabled: Boolean(parsed.musicEnabled),
      musicVolume:
        typeof parsed.musicVolume === 'number'
          ? Math.max(0, Math.min(1, parsed.musicVolume))
          : 0.45,
      musicPreset:
        parsed.musicPreset === 'deep_drone' ||
        parsed.musicPreset === 'library_rain'
          ? parsed.musicPreset
          : 'felt_pads',
    };
  } catch {
    return defaults;
  }
}

function createDefaultProgress(): PlayerProgress {
  return {
    masteredDrugIds: [],
    totalCasesSolved: 0,
    totalCasesAttempted: 0,
    bestShiftScore: 0,
    bestTimedExamScore: 0,
    dailyScore: 0,
    dailyDate: getTodayDateKey(),
    bestStreak: 0,
    studyStreakDays: 0,
    lastStudyDate: undefined,
    perfectShiftsCompleted: 0,
    unlockedAchievements: [],
    solvedDilemmaIds: [],
    solvedSafetyIds: [],
    bookmarkedCaseIds: [],
    solvedOutcomes: [],
    srsByCaseId: {},
    srsByDrugId: {},
  };
}

function loadProgress(): PlayerProgress {
  const today = getTodayDateKey();
  const fallback = createDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    const isSameDay = parsed.dailyDate === today;
    const loaded: PlayerProgress = {
      masteredDrugIds: Array.isArray(parsed.masteredDrugIds)
        ? parsed.masteredDrugIds
        : [],
      totalCasesSolved: Number(parsed.totalCasesSolved) || 0,
      totalCasesAttempted: Number(parsed.totalCasesAttempted) || 0,
      bestShiftScore: Number(parsed.bestShiftScore) || 0,
      bestTimedExamScore: Number(parsed.bestTimedExamScore) || 0,
      dailyScore: isSameDay ? Number(parsed.dailyScore) || 0 : 0,
      dailyDate: today,
      bestStreak: Number(parsed.bestStreak) || 0,
      studyStreakDays: Number(parsed.studyStreakDays) || 0,
      lastStudyDate:
        typeof parsed.lastStudyDate === 'string'
          ? parsed.lastStudyDate
          : undefined,
      perfectShiftsCompleted: Number(parsed.perfectShiftsCompleted) || 0,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
      solvedDilemmaIds: Array.isArray(parsed.solvedDilemmaIds)
        ? parsed.solvedDilemmaIds
        : [],
      solvedSafetyIds: Array.isArray(parsed.solvedSafetyIds)
        ? parsed.solvedSafetyIds
        : [],
      bookmarkedCaseIds: Array.isArray(parsed.bookmarkedCaseIds)
        ? parsed.bookmarkedCaseIds
        : [],
      solvedOutcomes: Array.isArray(parsed.solvedOutcomes)
        ? parsed.solvedOutcomes
        : [],
      srsByCaseId:
        parsed.srsByCaseId && typeof parsed.srsByCaseId === 'object'
          ? parsed.srsByCaseId
          : {},
      srsByDrugId:
        parsed.srsByDrugId && typeof parsed.srsByDrugId === 'object'
          ? parsed.srsByDrugId
          : {},
    };
    loaded.unlockedAchievements = evaluateUnlockedAchievements(loaded);
    return loaded;
  } catch {
    return fallback;
  }
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCaseDeck(
  specialtyFilter: DeckFilter,
  difficultyFilter: DifficultyFilter,
  mode: GameMode,
  progress: PlayerProgress
): ClinicalCase[] {
  if (mode === 'daily') {
    return buildDailyChallengeDeck(CLINICAL_CASES, getTodayDateKey());
  }
  if (mode === 'quick_review') {
    return buildQuickReviewDeck(
      DRUG_MONOGRAPHS,
      progress.masteredDrugIds,
      specialtyFilter
    );
  }
  if (mode === 'due_review') {
    return buildDueReviewDeck(
      progress,
      CLINICAL_CASES,
      DRUG_MONOGRAPHS,
      specialtyFilter
    );
  }
  if (mode === 'timed_exam') {
    const basePool = filterClinicalCases(
      CLINICAL_CASES,
      specialtyFilter,
      'all'
    );
    const boardWeighted = basePool.filter(
      (c) => c.difficulty === 'Board Prep' || c.difficulty === 'Clinical'
    );
    const remaining = basePool.filter(
      (c) => c.difficulty === 'Foundational'
    );
    const combined = [
      ...shuffleArray(boardWeighted),
      ...shuffleArray(remaining),
    ].slice(0, Math.min(TIMED_EXAM_CASE_COUNT, basePool.length));
    return combined.map((c) => ({
      ...c,
      cardIds: shuffleArray(c.cardIds) as [string, string, string, string],
    }));
  }
  const pool = filterClinicalCases(
    CLINICAL_CASES,
    specialtyFilter,
    difficultyFilter
  );
  const shuffledCases = shuffleArray(pool).map((c) => ({
    ...c,
    cardIds: shuffleArray(c.cardIds) as [string, string, string, string],
  }));
  return mode === 'shift'
    ? shuffledCases.slice(0, Math.min(SHIFT_CASE_COUNT, shuffledCases.length))
    : shuffledCases;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [compendiumReturnTo, setCompendiumReturnTo] = useState<
    'TITLE_MENU' | 'PAUSED'
  >('TITLE_MENU');
  const [compendiumSection, setCompendiumSection] =
    useState<CompendiumSection>('monographs');

  const [selectedDeck, setSelectedDeck] = useState<DeckFilter>('all');
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter>('all');
  const [gameMode, setGameMode] = useState<GameMode>('shift');
  const [audioPrefs] = useState(loadAudioPrefs);
  const [muted, setMuted] = useState<boolean>(audioPrefs.muted);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(audioPrefs.voiceEnabled);
  const [voiceProvider, setVoiceProvider] = useState<VoiceProviderMode>(
    audioPrefs.voiceProvider
  );
  const [geminiVoice, setGeminiVoice] = useState<GeminiVoiceName>(
    audioPrefs.geminiVoice
  );
  const [browserVoiceURI, setBrowserVoiceURI] = useState<string | null>(
    audioPrefs.browserVoiceURI
  );
  const [speechRate, setSpeechRate] = useState<number>(audioPrefs.speechRate);
  const [geminiTtsAvailable, setGeminiTtsAvailable] = useState<boolean | null>(
    null
  );
  const [musicEnabled, setMusicEnabled] = useState<boolean>(audioPrefs.musicEnabled);
  const [musicVolume, setMusicVolume] = useState<number>(audioPrefs.musicVolume);
  const [musicPreset, setMusicPreset] = useState<AmbientPreset>(audioPrefs.musicPreset);
  const [themeId, setThemeId] = useState<ApothecaThemeId>(loadSavedThemeId);
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);

  // Uploaded study docs, generated custom study decks & chat history kept for the active session
  const [studyDocs, setStudyDocs] = useState<UploadedStudyDoc[]>([]);
  const [activeStudyDocId, setActiveStudyDocId] = useState<string | null>(null);
  const [studyChatsByDocId, setStudyChatsByDocId] = useState<
    Record<string, StudyChatMessage[]>
  >({});
  const [customDecks, setCustomDecks] = useState<CustomStudyDeck[]>([]);
  const [activeCustomDeck, setActiveCustomDeck] =
    useState<CustomStudyDeck | null>(null);
  const [subModalReturnTo, setSubModalReturnTo] = useState<
    'TITLE_MENU' | 'COMPENDIUM'
  >('TITLE_MENU');

  // Active run state
  const [caseQueue, setCaseQueue] = useState<ClinicalCase[]>([]);
  const [caseIndex, setCaseIndex] = useState<number>(0);
  const [stability, setStability] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [dimmedCardIds, setDimmedCardIds] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<CaseOutcome[]>([]);
  const [runUnlockedAchievements, setRunUnlockedAchievements] = useState<string[]>([]);
  const [examSecondsLeft, setExamSecondsLeft] = useState<number | null>(null);
  const [resolution, setResolution] = useState<{
    chosenDrugId: string;
    isCorrect: boolean;
    pointsEarned: number;
    stabilityDelta: number;
  } | null>(null);
  const [pearlToast, setPearlToast] = useState<PearlToastData | null>(null);
  const [liveFeed, setLiveFeed] = useState<LiveUpdatesFeedState>(
    loadCachedLiveUpdates
  );
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(
    loadAutoUpdateEnabled
  );
  const [isLiveRefreshing, setIsLiveRefreshing] = useState<boolean>(false);
  const [liveRefreshError, setLiveRefreshError] = useState<string | null>(null);

  const lastSpokenCaseKeyRef = useRef<string | null>(null);
  const lastPearlTextRef = useRef<string | undefined>(undefined);
  const latestProgressRef = useRef<PlayerProgress>(progress);
  const liveRefreshInFlightRef = useRef<boolean>(false);

  const customDrugMap = useMemo<Record<string, DrugMonograph>>(() => {
    const map: Record<string, DrugMonograph> = {};
    for (const deck of customDecks) {
      for (const drug of deck.drugs) {
        map[drug.id] = drug;
      }
    }
    return map;
  }, [customDecks]);

  const customCaseMap = useMemo<Record<string, ClinicalCase>>(() => {
    const map: Record<string, ClinicalCase> = {};
    for (const deck of customDecks) {
      for (const c of deck.cases) {
        map[c.id] = c;
      }
    }
    return map;
  }, [customDecks]);

  useEffect(() => {
    let active = true;
    fetch('/api/tts/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { available?: boolean } | null) => {
        if (!active || !data) return;
        const available = Boolean(data.available);
        setGeminiTtsAvailable(available);
        if (
          !audioPrefs.hasExplicitProvider &&
          !available &&
          voiceEngine.isBrowserSpeechSupported()
        ) {
          setVoiceProvider('browser');
        }
      })
      .catch(() => {
        // Ignore network status probe errors
      });
    return () => {
      active = false;
    };
  }, [audioPrefs.hasExplicitProvider]);

  useEffect(() => {
    soundEngine.setMuted(muted);
    voiceEngine.setMuted(muted);
    voiceEngine.setAutoVoiceEnabled(voiceEnabled);
    voiceEngine.setProvider(voiceProvider);
    voiceEngine.setGeminiVoice(geminiVoice);
    voiceEngine.setBrowserVoiceURI(browserVoiceURI);
    voiceEngine.setSpeechRate(speechRate);
    ambientMusic.configure({
      muted,
      enabled: musicEnabled,
      volume: musicVolume,
      preset: musicPreset,
    });
    try {
      localStorage.setItem(
        AUDIO_STORAGE_KEY,
        JSON.stringify({
          muted,
          voiceEnabled,
          voiceProvider,
          geminiVoice,
          browserVoiceURI,
          speechRate,
          musicEnabled,
          musicVolume,
          musicPreset,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [
    muted,
    voiceEnabled,
    voiceProvider,
    geminiVoice,
    browserVoiceURI,
    speechRate,
    musicEnabled,
    musicVolume,
    musicPreset,
  ]);

  useEffect(() => {
    latestProgressRef.current = progress;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
    void syncProgressToBrowserCache(progress);
  }, [progress]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void syncProgressToBrowserCache(latestProgressRef.current);
    }, 180_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const runLiveUpdateRefresh = useCallback(
    async (focusSystem: BodySystemId | 'all' = 'all') => {
      if (liveRefreshInFlightRef.current) return;
      liveRefreshInFlightRef.current = true;
      setIsLiveRefreshing(true);
      setLiveRefreshError(null);
      try {
        const updated = await triggerLiveClinicalRefresh(focusSystem);
        setLiveFeed(updated);
        void persistLiveUpdatesLocally(updated);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to reach live update service.';
        setLiveRefreshError(msg);
      } finally {
        liveRefreshInFlightRef.current = false;
        setIsLiveRefreshing(false);
      }
    },
    []
  );

  // Continuous 24/7 clinical information sync & auto-refresh loop
  useEffect(() => {
    let active = true;
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

    const syncFromServer = async () => {
      try {
        const serverFeed = await fetchLiveClinicalUpdates();
        if (!active) return;
        setLiveFeed((prev) => {
          const merged =
            serverFeed.updates.length > 0 || prev.updates.length === 0
              ? serverFeed
              : { ...serverFeed, updates: prev.updates };
          void persistLiveUpdatesLocally(merged);
          return merged;
        });

        const lastSuccessMs = serverFeed.lastSuccessAt
          ? new Date(serverFeed.lastSuccessAt).getTime()
          : 0;
        const needsAutoRefresh =
          autoUpdateEnabled &&
          !serverFeed.isRefreshing &&
          (!lastSuccessMs ||
            Date.now() - lastSuccessMs >= SIX_HOURS_MS ||
            serverFeed.updates.length === 0);

        if (needsAutoRefresh) {
          void runLiveUpdateRefresh('all');
        }
      } catch {
        // Silent background probe failure; user can still trigger Refresh manually
      }
    };

    void syncFromServer();
    const pollTimer = window.setInterval(() => {
      void syncFromServer();
    }, 600_000); // Check every 10 minutes 24/7

    return () => {
      active = false;
      window.clearInterval(pollTimer);
    };
  }, [autoUpdateEnabled, runLiveUpdateRefresh]);

  const handleToggleAutoUpdate = useCallback(() => {
    setAutoUpdateEnabled((prev) => {
      const next = !prev;
      saveAutoUpdateEnabled(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      voiceEngine.stop();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || gameMode !== 'timed_exam') return;
    if (examSecondsLeft === null) return;
    if (examSecondsLeft <= 0) {
      soundEngine.playShiftDepleted();
      setGameState('GAME_OVER');
      return;
    }
    const timer = window.setInterval(() => {
      setExamSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameState, gameMode, examSecondsLeft]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      voiceEngine.setMuted(next);
      ambientMusic.setMuted(next);
      if (!next) {
        soundEngine.playUiTick();
      }
      return next;
    });
  }, []);

  const handleToggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      voiceEngine.setAutoVoiceEnabled(next);
      soundEngine.playUiTick();
      return next;
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    soundEngine.playUiTick();
    setMusicEnabled((prev) => {
      const next = !prev;
      if (next && muted) {
        setMuted(false);
        soundEngine.setMuted(false);
        voiceEngine.setMuted(false);
        ambientMusic.setMuted(false);
      }
      ambientMusic.setEnabled(next);
      return next;
    });
  }, [muted]);

  const studyAudioProps: StudyAudioProps = {
    muted,
    voiceEnabled,
    musicEnabled,
    musicVolume,
    musicPreset,
    voiceProvider,
    geminiVoice,
    browserVoiceURI,
    speechRate,
    geminiTtsAvailable,
    onToggleVoice: handleToggleVoice,
    onToggleMusic: handleToggleMusic,
    onChangeMusicVolume: setMusicVolume,
    onChangeMusicPreset: setMusicPreset,
    onChangeVoiceProvider: setVoiceProvider,
    onChangeGeminiVoice: setGeminiVoice,
    onChangeBrowserVoiceURI: setBrowserVoiceURI,
    onChangeSpeechRate: setSpeechRate,
  };

  const handleAddStudyDoc = useCallback((doc: UploadedStudyDoc) => {
    setStudyDocs((prev) => [doc, ...prev]);
    setActiveStudyDocId(doc.id);
  }, []);

  const handleRemoveStudyDoc = useCallback((docId: string) => {
    setStudyDocs((prev) => {
      const next = prev.filter((d) => d.id !== docId);
      setActiveStudyDocId((curr) =>
        curr === docId ? next[0]?.id ?? null : curr
      );
      return next;
    });
    setStudyChatsByDocId((prev) => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  }, []);

  const handleAppendStudyChatMessages = useCallback(
    (docId: string, messages: StudyChatMessage[]) => {
      setStudyChatsByDocId((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] ?? []), ...messages],
      }));
    },
    []
  );

  const handleCustomDeckGenerated = useCallback((deck: CustomStudyDeck) => {
    setCustomDecks((prev) => [deck, ...prev]);
  }, []);

  useEffect(() => {
    applyThemeToDocument(themeId);
    saveThemeId(themeId);
  }, [themeId]);

  const handleSelectTheme = useCallback((nextThemeId: ApothecaThemeId) => {
    setThemeId(nextThemeId);
  }, []);

  const handleSolveSafetyScenario = useCallback((scenarioId: string) => {
    setProgress((prev) => {
      const current = prev.solvedSafetyIds ?? [];
      if (current.includes(scenarioId)) return prev;
      return {
        ...prev,
        solvedSafetyIds: [...current, scenarioId],
      };
    });
  }, []);

  const handleSolveDilemma = useCallback((dilemmaId: string) => {
    setProgress((prev) => {
      if (prev.solvedDilemmaIds.includes(dilemmaId)) {
        return prev;
      }
      const draft: PlayerProgress = {
        ...prev,
        solvedDilemmaIds: [...prev.solvedDilemmaIds, dilemmaId],
      };
      const updatedUnlocked = evaluateUnlockedAchievements(draft);
      const newlyEarned = updatedUnlocked.filter(
        (id) => !prev.unlockedAchievements.includes(id)
      );
      if (newlyEarned.length > 0) {
        window.setTimeout(() => soundEngine.playAchievementUnlock(), 280);
      }
      return {
        ...draft,
        unlockedAchievements: updatedUnlocked,
      };
    });
  }, []);

  const handleToggleBookmarkCase = useCallback((caseId: string) => {
    soundEngine.playUiTick();
    setProgress((prev) => {
      const current = prev.bookmarkedCaseIds ?? [];
      const exists = current.includes(caseId);
      return {
        ...prev,
        bookmarkedCaseIds: exists
          ? current.filter((id) => id !== caseId)
          : [...current, caseId],
      };
    });
  }, []);

  const handleShowRandomPearlToast = useCallback(() => {
    const pearl = pickRandomClinicalPearl(lastPearlTextRef.current);
    lastPearlTextRef.current = pearl.pearlText;
    setPearlToast({
      ...pearl,
      toastKey: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    });
  }, []);

  const handleBackupProgress = useCallback(() => {
    soundEngine.playUiTick();
    return downloadProgressBackup(latestProgressRef.current);
  }, []);

  const startCustomStudyRun = useCallback((deck: CustomStudyDeck) => {
    if (!deck || deck.cases.length === 0) return;
    const preparedCases = deck.cases.map((c) => ({
      ...c,
      cardIds: shuffleArray(c.cardIds) as [string, string, string, string],
    }));
    lastSpokenCaseKeyRef.current = null;
    setActiveCustomDeck(deck);
    setGameMode('custom_study');
    setCaseQueue(preparedCases);
    setCaseIndex(0);
    setStability(100);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedCardId(null);
    setHintsRevealed(0);
    setDimmedCardIds([]);
    setOutcomes([]);
    setRunUnlockedAchievements([]);
    setExamSecondsLeft(null);
    setResolution(null);
    setPearlToast(null);
    setGameState('PLAYING');
    soundEngine.playShiftStart();
  }, []);

  const startDueReviewRun = useCallback(
    (specialtyOverride?: Specialty) => {
      const deckFilter: DeckFilter = specialtyOverride ?? selectedDeck;
      const deck = buildDueReviewDeck(
        progress,
        CLINICAL_CASES,
        DRUG_MONOGRAPHS,
        deckFilter
      );
      if (deck.length === 0) return;
      lastSpokenCaseKeyRef.current = null;
      setActiveCustomDeck(null);
      setGameMode('due_review');
      setCaseQueue(deck);
      setCaseIndex(0);
      setStability(100);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setSelectedCardId(null);
      setHintsRevealed(0);
      setDimmedCardIds([]);
      setOutcomes([]);
      setRunUnlockedAchievements([]);
      setExamSecondsLeft(null);
      setResolution(null);
      setPearlToast(null);
      setGameState('PLAYING');
      soundEngine.playShiftStart();
    },
    [progress, selectedDeck]
  );

  const startNewRun = useCallback(() => {
    if (gameMode === 'custom_study' && activeCustomDeck) {
      startCustomStudyRun(activeCustomDeck);
      return;
    }
    const deck = buildCaseDeck(
      selectedDeck,
      selectedDifficulty,
      gameMode,
      progress
    );
    lastSpokenCaseKeyRef.current = null;
    setCaseQueue(deck);
    setCaseIndex(0);
    setStability(100);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedCardId(null);
    setHintsRevealed(0);
    setDimmedCardIds([]);
    setOutcomes([]);
    setRunUnlockedAchievements([]);
    setExamSecondsLeft(
      gameMode === 'timed_exam' ? TIMED_EXAM_SECONDS : null
    );
    setResolution(null);
    setPearlToast(null);
    setGameState('PLAYING');
    soundEngine.playShiftStart();
  }, [
    gameMode,
    activeCustomDeck,
    startCustomStudyRun,
    selectedDeck,
    selectedDifficulty,
    progress,
  ]);

  const startBookmarkedRun = useCallback(() => {
    const savedSet = new Set(progress.bookmarkedCaseIds ?? []);
    const savedCases = CLINICAL_CASES.filter((c) => savedSet.has(c.id));
    if (savedCases.length === 0) return;

    const deck = shuffleArray(savedCases).map((c) => ({
      ...c,
      cardIds: shuffleArray(c.cardIds) as [string, string, string, string],
    }));

    lastSpokenCaseKeyRef.current = null;
    setActiveCustomDeck(null);
    setGameMode('zen');
    setCaseQueue(deck);
    setCaseIndex(0);
    setStability(100);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedCardId(null);
    setHintsRevealed(0);
    setDimmedCardIds([]);
    setOutcomes([]);
    setRunUnlockedAchievements([]);
    setExamSecondsLeft(null);
    setResolution(null);
    setPearlToast(null);
    setGameState('PLAYING');
    soundEngine.playShiftStart();
  }, [progress.bookmarkedCaseIds]);

  const currentCase = caseQueue[caseIndex] ?? null;

  useEffect(() => {
    if (gameState !== 'PLAYING' || !currentCase || resolution) return;
    const key = `${caseIndex}:${currentCase.id}`;
    if (lastSpokenCaseKeyRef.current === key) return;
    lastSpokenCaseKeyRef.current = key;
    if (voiceEnabled && !muted) {
      voiceEngine.speakCase(currentCase);
    }
  }, [gameState, currentCase, caseIndex, resolution, voiceEnabled, muted]);

  const handleSelectCard = useCallback((drugId: string) => {
    setSelectedCardId(drugId);
    soundEngine.playCardSelect();
  }, []);

  const handleRequestHint = useCallback(() => {
    if (
      !currentCase ||
      resolution ||
      hintsRevealed >= 3 ||
      gameMode === 'timed_exam'
    ) {
      return;
    }
    const nextTier = hintsRevealed + 1;
    setHintsRevealed(nextTier);
    soundEngine.playHintReveal();
    voiceEngine.speakHint(currentCase.hints[nextTier - 1], nextTier);

    // Tier 3 eliminates two incorrect cards from the table
    if (nextTier === 3) {
      const distractors = currentCase.cardIds.filter(
        (id) => id !== currentCase.correctDrugId
      );
      const toDim = shuffleArray(distractors).slice(0, 2);
      setDimmedCardIds(toDim);
      if (selectedCardId && toDim.includes(selectedCardId)) {
        setSelectedCardId(null);
      }
    }
  }, [currentCase, resolution, hintsRevealed, selectedCardId]);

  const handlePlayCard = useCallback(
    (drugId: string) => {
      if (!currentCase || resolution) return;
      const isCorrect = drugId === currentCase.correctDrugId;
      const nextStreak = isCorrect ? streak + 1 : 0;

      const isScoredChallenge = gameMode === 'shift' || gameMode === 'daily';
      const hintPenalty = isScoredChallenge ? hintsRevealed * 35 : 0;
      const pointsEarned = isCorrect
        ? Math.max(100, 250 + streak * 50 - hintPenalty)
        : 0;
      const stabilityDelta = !isCorrect && isScoredChallenge ? -25 : 0;

      const nextStability = Math.max(0, stability + stabilityDelta);
      const nextScore = score + pointsEarned;
      const todayKey = getTodayDateKey();

      setResolution({
        chosenDrugId: drugId,
        isCorrect,
        pointsEarned,
        stabilityDelta,
      });
      setScore(nextScore);
      setStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
      setStability(nextStability);

      const currentOutcome: CaseOutcome = {
        caseId: currentCase.id,
        caseTitle: currentCase.title,
        specialty: currentCase.specialty,
        chosenDrugId: drugId,
        correctDrugId: currentCase.correctDrugId,
        isCorrect,
        hintsUsed: hintsRevealed,
        pointsEarned,
      };
      const nextOutcomes: CaseOutcome[] = [...outcomes, currentOutcome];
      setOutcomes(nextOutcomes);

      const newOutcomeRecord: SolvedOutcomeRecord = {
        ...currentOutcome,
        gameMode,
        solvedAt: new Date().toISOString(),
      };

      const completedPerfectScoredRound =
        isScoredChallenge &&
        caseIndex + 1 >= caseQueue.length &&
        nextOutcomes.length === SHIFT_CASE_COUNT &&
        nextOutcomes.every((o) => o.isCorrect);

      setProgress((prev) => {
        const shouldRecordMastery =
          isCorrect &&
          !currentCase.isCustomStudy &&
          Boolean(DRUG_MAP[currentCase.correctDrugId]) &&
          !prev.masteredDrugIds.includes(currentCase.correctDrugId);
        const mastered = shouldRecordMastery
          ? [...prev.masteredDrugIds, currentCase.correctDrugId]
          : prev.masteredDrugIds;
        const prevDailyForToday =
          prev.dailyDate === todayKey ? prev.dailyScore : 0;
        const nextSolvedOutcomes = [
          newOutcomeRecord,
          ...(prev.solvedOutcomes ?? []),
        ].slice(0, MAX_STORED_OUTCOMES);
        const srsPatch = applySrsUpdate(
          prev,
          currentCase,
          isCorrect,
          hintsRevealed,
          todayKey
        );
        const draft: PlayerProgress = {
          ...prev,
          ...srsPatch,
          masteredDrugIds: mastered,
          totalCasesSolved: prev.totalCasesSolved + (isCorrect ? 1 : 0),
          totalCasesAttempted: prev.totalCasesAttempted + 1,
          bestShiftScore:
            gameMode === 'shift'
              ? Math.max(prev.bestShiftScore, nextScore)
              : prev.bestShiftScore,
          bestTimedExamScore:
            gameMode === 'timed_exam'
              ? Math.max(prev.bestTimedExamScore ?? 0, nextScore)
              : prev.bestTimedExamScore ?? 0,
          dailyScore:
            gameMode === 'daily'
              ? Math.max(prevDailyForToday, nextScore)
              : prevDailyForToday,
          dailyDate: todayKey,
          bestStreak: Math.max(prev.bestStreak, nextStreak),
          perfectShiftsCompleted:
            prev.perfectShiftsCompleted + (completedPerfectScoredRound ? 1 : 0),
          unlockedAchievements: prev.unlockedAchievements,
          solvedDilemmaIds: prev.solvedDilemmaIds,
          solvedSafetyIds: prev.solvedSafetyIds ?? [],
          bookmarkedCaseIds: prev.bookmarkedCaseIds ?? [],
          solvedOutcomes: nextSolvedOutcomes,
        };
        const updatedUnlocked = evaluateUnlockedAchievements(draft);
        const newlyEarned = updatedUnlocked.filter(
          (id) => !prev.unlockedAchievements.includes(id)
        );
        if (newlyEarned.length > 0) {
          setRunUnlockedAchievements((curr) =>
            Array.from(new Set([...curr, ...newlyEarned]))
          );
          window.setTimeout(() => soundEngine.playAchievementUnlock(), 300);
        }
        return {
          ...draft,
          unlockedAchievements: updatedUnlocked,
        };
      });

      if (isCorrect) {
        soundEngine.playTherapeuticMatch(nextStreak);
      } else {
        soundEngine.playAdversePulse(nextStability <= 25);
      }
      const correctDrug =
        customDrugMap[currentCase.correctDrugId] ??
        DRUG_MAP[currentCase.correctDrugId];
      const chosenDrug =
        customDrugMap[drugId] ?? DRUG_MAP[drugId] ?? null;
      if (correctDrug) {
        voiceEngine.speakResolution(
          isCorrect,
          correctDrug,
          chosenDrug,
          currentCase
        );
      }
    },
    [
      currentCase,
      resolution,
      streak,
      gameMode,
      hintsRevealed,
      stability,
      score,
      outcomes,
      caseIndex,
      caseQueue.length,
      customDrugMap,
    ]
  );

  const handleNextCase = useCallback(() => {
    if (!currentCase) return;
    voiceEngine.stop();

    const failedChallenge =
      (gameMode === 'shift' || gameMode === 'daily') && stability <= 0;
    const finishedQueue = caseIndex + 1 >= caseQueue.length;

    if (failedChallenge || finishedQueue) {
      setGameState('GAME_OVER');
      if (failedChallenge) {
        soundEngine.playShiftDepleted();
      } else {
        soundEngine.playShiftVictory();
        if (gameMode === 'shift') {
          handleShowRandomPearlToast();
        }
      }
      return;
    }

    soundEngine.playCardDeal();
    setCaseIndex((prev) => prev + 1);
    setSelectedCardId(null);
    setHintsRevealed(0);
    setDimmedCardIds([]);
    setResolution(null);
  }, [
    currentCase,
    gameMode,
    stability,
    caseIndex,
    caseQueue.length,
    handleShowRandomPearlToast,
  ]);

  let screenView: React.ReactNode = null;

  if (gameState === 'SAFETY_SIM') {
    screenView = (
      <SafetySimulatorModal
        solvedSafetyIds={progress.solvedSafetyIds ?? []}
        muted={muted}
        audioProps={studyAudioProps}
        themeId={themeId}
        onSelectTheme={handleSelectTheme}
        onSolveScenario={handleSolveSafetyScenario}
        onToggleMute={handleToggleMute}
        onBack={() => setGameState(subModalReturnTo)}
      />
    );
  } else if (gameState === 'AUDIO_FLASHCARDS') {
    screenView = (
      <AudioFlashcardsModal
        progress={progress}
        studyDocs={studyDocs}
        customDecks={customDecks}
        muted={muted}
        audioProps={studyAudioProps}
        themeId={themeId}
        onSelectTheme={handleSelectTheme}
        onToggleMute={handleToggleMute}
        onBack={() => setGameState(subModalReturnTo)}
      />
    );
  } else if (gameState === 'COMPENDIUM') {
    screenView = (
      <CompendiumModal
        progress={progress}
        muted={muted}
        audioProps={studyAudioProps}
        themeId={themeId}
        onSelectTheme={handleSelectTheme}
        initialSection={compendiumSection}
        aiAssistantAvailable={geminiTtsAvailable}
        studyDocs={studyDocs}
        activeStudyDocId={activeStudyDocId}
        studyChatsByDocId={studyChatsByDocId}
        customDecks={customDecks}
        customDrugMap={customDrugMap}
        customCaseMap={customCaseMap}
        onSelectStudyDoc={setActiveStudyDocId}
        onAddStudyDoc={handleAddStudyDoc}
        onRemoveStudyDoc={handleRemoveStudyDoc}
        onAppendStudyChatMessages={handleAppendStudyChatMessages}
        onCustomDeckGenerated={handleCustomDeckGenerated}
        onPlayCustomDeck={startCustomStudyRun}
        onStartDueReview={startDueReviewRun}
        onOpenSafetySim={() => {
          setSubModalReturnTo('COMPENDIUM');
          setGameState('SAFETY_SIM');
        }}
        onOpenAudioFlashcards={() => {
          setSubModalReturnTo('COMPENDIUM');
          setGameState('AUDIO_FLASHCARDS');
        }}
        onSolveDilemma={handleSolveDilemma}
        onToggleBookmarkCase={handleToggleBookmarkCase}
        onPracticeBookmarks={startBookmarkedRun}
        onBackupProgress={handleBackupProgress}
        liveFeed={liveFeed}
        autoUpdateEnabled={autoUpdateEnabled}
        isLiveRefreshing={isLiveRefreshing}
        liveRefreshError={liveRefreshError}
        onToggleAutoUpdate={handleToggleAutoUpdate}
        onRefreshLiveUpdates={(focus) => {
          void runLiveUpdateRefresh(focus ?? 'all');
        }}
        onBack={() => setGameState(compendiumReturnTo)}
      />
    );
  } else if (gameState === 'GAME_OVER') {
    const elapsedSeconds =
      gameMode === 'timed_exam' && examSecondsLeft !== null
        ? Math.max(0, TIMED_EXAM_SECONDS - examSecondsLeft)
        : null;
    const examTimeElapsedLabel =
      elapsedSeconds !== null
        ? `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(
            elapsedSeconds % 60
          ).padStart(2, '0')}`
        : undefined;

    screenView = (
      <ShiftSummaryModal
        outcomes={outcomes}
        score={score}
        maxStreak={maxStreak}
        stability={stability}
        gameMode={gameMode}
        dailyScore={progress.dailyScore}
        newlyUnlockedAchievements={runUnlockedAchievements}
        masteredDrugIds={progress.masteredDrugIds}
        progress={progress}
        customDrugMap={customDrugMap}
        customDecks={customDecks}
        customCaseMap={customCaseMap}
        examTimeElapsedLabel={examTimeElapsedLabel}
        onToggleBookmarkCase={handleToggleBookmarkCase}
        onBackupProgress={handleBackupProgress}
        onPlayAgain={startNewRun}
        onReturnTitle={() => {
          setGameMode((prev) => (prev === 'custom_study' ? 'shift' : prev));
          setGameState('TITLE_MENU');
        }}
      />
    );
  } else if (gameState === 'TITLE_MENU' || !currentCase) {
    screenView = (
      <TitleScreen
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
        gameMode={gameMode === 'custom_study' ? 'shift' : gameMode}
        onSelectMode={setGameMode}
        progress={progress}
        muted={muted}
        voiceEnabled={voiceEnabled}
        audioProps={studyAudioProps}
        themeId={themeId}
        onSelectTheme={handleSelectTheme}
        onToggleMute={handleToggleMute}
        onToggleVoice={handleToggleVoice}
        onStartGame={startNewRun}
        onOpenCompendium={() => {
          soundEngine.playUiTick();
          setCompendiumSection('monographs');
          setCompendiumReturnTo('TITLE_MENU');
          setGameState('COMPENDIUM');
        }}
        onOpenBookmarks={() => {
          soundEngine.playUiTick();
          setCompendiumSection('bookmarks');
          setCompendiumReturnTo('TITLE_MENU');
          setGameState('COMPENDIUM');
        }}
        onOpenDueQueue={() => {
          soundEngine.playUiTick();
          setCompendiumSection('review_queue');
          setCompendiumReturnTo('TITLE_MENU');
          setGameState('COMPENDIUM');
        }}
        onOpenSafetySim={() => {
          soundEngine.playUiTick();
          setSubModalReturnTo('TITLE_MENU');
          setGameState('SAFETY_SIM');
        }}
        onOpenAudioFlashcards={() => {
          soundEngine.playUiTick();
          setSubModalReturnTo('TITLE_MENU');
          setGameState('AUDIO_FLASHCARDS');
        }}
        onOpenAiLab={() => {
          soundEngine.playUiTick();
          setCompendiumSection('ai_lab');
          setCompendiumReturnTo('TITLE_MENU');
          setGameState('COMPENDIUM');
        }}
        onOpenStudyHelper={() => {
          soundEngine.playUiTick();
          setCompendiumSection('study_helper');
          setCompendiumReturnTo('TITLE_MENU');
          setGameState('COMPENDIUM');
        }}
        onOpenBodySystems={() => {
          soundEngine.playUiTick();
          setCompendiumSection('body_systems');
          setCompendiumReturnTo('TITLE_MENU');
          setGameState('COMPENDIUM');
        }}
        onOpenLiveUpdates={() => {
          soundEngine.playUiTick();
          setCompendiumSection('live_updates');
          setCompendiumReturnTo('TITLE_MENU');
          setGameState('COMPENDIUM');
        }}
        onBackupProgress={handleBackupProgress}
        liveFeed={liveFeed}
        autoUpdateEnabled={autoUpdateEnabled}
        isLiveRefreshing={isLiveRefreshing}
      />
    );
  } else {
    screenView = (
      <>
        <GameBoard
          currentCase={currentCase}
          caseIndex={caseIndex}
          totalCases={gameMode === 'zen' ? null : caseQueue.length}
          gameMode={gameMode}
          stability={stability}
          score={score}
          streak={streak}
          hintsRevealed={hintsRevealed}
          dimmedCardIds={dimmedCardIds}
          selectedCardId={selectedCardId}
          resolution={resolution}
          masteredDrugIds={progress.masteredDrugIds}
          customDrugMap={customDrugMap}
          examSecondsLeft={examSecondsLeft}
          isBookmarked={
            !currentCase.isQuickReview &&
            !currentCase.isCustomStudy &&
            (progress.bookmarkedCaseIds ?? []).includes(currentCase.id)
          }
          muted={muted}
          voiceEnabled={voiceEnabled}
          audioProps={studyAudioProps}
          themeId={themeId}
          onSelectTheme={handleSelectTheme}
          onSelectCard={handleSelectCard}
          onPlayCard={handlePlayCard}
          onRequestHint={handleRequestHint}
          onNextCase={handleNextCase}
          onToggleBookmark={
            currentCase.isQuickReview || currentCase.isCustomStudy
              ? undefined
              : () => handleToggleBookmarkCase(currentCase.id)
          }
          onToggleMute={handleToggleMute}
          onToggleVoice={handleToggleVoice}
          onPause={() => {
            soundEngine.playUiTick();
            setGameState('PAUSED');
          }}
        />

        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={() => {
              soundEngine.playUiTick();
              setGameState('PLAYING');
            }}
            onRestart={startNewRun}
            onOpenCompendium={() => {
              soundEngine.playUiTick();
              setCompendiumSection('monographs');
              setCompendiumReturnTo('PAUSED');
              setGameState('COMPENDIUM');
            }}
            onReturnTitle={() => {
              soundEngine.playUiTick();
              setGameMode((prev) => (prev === 'custom_study' ? 'shift' : prev));
              setGameState('TITLE_MENU');
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      {screenView}
      <ClinicalPearlToast
        toast={pearlToast}
        onDismiss={() => setPearlToast(null)}
        onCycleNext={handleShowRandomPearlToast}
      />
      <OfflineIndicator />
    </>
  );
}
