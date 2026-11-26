import React from 'react';
import { Printer, X } from 'lucide-react';
import {
  CaseOutcome,
  ClinicalCase,
  CustomStudyDeck,
  DrugMonograph,
  PlayerProgress,
} from '../types/pharma';
import { CLINICAL_CASES } from '../data/cases';
import { DRUG_MAP } from '../data/drugs';

interface Props {
  progress: PlayerProgress;
  sessionOutcomes?: CaseOutcome[];
  customDecks?: CustomStudyDeck[];
  customDrugMap?: Record<string, DrugMonograph>;
  customCaseMap?: Record<string, ClinicalCase>;
  onClose: () => void;
}

const BUILTIN_CASE_MAP: Record<string, ClinicalCase> = Object.fromEntries(
  CLINICAL_CASES.map((c) => [c.id, c])
);

export const PrintableStudySheetModal: React.FC<Props> = ({
  progress,
  sessionOutcomes,
  customDecks = [],
  customDrugMap = {},
  customCaseMap = {},
  onClose,
}) => {
  const allDrugs: Record<string, DrugMonograph> = {
    ...DRUG_MAP,
    ...customDrugMap,
  };
  const allCases: Record<string, ClinicalCase> = {
    ...BUILTIN_CASE_MAP,
    ...customCaseMap,
  };

  const bookmarkedCases = (progress.bookmarkedCaseIds ?? [])
    .map((id) => allCases[id])
    .filter((c): c is ClinicalCase => Boolean(c));

  const outcomes =
    sessionOutcomes && sessionOutcomes.length > 0
      ? sessionOutcomes
      : (progress.solvedOutcomes ?? []).slice(0, 25);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 overflow-y-auto p-4 sm:p-8 print-only-container"
      role="dialog"
      aria-modal="true"
      aria-label="Printable Study Sheet"
    >
      <div className="max-w-4xl mx-auto rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl overflow-hidden">
        {/* Screen-only toolbar */}
        <div className="no-print px-6 py-4 bg-canvas text-ink border-b border-line/12 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">
              Printable Pharmacology Study Sheet
            </div>
            <div className="text-xs text-ink-muted">
              Use your browser print dialog to print or Save as PDF cleanly.
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-bg hover:bg-accent-hover text-on-accent text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-wash/10 hover:bg-wash/18 text-xs font-medium text-ink transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="pb-4 border-b border-slate-300 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-bold text-slate-950"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Apotheca — Clinical Therapeutics Study Sheet
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Generated {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} ·{' '}
                {progress.masteredDrugIds.length} Mastered Monographs ·{' '}
                {progress.studyStreakDays ?? 0}-Day Study Streak
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 leading-relaxed">
            <strong>Academic Integrity &amp; Clinical Citation Notice:</strong>{' '}
            Any AI-generated practice cases or questions below are marked{' '}
            <strong>[AI-Generated]</strong>. Always verify doses, renal thresholds,
            and clinical recommendations against primary references (Lexicomp,
            UpToDate, FDA labeling, or course syllabi).
          </div>

          {/* Bookmarked Cases */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
              Bookmarked Clinical Cases ({bookmarkedCases.length})
            </h2>
            {bookmarkedCases.length === 0 ? (
              <p className="text-xs text-slate-500">
                No bookmarked cases in this profile yet.
              </p>
            ) : (
              <div className="space-y-3">
                {bookmarkedCases.map((c, idx) => {
                  const drug = allDrugs[c.correctDrugId];
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl border border-slate-200 space-y-1.5 break-inside-avoid"
                    >
                      <div className="text-sm font-semibold text-slate-950">
                        {idx + 1}. {c.title} ({c.patientLine})
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {c.presentation}
                      </p>
                      <div className="text-xs text-slate-800">
                        <strong>Optimal Therapy:</strong>{' '}
                        {drug
                          ? `${drug.genericName} (${drug.brandNames}) — ${drug.drugClass}`
                          : c.correctDrugId}
                      </div>
                      <div className="text-xs text-slate-700">
                        <strong>Clinical Pearl:</strong> {c.clinicalPearl}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Session / Recent Outcomes */}
          {outcomes.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                Solved &amp; Missed Case Review ({outcomes.length})
              </h2>
              <div className="space-y-2">
                {outcomes.map((o, idx) => {
                  const target = allDrugs[o.correctDrugId];
                  const matchedCase = allCases[o.caseId];
                  return (
                    <div
                      key={`${o.caseId}-${idx}`}
                      className="p-3 rounded-lg border border-slate-200 text-xs space-y-1 break-inside-avoid"
                    >
                      <div className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                        <span>
                          {matchedCase?.isCustomStudy ? '[AI-Generated] ' : ''}
                          {o.caseTitle}
                        </span>
                        <span
                          className={
                            o.isCorrect ? 'text-emerald-800' : 'text-rose-700'
                          }
                        >
                          {o.isCorrect ? 'OPTIMAL' : 'REVIEW'}
                        </span>
                      </div>
                      <div className="text-slate-700">
                        Target: <strong>{target?.genericName ?? o.correctDrugId}</strong>
                        {matchedCase?.citationNote
                          ? ` · Citation: ${matchedCase.citationNote}`
                          : ''}
                      </div>
                      {matchedCase?.clinicalPearl && (
                        <div className="text-slate-600">
                          {matchedCase.clinicalPearl}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Custom AI Study Decks */}
          {customDecks.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                AI-Generated Study Cases from Uploaded Materials
              </h2>
              {customDecks.map((deck) => {
                const deckDrugMap = Object.fromEntries(
                  deck.drugs.map((d) => [d.id, d])
                );
                return (
                  <div key={`${deck.docId}-${deck.generatedAt}`} className="space-y-2">
                    <div className="text-xs font-semibold text-emerald-900">
                      Source: {deck.docName}
                    </div>
                    {deck.cases.map((c, idx) => {
                      const target = deckDrugMap[c.correctDrugId] ?? allDrugs[c.correctDrugId];
                      return (
                        <div
                          key={c.id}
                          className="p-3 rounded-lg border border-slate-200 text-xs space-y-1 break-inside-avoid"
                        >
                          <div className="font-semibold text-slate-950">
                            {idx + 1}. [AI-Generated] {c.title}
                          </div>
                          <p className="text-slate-700">{c.presentation}</p>
                          <div className="text-slate-800">
                            <strong>Answer:</strong>{' '}
                            {target ? `${target.genericName} (${target.drugClass})` : c.correctDrugId}
                          </div>
                          <div className="text-slate-600">
                            <strong>Citation:</strong>{' '}
                            {c.citationNote || `Derived from ${deck.docName}`} ·{' '}
                            <em>Verify against primary clinical guidelines.</em>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
