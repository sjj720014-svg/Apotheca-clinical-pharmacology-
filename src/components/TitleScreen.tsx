import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bookmark,
  BookOpen,
  Download,
  Flame,
  GraduationCap,
  Headphones,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Speech,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DeckFilter,
  DifficultyFilter,
  GameMode,
  LiveUpdatesFeedState,
  PlayerProgress,
} from '../types/pharma';
import { HUMAN_BODY_SYSTEMS } from '../data/bodySystems';
import { DRUG_MONOGRAPHS } from '../data/drugs';
import { CLINICAL_CASES } from '../data/cases';
import { ACHIEVEMENTS } from '../data/achievements';
import { SAFETY_SCENARIOS } from '../data/safetyScenarios';
import { formatDateKey, getTodayDateKey } from '../utils/daily';
import { formatRelativeCheckTime } from '../utils/liveUpdater';
import { DIFFICULTY_OPTIONS, filterClinicalCases } from '../utils/deck';
import { QUICK_REVIEW_COUNT } from '../utils/quickReview';
import { getDueTodaySummary } from '../utils/spacedRepetition';
import { soundEngine } from '../utils/sound';
import { ApothecaThemeId } from '../utils/themes';
import { BrandLockup } from './BrandLockup';
import { StudyAudioPopover, StudyAudioProps } from './StudyAudioPopover';
import { ThemePopover } from './ThemePopover';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  selectedDeck: DeckFilter;
  onSelectDeck: (deck: DeckFilter) => void;
  selectedDifficulty: DifficultyFilter;
  onSelectDifficulty: (difficulty: DifficultyFilter) => void;
  gameMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  progress: PlayerProgress;
  muted: boolean;
  voiceEnabled: boolean;
  audioProps: StudyAudioProps;
  themeId: ApothecaThemeId;
  onSelectTheme: (themeId: ApothecaThemeId) => void;
  onToggleMute: () => void;
  onToggleVoice: () => void;
  onStartGame: () => void;
  onOpenCompendium: () => void;
  onOpenBookmarks: () => void;
  onOpenDueQueue: () => void;
  onOpenSafetySim: () => void;
  onOpenAudioFlashcards: () => void;
  onOpenAiLab: () => void;
  onOpenStudyHelper: () => void;
  onOpenBodySystems: () => void;
  onOpenLiveUpdates: () => void;
  onBackupProgress: () => string;
  liveFeed: LiveUpdatesFeedState;
  autoUpdateEnabled: boolean;
  isLiveRefreshing: boolean;
}

const DECK_OPTIONS: { id: DeckFilter; label: string; detail: string }[] = [
  { id: 'all', label: 'Mixed Rounds', detail: 'All 9 clinical & organ-system tracks' },
  { id: 'cardiorenal', label: 'Cardiorenal', detail: 'RAAS, DOACs, diuretics & rhythm' },
  { id: 'infectious', label: 'Infectious Disease', detail: 'Spectra, PK/PD & stewardship' },
  { id: 'cns', label: 'CNS & Psych', detail: 'Monoamines, AEDs & opioids' },
  { id: 'endocrine_gi', label: 'Endocrine & GI', detail: 'SGLT2, thyroid, PPIs & rescues' },
  { id: 'respiratory', label: 'Respiratory', detail: 'LAMA/LABA, SMART ICS & biologics' },
  { id: 'hematology_immune', label: 'Heme & Immune', detail: 'Anaphylaxis, tPA, sickle cell & graft' },
  { id: 'musculoskeletal_derm', label: 'MSK & Derm', detail: 'DMARDs, gout, eczema & REMS' },
  { id: 'reproductive_sensory', label: 'Repro & Sensory', detail: 'Glaucoma IOP, OB & eclampsia' },
  { id: 'ai_informatics', label: 'AI & Ethics', detail: 'CDSS alerts, PGx bias & safe automation' },
];

export const TitleScreen: React.FC<Props> = ({
  selectedDeck,
  onSelectDeck,
  selectedDifficulty,
  onSelectDifficulty,
  gameMode,
  onSelectMode,
  progress,
  muted,
  voiceEnabled,
  audioProps,
  themeId,
  onSelectTheme,
  onToggleMute,
  onToggleVoice,
  onStartGame,
  onOpenCompendium,
  onOpenBookmarks,
  onOpenDueQueue,
  onOpenSafetySim,
  onOpenAudioFlashcards,
  onOpenAiLab,
  onOpenStudyHelper,
  onOpenBodySystems,
  onOpenLiveUpdates,
  onBackupProgress,
  liveFeed,
  autoUpdateEnabled,
  isLiveRefreshing,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [backupSaved, setBackupSaved] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"], [aria-modal="true"]')) {
        return;
      }
      const targetEl = e.target as HTMLElement | null;
      const tag = targetEl?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        targetEl?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (tag === 'BUTTON') return;
        e.preventDefault();
        onStartGame();
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      } else if (e.key.toLowerCase() === 'v') {
        onToggleVoice();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStartGame, onToggleMute, onToggleVoice]);

  const matchingCases = filterClinicalCases(
    CLINICAL_CASES,
    selectedDeck,
    selectedDifficulty
  );
  const matchingCount = matchingCases.length;
  const shiftCount = Math.min(5, matchingCount);

  const masteredSet = new Set(progress.masteredDrugIds);
  const unmasteredTotal = DRUG_MONOGRAPHS.filter((d) => !masteredSet.has(d.id)).length;
  const unmasteredInDeck =
    selectedDeck === 'all'
      ? unmasteredTotal
      : DRUG_MONOGRAPHS.filter(
          (d) => d.specialty === selectedDeck && !masteredSet.has(d.id)
        ).length;
  const dueSummary = getDueTodaySummary(progress, CLINICAL_CASES, DRUG_MONOGRAPHS);
  const dueCount = dueSummary.totalDueCount;
  const bookmarkedCount = (progress.bookmarkedCaseIds ?? []).length;
  const solvedSafetyCount = (progress.solvedSafetyIds ?? []).length;

  const activeDeckDetail =
    gameMode === 'daily'
      ? 'Curated 5-case daily set across all specialties & tiers'
      : gameMode === 'timed_exam'
      ? '10-case NAPLEX / OSCE board exam · 12:00 clock · Hints locked'
      : gameMode === 'due_review'
      ? `${dueCount} due items scheduled via spaced repetition`
      : gameMode === 'quick_review'
      ? selectedDeck === 'all'
        ? `${unmasteredTotal} unmastered monographs · Rapid ${QUICK_REVIEW_COUNT}-card MOA drill`
        : `${unmasteredInDeck} unmastered in ${
            DECK_OPTIONS.find((d) => d.id === selectedDeck)?.label ?? ''
          } · ${unmasteredTotal} unmastered total`
      : `${matchingCount} matching ${matchingCount === 1 ? 'case' : 'cases'} · ${
          DECK_OPTIONS.find((d) => d.id === selectedDeck)?.detail ?? ''
        }`;

  const activeDifficultyDetail =
    gameMode === 'daily'
      ? 'Daily Challenge uses mixed clinical tiers'
      : gameMode === 'timed_exam'
      ? 'Board simulation emphasizes Clinical & Board Prep vignettes'
      : gameMode === 'due_review'
      ? 'Adaptive priority queue ordered by missed recall & lapses'
      : gameMode === 'quick_review'
      ? 'Quick Review focuses on unmastered drug mechanisms'
      : DIFFICULTY_OPTIONS.find((d) => d.id === selectedDifficulty)?.detail ?? '';

  const isDifficultyDisabled =
    gameMode === 'daily' ||
    gameMode === 'quick_review' ||
    gameMode === 'due_review' ||
    gameMode === 'timed_exam';

  const todayKey = getTodayDateKey();
  const todayLabel = formatDateKey(todayKey);
  const todayScore = progress.dailyDate === todayKey ? progress.dailyScore : 0;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-canvas text-ink flex flex-col justify-between">
      {/* Key-Art Illustrated Backdrop */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {!imgFailed ? (
          <img
            src="/src/assets/images/apothecary_title_backdrop_1795627672568.jpg"
            alt="Modern apothecary laboratory slate table with borosilicate flask and brass balance scale"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-right transition-opacity duration-300"
            style={{ opacity: 'var(--theme-title-img-opacity)' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-canvas via-surface to-deep" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'var(--theme-title-scrim-h)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'var(--theme-title-scrim-v)' }}
        />
      </div>

      {/* Top Subtle Utility Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 sm:px-10 py-4 border-b border-line/10 bg-canvas/60 backdrop-blur-xs">
        <div className="text-xs text-ink-muted tabular-nums flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{progress.masteredDrugIds.length}/{DRUG_MONOGRAPHS.length} Monographs Mastered</span>
          <span aria-hidden="true">·</span>
          <span>{progress.unlockedAchievements.length}/{ACHIEVEMENTS.length} Achievements</span>
          {(progress.studyStreakDays ?? 0) > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-warn-text font-medium">
                <Flame className="w-3 h-3" />
                <span>{progress.studyStreakDays}d Study Streak</span>
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onOpenDueQueue}
            className="text-accent-text hover:opacity-80 underline underline-offset-4 cursor-pointer"
          >
            {dueCount} Due Today
          </button>
          {bookmarkedCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onOpenBookmarks}
                className="inline-flex items-center gap-1 text-warn-text hover:opacity-80 underline underline-offset-4 cursor-pointer"
              >
                <Bookmark className="w-3 h-3" />
                <span>{bookmarkedCount} Bookmarked</span>
              </button>
            </>
          )}
          {progress.bestShiftScore > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>Best Shift {progress.bestShiftScore.toLocaleString()} pts</span>
            </>
          )}
          {(progress.bestTimedExamScore ?? 0) > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>Best Exam {progress.bestTimedExamScore?.toLocaleString()} pts</span>
            </>
          )}
          {todayScore > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-accent-text font-medium">
                Daily {todayScore.toLocaleString()} pts
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onOpenLiveUpdates}
            className="text-accent-text hover:opacity-80 underline underline-offset-4 cursor-pointer"
          >
            {isLiveRefreshing || liveFeed.isRefreshing
              ? 'Updating clinical feed...'
              : `24/7 Updates (${formatRelativeCheckTime(liveFeed.lastSuccessAt ?? liveFeed.lastCheckedAt)})`}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PWAInstallButton />
          <ThemePopover themeId={themeId} onSelectTheme={onSelectTheme} />
          <StudyAudioPopover {...audioProps} />

          <button
            type="button"
            onClick={onToggleVoice}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              voiceEnabled && !muted
                ? 'bg-accent-bg/18 border border-accent-ring/45 text-ink hover:bg-accent-bg/26'
                : 'bg-wash/6 hover:bg-wash/12 text-ink-muted border border-transparent'
            }`}
            aria-label={voiceEnabled ? 'Disable clinical voice narration' : 'Enable clinical voice narration'}
            title="Toggle Auto Voice (V)"
          >
            <Speech className="w-3.5 h-3.5" />
            <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onBackupProgress();
              setBackupSaved(true);
              window.setTimeout(() => setBackupSaved(false), 2600);
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              backupSaved
                ? 'bg-accent-bg/18 border border-accent-ring/45 text-ink'
                : 'bg-wash/6 hover:bg-wash/12 text-ink-muted border border-transparent'
            }`}
            title="Download apotheca_progress_v1 state as a JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-accent-text" />
            <span>{backupSaved ? 'Backup Saved' : 'Backup Progress'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wash/6 hover:bg-wash/12 text-xs font-medium text-ink-muted transition-colors cursor-pointer whitespace-nowrap shrink-0"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title="Mute All Audio (M)"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{muted ? 'Sound Off' : 'Sound On'}</span>
          </button>
        </div>
      </div>

      {/* Main Left-Aligned Title & Setup Zone */}
      <main className="relative z-10 flex-1 flex items-center px-6 sm:px-10 py-4">
        <div className="w-full max-w-3xl">
          <BrandLockup />

          <p className="mt-4 text-sm sm:text-base text-ink/85 leading-relaxed max-w-lg">
            Diagnose receptor targets, screen CYP450 traps, and resolve acute toxicities
            one calm clinical dossier at a time.
          </p>

          {/* Specialty Deck Selection */}
          <div className="mt-5 max-w-2xl">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="text-xs font-medium text-ink-muted">
                Clinical Deck
              </span>
              <span className="text-xs text-ink-muted/85 truncate tabular-nums">
                {activeDeckDetail}
              </span>
            </div>
            <div
              className={`flex flex-wrap gap-1.5 p-1 bg-surface/90 border border-line/12 rounded-xl transition-opacity ${
                gameMode === 'daily' ? 'opacity-50' : ''
              }`}
            >
              {DECK_OPTIONS.map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  disabled={gameMode === 'daily'}
                  onClick={() => {
                    soundEngine.playUiTick();
                    onSelectDeck(deck.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed ${
                    gameMode === 'daily'
                      ? deck.id === 'all'
                        ? 'bg-wash/12 text-ink'
                        : 'text-ink-muted/55'
                      : selectedDeck === deck.id
                      ? 'bg-accent-bg text-on-accent font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-wash/8'
                  }`}
                >
                  {deck.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level Filter */}
          <div className="mt-4 max-w-2xl">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="text-xs font-medium text-ink-muted">
                Difficulty Level
              </span>
              <span className="text-xs text-ink-muted/85 truncate">
                {activeDifficultyDetail}
              </span>
            </div>
            <div
              className={`flex flex-wrap gap-1.5 p-1 bg-surface/90 border border-line/12 rounded-xl transition-opacity ${
                isDifficultyDisabled ? 'opacity-50' : ''
              }`}
            >
              {DIFFICULTY_OPTIONS.map((level) => {
                const count = filterClinicalCases(
                  CLINICAL_CASES,
                  gameMode === 'daily' ? 'all' : selectedDeck,
                  level.id
                ).length;
                return (
                  <button
                    key={level.id}
                    type="button"
                    disabled={isDifficultyDisabled}
                    onClick={() => {
                      soundEngine.playUiTick();
                      onSelectDifficulty(level.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed tabular-nums ${
                      isDifficultyDisabled
                        ? level.id === 'all'
                          ? 'bg-wash/12 text-ink'
                          : 'text-ink-muted/55'
                        : selectedDifficulty === level.id
                        ? 'bg-accent-bg text-on-accent font-semibold'
                        : 'text-ink-muted hover:text-ink hover:bg-wash/8'
                    }`}
                  >
                    {level.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pace Mode Selection */}
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="text-xs font-medium text-ink-muted">
                Study Mode
              </span>
              <button
                type="button"
                onClick={onOpenDueQueue}
                className="text-xs text-accent-text hover:opacity-80 underline underline-offset-4 cursor-pointer"
              >
                View Specialty Analytics &amp; Due Queue →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  onSelectMode('shift');
                }}
                className={`text-left px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  gameMode === 'shift'
                    ? 'bg-accent-bg/15 border-accent-ring/70 text-ink'
                    : 'bg-surface/80 border-line/12 text-ink-muted hover:border-line/28 hover:text-ink'
                }`}
              >
                <div className="text-sm font-semibold text-ink whitespace-nowrap">Clinical Shift</div>
                <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {shiftCount} {shiftCount === 1 ? 'case' : 'cases'} · Stability &amp; streak
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  onSelectMode('timed_exam');
                }}
                className={`text-left px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  gameMode === 'timed_exam'
                    ? 'bg-accent-bg/15 border-accent-ring/70 text-ink'
                    : 'bg-surface/80 border-line/12 text-ink-muted hover:border-line/28 hover:text-ink'
                }`}
              >
                <div className="text-sm font-semibold text-ink whitespace-nowrap">Timed Exam (NAPLEX)</div>
                <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  10 cases · 12:00 clock · Hints locked
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  onSelectMode('due_review');
                }}
                className={`text-left px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  gameMode === 'due_review'
                    ? 'bg-accent-bg/15 border-accent-ring/70 text-ink'
                    : 'bg-surface/80 border-line/12 text-ink-muted hover:border-line/28 hover:text-ink'
                }`}
              >
                <div className="text-sm font-semibold text-ink whitespace-nowrap">Due Today (SRS)</div>
                <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {dueCount} due items · Missed &amp; spaced recall
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  onSelectMode('quick_review');
                }}
                className={`text-left px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  gameMode === 'quick_review'
                    ? 'bg-accent-bg/15 border-accent-ring/70 text-ink'
                    : 'bg-surface/80 border-line/12 text-ink-muted hover:border-line/28 hover:text-ink'
                }`}
              >
                <div className="text-sm font-semibold text-ink whitespace-nowrap">Quick Review</div>
                <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {QUICK_REVIEW_COUNT} MOA drills · {unmasteredTotal} unmastered
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  onSelectMode('daily');
                }}
                className={`text-left px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  gameMode === 'daily'
                    ? 'bg-accent-bg/15 border-accent-ring/70 text-ink'
                    : 'bg-surface/80 border-line/12 text-ink-muted hover:border-line/28 hover:text-ink'
                }`}
              >
                <div className="text-sm font-semibold text-ink whitespace-nowrap">Daily Challenge</div>
                <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {todayScore > 0
                    ? `${todayLabel} · ${todayScore.toLocaleString()} pts`
                    : `${todayLabel} · Shared 5 cases`}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  onSelectMode('zen');
                }}
                className={`text-left px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  gameMode === 'zen'
                    ? 'bg-accent-bg/15 border-accent-ring/70 text-ink'
                    : 'bg-surface/80 border-line/12 text-ink-muted hover:border-line/28 hover:text-ink'
                }`}
              >
                <div className="text-sm font-semibold text-ink whitespace-nowrap">Study Zen</div>
                <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {matchingCount} {matchingCount === 1 ? 'case' : 'cases'} · No penalty hints
                </div>
              </button>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onStartGame}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-accent-bg hover:bg-accent-hover text-on-accent text-sm font-semibold transition-colors shadow-lg whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-ring"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {gameMode === 'shift'
                  ? 'Start Clinical Shift'
                  : gameMode === 'timed_exam'
                  ? 'Start Timed Exam'
                  : gameMode === 'due_review'
                  ? 'Start Due Review'
                  : gameMode === 'daily'
                  ? 'Start Daily Challenge'
                  : gameMode === 'quick_review'
                  ? 'Start Quick Review'
                  : 'Start Study Zen'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenSafetySim}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/85 hover:bg-surface-alt border border-line/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Verify CYP450 interactions, QTc stacking, contraindications, and CrCl renal doses"
            >
              <ShieldCheck className="w-4 h-4 text-accent-text" />
              <span>
                Safety Check Lab ({solvedSafetyCount}/{SAFETY_SCENARIOS.length})
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAudioFlashcards}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/85 hover:bg-surface-alt border border-line/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Hands-free audio flashcards over calm focus music"
            >
              <Headphones className="w-4 h-4 text-accent-text" />
              <span>Audio Flashcards</span>
            </button>

            <button
              type="button"
              onClick={onOpenCompendium}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/85 hover:bg-surface-alt border border-line/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-accent-text" />
              <span>Compendium</span>
            </button>

            <button
              type="button"
              onClick={onOpenAiLab}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/85 hover:bg-surface-alt border border-line/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-accent-text" />
              <span>AI &amp; Ethics Lab</span>
            </button>

            <button
              type="button"
              onClick={onOpenStudyHelper}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/85 hover:bg-surface-alt border border-line/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Upload any study file up to 100 MB, generate clinical cases, and export Anki decks"
            >
              <Sparkles className="w-4 h-4 text-accent-text" />
              <span>AI Study Helper</span>
            </button>

            <button
              type="button"
              onClick={onOpenBodySystems}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/85 hover:bg-surface-alt border border-line/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Explore all 12 human organ systems, receptor pathways, biomarkers, and therapies"
            >
              <Activity className="w-4 h-4 text-accent-text" />
              <span>Body Systems ({HUMAN_BODY_SYSTEMS.length})</span>
            </button>

            <button
              type="button"
              onClick={onOpenLiveUpdates}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/85 hover:bg-surface-alt border border-line/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={
                autoUpdateEnabled
                  ? '24/7 auto-updater enabled — view or refresh latest clinical guidelines and FDA alerts'
                  : 'View or manually refresh latest clinical guidelines and FDA alerts'
              }
            >
              <RefreshCw
                className={`w-4 h-4 text-accent-text ${
                  isLiveRefreshing || liveFeed.isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>Live 24/7 Updates</span>
            </button>
          </div>
        </div>
      </main>

      {/* Single Flat Control-Hint Line */}
      <footer className="relative z-10 px-6 sm:px-10 pb-4">
        <p
          className="text-xs text-ink-muted/85 tracking-wide"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          1–4 Select Card · Enter Confirm · H Hint · B Bookmark · V Voice · M Mute · Esc Pause
        </p>
      </footer>
    </div>
  );
};
