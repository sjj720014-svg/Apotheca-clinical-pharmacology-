import React, { useMemo } from 'react';
import { Flame, Play, RefreshCw, Target, TrendingUp } from 'lucide-react';
import { PlayerProgress, Specialty } from '../types/pharma';
import { CLINICAL_CASES } from '../data/cases';
import { DRUG_MAP, DRUG_MONOGRAPHS, SPECIALTY_META } from '../data/drugs';
import {
  computeSpecialtyAnalytics,
  getDueTodaySummary,
} from '../utils/spacedRepetition';
import { soundEngine } from '../utils/sound';

interface Props {
  progress: PlayerProgress;
  onStartDueReview: (specialtyFilter?: Specialty) => void;
  onDrillWeakestTrack: (specialty: Specialty) => void;
}

export const ReviewAnalyticsPanel: React.FC<Props> = ({
  progress,
  onStartDueReview,
  onDrillWeakestTrack,
}) => {
  const dueSummary = useMemo(
    () => getDueTodaySummary(progress, CLINICAL_CASES, DRUG_MONOGRAPHS),
    [progress]
  );

  const analytics = useMemo(
    () => computeSpecialtyAnalytics(progress, CLINICAL_CASES, DRUG_MONOGRAPHS),
    [progress]
  );

  const missedRecords = dueSummary.dueCaseRecords.filter(
    (r) => r.lastResult === 'missed'
  );

  return (
    <div className="mt-6 space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface border border-line/12">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <RefreshCw className="w-3.5 h-3.5 text-accent-text" />
            <span>Due Today Queue</span>
          </div>
          <div
            className="mt-1 text-2xl font-semibold text-ink tabular-nums"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {dueSummary.totalDueCount} items
          </div>
          <div className="mt-0.5 text-[11px] text-ink-muted/85 tabular-nums">
            {dueSummary.dueCases.length} scheduled {dueSummary.dueCases.length === 1 ? 'case' : 'cases'} · {dueSummary.unmasteredDrugs.length} unmastered
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-line/12">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Flame className="w-3.5 h-3.5 text-warn-text" />
            <span>Daily Study Streak</span>
          </div>
          <div
            className="mt-1 text-2xl font-semibold text-warn-text tabular-nums"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {progress.studyStreakDays ?? 0} {(progress.studyStreakDays ?? 0) === 1 ? 'day' : 'days'}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-muted/85">
            Peak case streak: {progress.bestStreak}×
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-line/12">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <TrendingUp className="w-3.5 h-3.5 text-accent-text" />
            <span>Overall Accuracy</span>
          </div>
          <div
            className="mt-1 text-2xl font-semibold text-accent-text tabular-nums"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {analytics.overallAccuracyPct !== null
              ? `${analytics.overallAccuracyPct}%`
              : '—'}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-muted/85 tabular-nums">
            {progress.totalCasesSolved} / {progress.totalCasesAttempted} solved
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-line/12">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Target className="w-3.5 h-3.5 text-danger-text" />
            <span>Priority Track</span>
          </div>
          <div className="mt-1 text-lg font-semibold text-ink truncate">
            {analytics.weakestSpecialty?.shortLabel ?? 'Balanced'}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-muted/85 tabular-nums">
            {analytics.weakestSpecialty
              ? `${analytics.weakestSpecialty.masteryPct}% formulary mastery`
              : 'Complete cases to calibrate'}
          </div>
        </div>
      </div>

      {/* Primary Action Strip */}
      <div className="rounded-2xl bg-dossier text-slate-900 border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 max-w-xl">
          <h2
            className="text-lg sm:text-xl font-semibold text-slate-950"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Spaced Repetition Review Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Missed cases return immediately to today’s queue, while solved drugs advance from 2 days to 4+ days based on SM-2 recall intervals and hint usage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiTick();
              onStartDueReview();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Due Today Review</span>
          </button>

          {analytics.weakestSpecialty && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                onDrillWeakestTrack(analytics.weakestSpecialty!.specialty);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Drill {analytics.weakestSpecialty.shortLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Specialty Breakdown & Missed Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 rounded-2xl bg-surface border border-line/12 p-5 space-y-4">
          <div className="text-xs font-semibold text-accent-text uppercase tracking-wider">
            Weak-Specialty Analytics &amp; Mastery
          </div>

          <div className="space-y-3.5">
            {analytics.rows.map((row) => (
              <div
                key={row.specialty}
                className="p-3.5 rounded-xl bg-deep/75 border border-line/10 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-ink">{row.label}</span>
                  <div
                    className="flex items-center gap-3 text-ink-muted tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    <span>
                      Mastered {row.masteredCount}/{row.totalDrugs} ({row.masteryPct}%)
                    </span>
                    <span>
                      Accuracy:{' '}
                      {row.accuracyPct !== null ? `${row.accuracyPct}%` : '—'}
                    </span>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-wash/12 overflow-hidden">
                  <div
                    className="h-full bg-accent-bg transition-all duration-300"
                    style={{ width: `${row.masteryPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-muted/85">
                  <span className="tabular-nums">{row.dueCount} items ready for review</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playUiTick();
                      onStartDueReview(row.specialty);
                    }}
                    className="text-accent-text hover:opacity-80 font-medium cursor-pointer"
                  >
                    Review {row.shortLabel} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-surface border border-line/12 p-5 space-y-3.5">
          <div className="text-xs font-semibold text-accent-text uppercase tracking-wider">
            Scheduled Due &amp; Missed Cases ({dueSummary.dueCases.length})
          </div>

          {dueSummary.dueCases.length === 0 ? (
            <div className="p-4 rounded-xl bg-deep/70 border border-line/10 text-xs text-ink-muted leading-relaxed">
              No previously missed or expired cases are waiting right now. Clicking{' '}
              <strong className="text-ink">Start Due Today Review</strong> will build an adaptive queue from your unmastered formulary monographs.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[24rem] overflow-y-auto pr-1">
              {dueSummary.dueCases.map((c) => {
                const rec = dueSummary.dueCaseRecords.find((r) => r.itemId === c.id);
                const drug = DRUG_MAP[c.correctDrugId];
                const isMissed = missedRecords.some((m) => m.itemId === c.id);

                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-dossier text-slate-900 border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-emerald-800">
                        {SPECIALTY_META[c.specialty].shortLabel}
                      </span>
                      <span
                        className={`font-semibold ${
                          isMissed ? 'text-rose-700' : 'text-amber-700'
                        }`}
                      >
                        {isMissed ? 'Missed Recall' : 'Interval Due'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-950 truncate">
                      {c.title}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between gap-2">
                      <span className="truncate">
                        Target: {drug?.genericName ?? c.correctDrugId}
                      </span>
                      {rec && (
                        <span
                          className="text-[11px] text-slate-500 tabular-nums shrink-0"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          Lapses: {rec.lapses}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
