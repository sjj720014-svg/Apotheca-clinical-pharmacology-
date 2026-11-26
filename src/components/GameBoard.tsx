import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  Lightbulb,
  Lock,
  Pause,
  ShieldAlert,
  Speech,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CaseMechanic,
  ClinicalCase,
  DrugMonograph,
  GameMode,
} from '../types/pharma';
import { DRUG_MAP, SPECIALTY_META } from '../data/drugs';
import { DIFFICULTY_DISPLAY } from '../utils/deck';
import { voiceEngine, VoiceStatusSnapshot } from '../utils/voice';
import { ApothecaThemeId } from '../utils/themes';
import { DosageFormSvg } from './DosageFormSvg';
import { MonographSheet } from './MonographSheet';
import { StudyAudioPopover, StudyAudioProps } from './StudyAudioPopover';
import { ThemePopover } from './ThemePopover';

interface ResolutionState {
  chosenDrugId: string;
  isCorrect: boolean;
  pointsEarned: number;
  stabilityDelta: number;
}

interface Props {
  currentCase: ClinicalCase;
  caseIndex: number;
  totalCases: number | null; // null in Study Zen
  gameMode: GameMode;
  stability: number;
  score: number;
  streak: number;
  hintsRevealed: number; // 0..3
  dimmedCardIds: string[];
  selectedCardId: string | null;
  resolution: ResolutionState | null;
  masteredDrugIds: string[];
  customDrugMap?: Record<string, DrugMonograph>;
  examSecondsLeft?: number | null;
  isBookmarked?: boolean;
  muted: boolean;
  voiceEnabled: boolean;
  audioProps: StudyAudioProps;
  themeId: ApothecaThemeId;
  onSelectTheme: (themeId: ApothecaThemeId) => void;
  onSelectCard: (drugId: string) => void;
  onPlayCard: (drugId: string) => void;
  onRequestHint: () => void;
  onNextCase: () => void;
  onToggleBookmark?: () => void;
  onToggleMute: () => void;
  onToggleVoice: () => void;
  onPause: () => void;
}

const MECHANIC_LABEL: Record<CaseMechanic, string> = {
  prescribe_screen: 'Prescribe & Screen',
  receptor_lock: 'Receptor Lock',
  antidote_triage: 'Interaction & Triage',
};

function getStabilityLabel(stability: number): string {
  if (stability >= 70) return 'STABLE';
  if (stability >= 40) return 'MONITOR';
  return 'CRITICAL';
}

function formatClockSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const GameBoard: React.FC<Props> = ({
  currentCase,
  caseIndex,
  totalCases,
  gameMode,
  stability,
  score,
  streak,
  hintsRevealed,
  dimmedCardIds,
  selectedCardId,
  resolution,
  masteredDrugIds,
  customDrugMap = {},
  examSecondsLeft = null,
  isBookmarked = false,
  muted,
  voiceEnabled,
  audioProps,
  themeId,
  onSelectTheme,
  onSelectCard,
  onPlayCard,
  onRequestHint,
  onNextCase,
  onToggleBookmark,
  onToggleMute,
  onToggleVoice,
  onPause,
}) => {
  const [inspectDrug, setInspectDrug] = useState<DrugMonograph | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [showQuickScience, setShowQuickScience] = useState(false);
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );
  const [voiceSnap, setVoiceSnap] = useState<VoiceStatusSnapshot>(() =>
    voiceEngine.getSnapshot()
  );

  useEffect(() => {
    return voiceEngine.subscribe((tag, snap) => {
      setActiveSpeechTag(tag);
      setVoiceSnap(snap);
    });
  }, []);

  useEffect(() => {
    setShowQuickScience(false);
  }, [currentCase.id]);

  useEffect(() => {
    if (resolution && !resolution.isCorrect) {
      setShakeTrigger(true);
      const timer = window.setTimeout(() => setShakeTrigger(false), 260);
      return () => window.clearTimeout(timer);
    }
  }, [resolution]);

  // Keyboard shortcuts during PLAYING
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (inspectDrug) return;
      if (document.querySelector('[role="dialog"], [aria-modal="true"]')) {
        return;
      }
      const targetEl = e.target as HTMLElement | null;
      const tagName = targetEl?.tagName;
      if (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        targetEl?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onPause();
        return;
      }
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onToggleMute();
        return;
      }
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        onToggleVoice();
        return;
      }
      if (
        e.key.toLowerCase() === 'b' &&
        !currentCase.isQuickReview &&
        onToggleBookmark
      ) {
        e.preventDefault();
        onToggleBookmark();
        return;
      }
      if (
        e.key.toLowerCase() === 'h' &&
        !resolution &&
        gameMode !== 'timed_exam'
      ) {
        e.preventDefault();
        onRequestHint();
        return;
      }
      if (!resolution) {
        const num = Number(e.key);
        if (num >= 1 && num <= 4) {
          const cardId = currentCase.cardIds[num - 1];
          if (cardId && !dimmedCardIds.includes(cardId)) {
            e.preventDefault();
            onSelectCard(cardId);
          }
          return;
        }
        if ((e.key === 'Enter' || e.key === ' ') && selectedCardId) {
          const tag = (e.target as HTMLElement | null)?.tagName;
          if (tag === 'BUTTON' && e.key === ' ') return;
          e.preventDefault();
          onPlayCard(selectedCardId);
          return;
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON' && e.key === ' ') return;
        e.preventDefault();
        onNextCase();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    inspectDrug,
    resolution,
    gameMode,
    currentCase.cardIds,
    currentCase.isQuickReview,
    dimmedCardIds,
    selectedCardId,
    onPause,
    onToggleMute,
    onToggleVoice,
    onToggleBookmark,
    onRequestHint,
    onSelectCard,
    onPlayCard,
    onNextCase,
  ]);

  const resolveDrug = (id: string): DrugMonograph | undefined =>
    customDrugMap[id] ?? DRUG_MAP[id];

  const correctDrug = resolveDrug(currentCase.correctDrugId);
  const chosenDrug = resolution ? resolveDrug(resolution.chosenDrugId) ?? null : null;
  const stabilityState = getStabilityLabel(stability);
  const isExamMode = gameMode === 'timed_exam';

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between select-none">
      {/* Subtle radial tabletop illumination */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'var(--theme-board-glow)' }}
      />

      {/* Perimeter Top HUD Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-2 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-muted pointer-events-auto">
          <span className="font-semibold text-ink">
            {SPECIALTY_META[currentCase.specialty].shortLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {totalCases ? `Case ${caseIndex + 1} / ${totalCases}` : `Case ${caseIndex + 1}`}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-ink-muted/85">
            {gameMode === 'shift'
              ? 'Clinical Shift'
              : gameMode === 'daily'
              ? 'Daily Challenge'
              : gameMode === 'quick_review'
              ? 'Quick Review'
              : gameMode === 'due_review'
              ? 'Due Today (SRS)'
              : gameMode === 'timed_exam'
              ? 'NAPLEX / OSCE Exam'
              : gameMode === 'custom_study'
              ? 'Custom Study Deck'
              : 'Study Zen'}
          </span>
        </div>

        {/* Center Stability Meter, Timed Exam Clock, or Calm Mode Readout */}
        {isExamMode && examSecondsLeft !== null ? (
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold tabular-nums ${
                examSecondsLeft <= 120
                  ? 'bg-danger-surface border-danger-border text-danger-ink'
                  : 'bg-surface border-accent-ring/40 text-accent-text'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Exam Clock {formatClockSeconds(examSecondsLeft)}</span>
            </span>
            <span className="text-xs text-ink-muted hidden md:inline">
              No hints until submission
            </span>
          </div>
        ) : gameMode === 'shift' || gameMode === 'daily' ? (
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-28 sm:w-36 h-2 rounded-full bg-wash/12 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  stability >= 70
                    ? 'bg-emerald-500'
                    : stability >= 40
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, stability))}%` }}
              />
            </div>
            <span
              className={`text-xs font-medium tabular-nums ${
                stability >= 70
                  ? 'text-accent-text'
                  : stability >= 40
                  ? 'text-warn-text'
                  : 'text-danger-text'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Stability {stability}/100 · {stabilityState}
            </span>
          </div>
        ) : gameMode === 'quick_review' ? (
          <div className="text-xs text-ink-muted pointer-events-auto">
            Rapid 10-Card MOA Drill · Unmastered Drugs First
          </div>
        ) : gameMode === 'due_review' ? (
          <div className="text-xs text-ink-muted pointer-events-auto">
            Spaced Repetition Queue · Missed &amp; Due Items
          </div>
        ) : gameMode === 'custom_study' ? (
          <div className="text-xs text-warn-text pointer-events-auto">
            Generated from Uploaded Notes · Verify Primary Guidelines
          </div>
        ) : (
          <div className="text-xs text-ink-muted pointer-events-auto">
            Untimed Study Zen · Zero Stability Penalty
          </div>
        )}

        {/* Right Score & Utility Cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
          <div
            className="text-xs sm:text-sm text-ink tabular-nums pr-1"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span>{score.toLocaleString()} pts</span>
            {streak > 1 && (
              <span className="ml-2 text-accent-text font-semibold">{streak}×</span>
            )}
          </div>

          <button
            type="button"
            onClick={onRequestHint}
            disabled={isExamMode || !!resolution || hintsRevealed >= 3}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-wash/8 hover:bg-wash/14 disabled:opacity-40 disabled:pointer-events-none text-xs font-medium text-warn-text transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title={
              isExamMode
                ? 'Hints are locked during Timed Exam Mode'
                : 'Reveal Clinical Hint (H)'
            }
          >
            {isExamMode ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Hints Locked</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Hint {hintsRevealed}/3</span>
              </>
            )}
          </button>

          <ThemePopover themeId={themeId} onSelectTheme={onSelectTheme} compact />
          <StudyAudioPopover {...audioProps} compact />

          <button
            type="button"
            onClick={onToggleVoice}
            className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              voiceEnabled && !muted
                ? 'bg-accent-bg/18 text-ink hover:bg-accent-bg/26 border border-accent-ring/45'
                : 'bg-wash/8 hover:bg-wash/14 text-ink-muted border border-transparent'
            }`}
            aria-label={voiceEnabled ? 'Disable auto voice narration' : 'Enable auto voice narration'}
            title="Toggle Auto Voice (V)"
          >
            <Speech className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-wash/8 hover:bg-wash/14 text-ink-muted hover:text-ink transition-colors cursor-pointer"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title="Mute All Audio (M)"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            className="p-2 rounded-lg bg-wash/8 hover:bg-wash/14 text-ink-muted hover:text-ink transition-colors cursor-pointer"
            aria-label="Pause game"
            title="Pause (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </header>

      {voiceSnap.lastError && (
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 pt-1">
          <div className="px-3.5 py-2 rounded-xl bg-warn-surface border border-warn-border text-xs text-warn-ink flex flex-wrap items-center justify-between gap-2">
            <span>{voiceSnap.lastError}</span>
            <div className="flex items-center gap-3 shrink-0">
              {voiceEngine.isBrowserSpeechSupported() &&
                voiceSnap.provider === 'gemini' && (
                  <button
                    type="button"
                    onClick={() => {
                      audioProps.onChangeVoiceProvider('browser');
                      voiceEngine.clearError();
                    }}
                    className="text-warn-ink hover:opacity-80 underline underline-offset-2 cursor-pointer font-medium"
                  >
                    Use Browser Speech
                  </button>
                )}
              <button
                type="button"
                onClick={() => voiceEngine.clearError()}
                className="text-warn-ink/80 hover:text-warn-ink cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Playfield: Clinical Dossier Board */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-3">
        <div
          className={`w-full max-w-4xl bg-dossier text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 p-5 sm:p-7 transition-transform duration-150 ${
            shakeTrigger ? 'animate-gentle-shake' : ''
          }`}
        >
          {/* Case Kicker & Title */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              <span>{MECHANIC_LABEL[currentCase.mechanic]}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{DIFFICULTY_DISPLAY[currentCase.difficulty]}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">{currentCase.patientLine}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!currentCase.isQuickReview && onToggleBookmark && (
                <button
                  type="button"
                  onClick={onToggleBookmark}
                  aria-pressed={isBookmarked}
                  title={
                    isBookmarked
                      ? 'Remove case bookmark (B)'
                      : 'Bookmark case for Compendium review (B)'
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isBookmarked
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Bookmarked</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-slate-600" />
                      <span>Bookmark</span>
                    </>
                  )}
                </button>
              )}

              {voiceEngine.isSupported() && (
                <button
                  type="button"
                  disabled={muted}
                  onClick={() => voiceEngine.speakCase(currentCase, true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-45 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                >
                  {activeSpeechTag === `case:${currentCase.id}` ||
                  voiceSnap.loadingTag === `case:${currentCase.id}` ? (
                    <>
                      <Square className="w-3 h-3 fill-current text-emerald-700" />
                      <span>
                        {voiceSnap.loadingTag === `case:${currentCase.id}`
                          ? 'Synthesizing...'
                          : 'Stop Audio'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Listen to Case</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {currentCase.isCustomStudy && (
            <div className="mt-2.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>[AI-Generated Study Case]</strong> Derived from{' '}
                <strong>{currentCase.sourceDocName || 'uploaded file'}</strong>
                {currentCase.citationNote ? ` · ${currentCase.citationNote}` : ''}. Verify clinical guidelines &amp; dosing against primary references.
              </span>
            </div>
          )}

          <h2
            className="mt-1.5 text-xl sm:text-2xl font-semibold text-slate-900 leading-snug"
            style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}
          >
            {currentCase.title}
          </h2>

          <p className="mt-2 text-sm sm:text-[15px] text-slate-700 leading-relaxed max-w-3xl">
            {currentCase.presentation}
          </p>

          {/* Vitals / Labs & Active Medications */}
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-7 grid grid-cols-3 gap-2.5">
              {currentCase.labs.map((lab) => (
                <div
                  key={lab.label}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-200/90"
                >
                  <div className="text-[11px] font-medium text-slate-500 truncate">
                    {lab.label}
                  </div>
                  <div
                    className={`mt-0.5 text-xs sm:text-sm font-semibold tabular-nums truncate ${
                      lab.flag === 'high'
                        ? 'text-rose-700'
                        : lab.flag === 'low'
                        ? 'text-amber-700'
                        : 'text-slate-900'
                    }`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {lab.flag === 'high' ? '↑ ' : lab.flag === 'low' ? '↓ ' : ''}
                    {lab.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-5 text-xs text-slate-600 leading-relaxed">
              <div className="font-semibold text-slate-500 mb-1">
                {currentCase.isQuickReview ? 'Chemical & Formulation' : 'Active Regimen'}
              </div>
              <p className="text-slate-800">{currentCase.activeMeds.join(' · ')}</p>
            </div>
          </div>

          {/* Progressive Hint Reveal (only when requested) */}
          {hintsRevealed > 0 && !resolution && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/90 text-xs sm:text-sm text-amber-950 space-y-1.5">
              {currentCase.hints.slice(0, hintsRevealed).map((hint, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-semibold text-amber-800 shrink-0 tabular-nums">
                    Hint {idx + 1}:
                  </span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          )}

          {/* Therapeutic Target Slot OR Resolution Panel */}
          {!resolution ? (
            <div className="mt-5 p-4 rounded-xl bg-dossier-inset border border-dashed border-emerald-700/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div
                  className="text-[11px] font-semibold text-emerald-800 tracking-wide"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {currentCase.targetCue}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {currentCase.promptQuestion}
                </div>
              </div>

              <button
                type="button"
                disabled={!selectedCardId}
                onClick={() => selectedCardId && onPlayCard(selectedCardId)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {selectedCardId
                  ? `Play ${resolveDrug(selectedCardId)?.genericName ?? selectedCardId}`
                  : 'Select a Card (1–4)'}
              </button>
            </div>
          ) : (
            <div
              className={`mt-5 p-4 sm:p-5 rounded-xl border ${
                resolution.isCorrect
                  ? 'bg-emerald-50/90 border-emerald-300'
                  : 'bg-rose-50/90 border-rose-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {resolution.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      resolution.isCorrect ? 'text-emerald-950' : 'text-rose-950'
                    }`}
                  >
                    {resolution.isCorrect
                      ? `Therapeutic Target Achieved · ${correctDrug?.genericName ?? currentCase.correctDrugId}`
                      : `Adverse Outcome · Played ${chosenDrug?.genericName ?? resolution.chosenDrugId} (Optimal: ${correctDrug?.genericName ?? currentCase.correctDrugId})`}
                  </span>
                </div>

                <span
                  className="text-xs font-semibold tabular-nums text-slate-700"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {resolution.isCorrect
                    ? `+${resolution.pointsEarned} pts`
                    : gameMode === 'shift' || gameMode === 'daily'
                    ? `Stability ${resolution.stabilityDelta}`
                    : gameMode === 'quick_review'
                    ? 'MOA Review'
                    : gameMode === 'timed_exam'
                    ? 'Exam Miss'
                    : 'Study Review'}
                </span>
              </div>

              {!resolution.isCorrect && chosenDrug && (
                <p className="mt-2 text-xs sm:text-sm text-rose-900 leading-relaxed">
                  {currentCase.distractorRationales[chosenDrug.id]}
                </p>
              )}

              <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <span className="font-semibold text-slate-900">Clinical Pearl: </span>
                {currentCase.clinicalPearl}
              </p>

              {showQuickScience && correctDrug && (
                <div className="mt-3 p-3.5 rounded-lg bg-white/90 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 tabular-nums text-[11px] text-slate-800 pb-2 border-b border-slate-200/80"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    <div><span className="text-slate-500">F:</span> {correctDrug.pharmacokinetics.bioavailability}</div>
                    <div><span className="text-slate-500">t½:</span> {correctDrug.pharmacokinetics.halfLife}</div>
                    <div><span className="text-slate-500">Vd:</span> {correctDrug.pharmacokinetics.volumeOfDistribution}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Chemistry &amp; Metabolism: </span>
                    {correctDrug.chemicalClass} · {correctDrug.pharmacokinetics.metabolism}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Renal / Hepatic Dosing: </span>
                    {correctDrug.renalAndHepaticDosing}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Patient Counseling: </span>
                    {correctDrug.patientCounseling}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {voiceEngine.isSupported() && correctDrug && (
                    <button
                      type="button"
                      disabled={muted}
                      onClick={() =>
                        voiceEngine.speakResolution(
                          resolution.isCorrect,
                          correctDrug,
                          chosenDrug,
                          currentCase,
                          true
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-45 border border-slate-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                    >
                      {activeSpeechTag === `pearl:${currentCase.id}` ? (
                        <>
                          <Square className="w-3 h-3 fill-current text-emerald-700" />
                          <span>Stop Pearl</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Listen to Pearl</span>
                        </>
                      )}
                    </button>
                  )}
                  {correctDrug && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowQuickScience((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>{showQuickScience ? 'Hide PK & Counseling' : 'PK & Counseling'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectDrug(correctDrug)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Full {correctDrug.genericName} Monograph</span>
                      </button>
                    </>
                  )}
                  {!resolution.isCorrect && chosenDrug && (
                    <button
                      type="button"
                      onClick={() => setInspectDrug(chosenDrug)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Compare {chosenDrug.genericName}</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onNextCase}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>
                    {totalCases && caseIndex + 1 >= totalCases
                      ? gameMode === 'daily'
                        ? 'Finish Daily'
                        : gameMode === 'quick_review'
                        ? 'Finish Review'
                        : gameMode === 'due_review'
                        ? 'Finish Queue'
                        : gameMode === 'timed_exam'
                        ? 'Submit Exam'
                        : gameMode === 'custom_study'
                        ? 'Finish Custom Set'
                        : 'Finish Shift'
                      : 'Next Case'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Hand Zone: 4 Tactile Pharmacology Cards */}
      <section
        aria-label="Pharmacology Card Hand"
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 pb-5 pt-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentCase.cardIds.map((drugId, idx) => {
            const drug = resolveDrug(drugId);
            if (!drug) return null;
            const isDimmed = dimmedCardIds.includes(drugId) && !resolution;
            const isSelected = selectedCardId === drugId && !resolution;
            const isCorrectReveal =
              resolution && drugId === currentCase.correctDrugId;
            const isWrongChosenReveal =
              resolution &&
              !resolution.isCorrect &&
              drugId === resolution.chosenDrugId;

            const isPronouncing = activeSpeechTag === `drug:${drug.id}`;

            return (
              <div
                key={drugId}
                className={`group relative rounded-xl border transition-all duration-150 min-h-[120px] flex flex-col justify-between ${
                  isCorrectReveal
                    ? 'bg-emerald-50 border-emerald-500 text-slate-900 ring-2 ring-emerald-400/50 -translate-y-1'
                    : isWrongChosenReveal
                    ? 'bg-rose-50 border-rose-400 text-slate-900 opacity-90'
                    : resolution
                    ? 'bg-white/80 border-slate-300/60 text-slate-700 opacity-65'
                    : isDimmed
                    ? 'bg-dossier/85 border-slate-300/60 text-slate-500 opacity-35'
                    : isSelected
                    ? 'bg-white border-emerald-400 text-slate-900 -translate-y-2 shadow-xl ring-2 ring-emerald-400/70'
                    : 'bg-dossier hover:bg-white border-slate-200/80 text-slate-900 hover:-translate-y-1 shadow-md'
                }`}
              >
                <button
                  type="button"
                  disabled={!!resolution || isDimmed}
                  onClick={() => {
                    if (resolution || isDimmed) return;
                    if (isSelected) {
                      onPlayCard(drugId);
                    } else {
                      onSelectCard(drugId);
                    }
                  }}
                  className="w-full flex-1 text-left p-4 pb-2.5 flex flex-col justify-between rounded-t-xl cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <span className="text-emerald-800 shrink-0">
                      <DosageFormSvg form={drug.dosageForm} className="w-5 h-5" />
                    </span>
                    <span
                      className="text-[11px] font-medium text-slate-400 tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {isCorrectReveal
                        ? 'OPTIMAL'
                        : isWrongChosenReveal
                        ? 'ADVERSE'
                        : `[${idx + 1}]`}
                    </span>
                  </div>

                  <div className="mt-2.5 w-full">
                    <div
                      className="text-base font-semibold text-slate-900 leading-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {drug.genericName}
                    </div>
                    <div className="mt-1 text-xs text-slate-600 truncate">
                      {drug.drugClass}
                    </div>
                  </div>
                </button>

                <div className="px-4 pb-3 pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="truncate">{drug.brandNames}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="text-emerald-700 font-semibold">
                        Play →
                      </span>
                    )}
                    {voiceEngine.isSupported() && (
                      <button
                        type="button"
                        disabled={muted}
                        onClick={() => voiceEngine.pronounceDrug(drug)}
                        className={`p-1 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          isPronouncing
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'text-slate-500 hover:text-emerald-800 hover:bg-slate-200/70'
                        }`}
                        aria-label={`Pronounce ${drug.genericName}`}
                        title={`Pronounce ${drug.genericName}`}
                      >
                        {isPronouncing ? (
                          <Square className="w-3 h-3 fill-current" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {inspectDrug && (
        <MonographSheet
          drug={inspectDrug}
          isMastered={masteredDrugIds.includes(inspectDrug.id)}
          onClose={() => setInspectDrug(null)}
        />
      )}
    </div>
  );
};
