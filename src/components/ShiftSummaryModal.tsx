import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Download,
  Home,
  Printer,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';
import {
  CaseOutcome,
  ClinicalCase,
  CustomStudyDeck,
  DrugMonograph,
  GameMode,
  PlayerProgress,
} from '../types/pharma';
import { DRUG_MAP, SPECIALTY_META } from '../data/drugs';
import { CLINICAL_CASES } from '../data/cases';
import { ACHIEVEMENTS } from '../data/achievements';
import { formatDateKey, getTodayDateKey } from '../utils/daily';
import {
  buildStudyExportContent,
  ExportFormat,
  triggerFileDownload,
} from '../utils/exportStudyGuide';
import { soundEngine } from '../utils/sound';
import { voiceEngine } from '../utils/voice';
import { MonographSheet } from './MonographSheet';
import { PrintableStudySheetModal } from './PrintableStudySheetModal';

const CASE_BY_ID = new Set(CLINICAL_CASES.map((c) => c.id));

interface Props {
  outcomes: CaseOutcome[];
  score: number;
  maxStreak: number;
  stability: number;
  gameMode: GameMode;
  dailyScore: number;
  newlyUnlockedAchievements: string[];
  masteredDrugIds: string[];
  progress: PlayerProgress;
  customDrugMap?: Record<string, DrugMonograph>;
  customDecks?: CustomStudyDeck[];
  customCaseMap?: Record<string, ClinicalCase>;
  examTimeElapsedLabel?: string;
  onToggleBookmarkCase: (caseId: string) => void;
  onBackupProgress: () => string;
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

export const ShiftSummaryModal: React.FC<Props> = ({
  outcomes,
  score,
  maxStreak,
  stability,
  gameMode,
  dailyScore,
  newlyUnlockedAchievements,
  masteredDrugIds,
  progress,
  customDrugMap = {},
  customDecks = [],
  customCaseMap = {},
  examTimeElapsedLabel,
  onToggleBookmarkCase,
  onBackupProgress,
  onPlayAgain,
  onReturnTitle,
}) => {
  const [inspectDrug, setInspectDrug] = useState<DrugMonograph | null>(null);
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );

  useEffect(() => {
    const unsub = voiceEngine.subscribe(setActiveSpeechTag);
    return () => {
      unsub();
      voiceEngine.stop();
    };
  }, []);

  const allDrugMap: Record<string, DrugMonograph> = {
    ...DRUG_MAP,
    ...customDrugMap,
  };

  const handleExport = (format: ExportFormat) => {
    soundEngine.playUiTick();
    const content = buildStudyExportContent({
      progress,
      sessionOutcomes: outcomes,
      sessionGameMode: gameMode,
      customDecks,
      customDrugMap,
      customCaseMap,
      format,
    });
    const dateStamp = getTodayDateKey();
    const ext =
      format === 'markdown' ? 'md' : format === 'csv_anki' ? 'csv' : 'txt';
    const mime =
      format === 'markdown'
        ? 'text/markdown'
        : format === 'csv_anki'
        ? 'text/csv'
        : 'text/plain';
    const filename =
      format === 'csv_anki'
        ? `apotheca-anki-cards-${dateStamp}.csv`
        : `apotheca-study-guide-${dateStamp}.${ext}`;
    triggerFileDownload(content, filename, mime);
    setExportNotice(`Downloaded ${filename}`);
    window.setTimeout(() => setExportNotice(null), 3000);
  };

  const correctCount = outcomes.filter((o) => o.isCorrect).length;
  const accuracy =
    outcomes.length > 0 ? Math.round((correctCount / outcomes.length) * 100) : 0;
  const isScoredChallenge = gameMode === 'shift' || gameMode === 'daily';
  const isVictory = !isScoredChallenge || stability > 0;
  const todayLabel = formatDateKey(getTodayDateKey());
  const unlockedItems = ACHIEVEMENTS.filter((a) =>
    newlyUnlockedAchievements.includes(a.id)
  );
  const bookmarkedSet = new Set(progress.bookmarkedCaseIds ?? []);

  const handleListenReport = () => {
    const headline = isVictory
      ? gameMode === 'daily'
        ? 'Daily Challenge Complete.'
        : gameMode === 'quick_review'
        ? 'Quick Review Complete.'
        : gameMode === 'due_review'
        ? 'Due Today Review Complete.'
        : gameMode === 'timed_exam'
        ? 'Timed Board Exam Submitted.'
        : gameMode === 'custom_study'
        ? 'Custom Study Set Complete.'
        : 'Clinical Rounds Complete.'
      : 'Patient Stability Depleted.';
    const achText =
      unlockedItems.length > 0
        ? ` Unlocked achievements: ${unlockedItems.map((a) => a.title).join(', ')}.`
        : '';
    const script = `${headline} Final score: ${score} points. Accuracy: ${correctCount} of ${outcomes.length} cases, or ${accuracy} percent. Peak streak: ${maxStreak}.${achText}`;
    voiceEngine.toggleSpeak(script, 'summary-report', { rate: 0.98 });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl bg-dossier text-slate-900 border border-slate-200 shadow-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {gameMode === 'shift'
                ? 'Clinical Shift Report'
                : gameMode === 'daily'
                ? `Daily Challenge Report · ${todayLabel}`
                : gameMode === 'quick_review'
                ? 'Quick Review Summary · Rapid MOA Drill'
                : gameMode === 'due_review'
                ? 'Spaced Repetition · Due Today Queue'
                : gameMode === 'timed_exam'
                ? 'NAPLEX / OSCE Timed Exam · Board Simulation'
                : gameMode === 'custom_study'
                ? 'AI Custom Study Set · Verify Primary Guidelines'
                : 'Study Zen Summary'}
            </p>
            <h1
              className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isVictory
                ? gameMode === 'daily'
                  ? 'Daily Challenge Complete'
                  : gameMode === 'quick_review'
                  ? 'Quick Review Complete'
                  : gameMode === 'due_review'
                  ? 'Spaced Repetition Complete'
                  : gameMode === 'timed_exam'
                  ? 'Timed Exam Submitted'
                  : gameMode === 'custom_study'
                  ? 'Custom Study Set Complete'
                  : 'Clinical Rounds Complete'
                : 'Patient Stability Depleted'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {isVictory
                ? gameMode === 'quick_review'
                  ? 'Any newly solved mechanisms are now recorded as mastered in your Formulary Compendium.'
                  : gameMode === 'due_review'
                  ? 'Your review intervals and study streak have been updated based on today’s recall.'
                  : gameMode === 'timed_exam'
                  ? 'Hints remained locked until submission. Review missed items to schedule them into your Due Today queue.'
                  : gameMode === 'custom_study'
                  ? 'Remember to cross-check AI-generated study vignettes against primary clinical references.'
                  : 'Review each therapeutic decision and inspect any unfamiliar monographs below.'
                : 'Stability reached zero before completing the round. Review the missed interactions and try again.'}
            </p>
          </div>

          {voiceEngine.isSupported() && (
            <button
              type="button"
              onClick={handleListenReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {activeSpeechTag === 'summary-report' ? (
                <>
                  <Square className="w-3 h-3 fill-current text-emerald-700" />
                  <span>Stop Report</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Listen to Report</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Summary Metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">
              {gameMode === 'daily' ? 'Today’s Best Daily' : 'Final Score'}
            </div>
            <div
              className="mt-1 text-xl font-semibold text-slate-900 tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {(gameMode === 'daily' ? Math.max(score, dailyScore) : score).toLocaleString()}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Accuracy</div>
            <div
              className="mt-1 text-xl font-semibold text-emerald-800 tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {correctCount}/{outcomes.length} ({accuracy}%)
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Peak Streak</div>
            <div
              className="mt-1 text-xl font-semibold text-slate-900 tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {maxStreak}×
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">
              {isScoredChallenge
                ? 'Final Stability'
                : gameMode === 'timed_exam'
                ? 'Exam Time'
                : 'Study Streak'}
            </div>
            <div
              className="mt-1 text-xl font-semibold text-slate-900 tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {isScoredChallenge
                ? `${stability}/100`
                : gameMode === 'timed_exam'
                ? examTimeElapsedLabel || 'Timed'
                : `${progress.studyStreakDays ?? 1}d`}
            </div>
          </div>
        </div>

        {unlockedItems.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-300">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>
                {unlockedItems.length === 1
                  ? 'Achievement Unlocked'
                  : `${unlockedItems.length} Achievements Unlocked`}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {unlockedItems.map((item) => (
                <div key={item.id} className="text-xs sm:text-sm text-emerald-950">
                  <span className="font-semibold">{item.title}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="text-emerald-900">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case-by-Case Breakdown */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500">
              Case Breakdown
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {exportNotice && (
                <span className="text-xs text-emerald-700 font-medium">
                  {exportNotice}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleExport('markdown')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Download bookmarks and round outcomes as Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export .md</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('csv_anki')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Download Anki-ready flashcards (.csv)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Anki .csv</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('text')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Download bookmarks and round outcomes as Plain Text (.txt)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export .txt</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  setShowPrintSheet(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Open clean Print / Save PDF study sheet"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const filename = onBackupProgress();
                  setExportNotice(`Backed up ${filename}`);
                  window.setTimeout(() => setExportNotice(null), 3000);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Download apotheca_progress_v1 state as a JSON backup"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Backup Progress</span>
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white max-h-72 overflow-y-auto">
            {outcomes.map((item) => {
              const targetDrug = allDrugMap[item.correctDrugId];
              const chosenDrug = allDrugMap[item.chosenDrugId];
              const canBookmark = CASE_BY_ID.has(item.caseId);
              const isBookmarked = bookmarkedSet.has(item.caseId);

              return (
                <div
                  key={item.caseId}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {item.caseTitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        {SPECIALTY_META[item.specialty].shortLabel}
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        {item.isCorrect
                          ? `Prescribed ${targetDrug?.genericName ?? item.correctDrugId}`
                          : `Chose ${chosenDrug?.genericName ?? item.chosenDrugId} (Optimal: ${targetDrug?.genericName ?? item.correctDrugId})`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {canBookmark && (
                      <button
                        type="button"
                        onClick={() => onToggleBookmarkCase(item.caseId)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isBookmarked
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                        title={
                          isBookmarked ? 'Remove bookmark' : 'Bookmark for offline review'
                        }
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    {targetDrug && (
                      <button
                        type="button"
                        onClick={() => setInspectDrug(targetDrug)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{targetDrug.genericName}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReturnTitle}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-sm font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Home className="w-4 h-4" />
            <span>Return to Title</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>

      {inspectDrug && (
        <MonographSheet
          drug={inspectDrug}
          isMastered={masteredDrugIds.includes(inspectDrug.id)}
          onClose={() => setInspectDrug(null)}
        />
      )}

      {showPrintSheet && (
        <PrintableStudySheetModal
          progress={progress}
          sessionOutcomes={outcomes}
          customDecks={customDecks}
          customDrugMap={customDrugMap}
          customCaseMap={customCaseMap}
          onClose={() => setShowPrintSheet(false)}
        />
      )}
    </div>
  );
};
