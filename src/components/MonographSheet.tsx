import React, { useEffect, useState } from 'react';
import { CheckCircle2, Speech, Square, Volume2, X } from 'lucide-react';
import { DrugMonograph } from '../types/pharma';
import { SPECIALTY_META } from '../data/drugs';
import { soundEngine } from '../utils/sound';
import { voiceEngine } from '../utils/voice';
import { DosageFormSvg } from './DosageFormSvg';

interface Props {
  drug: DrugMonograph;
  isMastered: boolean;
  onClose: () => void;
}

export const MonographSheet: React.FC<Props> = ({ drug, isMastered, onClose }) => {
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );

  useEffect(() => {
    soundEngine.playMonographOpen();
    const unsub = voiceEngine.subscribe(setActiveSpeechTag);
    return () => {
      unsub();
      voiceEngine.stop();
    };
  }, [drug.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pkEntries = [
    { label: 'Bioavailability (F)', value: drug.pharmacokinetics.bioavailability },
    { label: 'Half-Life (t½)', value: drug.pharmacokinetics.halfLife },
    { label: 'Volume of Distribution (Vd)', value: drug.pharmacokinetics.volumeOfDistribution },
    { label: 'Metabolism', value: drug.pharmacokinetics.metabolism },
    { label: 'Excretion', value: drug.pharmacokinetics.excretion },
    { label: 'Protein Binding', value: drug.pharmacokinetics.proteinBinding },
    ...(drug.pharmacokinetics.therapeuticTargetOrIndex
      ? [{ label: 'Target / Therapeutic Index', value: drug.pharmacokinetics.therapeuticTargetOrIndex }]
      : []),
  ];

  const isSpeakingSummary = activeSpeechTag === `drug:${drug.id}`;
  const isPronouncingName = activeSpeechTag === `pronounce:${drug.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${drug.genericName} Monograph`}
    >
      <div
        className="relative h-full w-full max-w-xl bg-dossier text-slate-900 overflow-y-auto shadow-2xl border-l border-slate-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-950/5 border border-slate-200 flex items-center justify-center text-emerald-800 shrink-0">
              <DosageFormSvg form={drug.dosageForm} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{SPECIALTY_META[drug.specialty].label}</span>
                <span aria-hidden="true">·</span>
                <span>{drug.drugClass}</span>
                {isMastered && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mastered
                    </span>
                  </>
                )}
              </div>
              <h2
                className="text-2xl font-semibold text-slate-900 mt-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {drug.genericName}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Brands: {drug.brandNames}
              </p>

              {voiceEngine.isSupported() && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      voiceEngine.toggleSpeak(
                        `${drug.genericName}. Brand names: ${drug.brandNames}.`,
                        `pronounce:${drug.id}`,
                        { rate: 0.9 }
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isPronouncingName ? (
                      <>
                        <Square className="w-3 h-3 fill-current text-emerald-700" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Pronounce Name</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => voiceEngine.pronounceDrug(drug, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isSpeakingSummary ? (
                      <>
                        <Square className="w-3 h-3 fill-current text-emerald-700" />
                        <span>Stop Summary</span>
                      </>
                    ) : (
                      <>
                        <Speech className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Read Summary</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
            aria-label="Close monograph"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-xs font-semibold tracking-wide text-slate-500">
              Molecular Target, Chemistry &amp; Mechanism
            </h3>
            <p className="mt-1.5 text-sm font-semibold text-emerald-900">
              {drug.molecularTarget}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Chemical structure: {drug.chemicalClass}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {drug.mechanism}
            </p>
          </section>

          <section className="pt-5 border-t border-slate-200">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500 mb-3">
              Pharmacokinetic Profile
            </h3>
            <dl className="divide-y divide-slate-200/80 border border-slate-200 rounded-xl bg-white">
              {pkEntries.map((item) => (
                <div
                  key={item.label}
                  className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4"
                >
                  <dt className="text-xs font-medium text-slate-500 shrink-0">
                    {item.label}
                  </dt>
                  <dd
                    className="text-xs text-slate-900 sm:text-right tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="pt-5 border-t border-slate-200 grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-emerald-800">
                High-Yield Clinical Pearls
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {drug.clinicalPearls}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500">
                Renal &amp; Hepatic Dosing
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {drug.renalAndHepaticDosing}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500">
                Pharmacist Patient Counseling
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {drug.patientCounseling}
              </p>
            </div>
          </section>

          <section className="pt-5 border-t border-slate-200 grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-rose-800">
                Contraindications &amp; Warnings
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {drug.contraindications}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-amber-800">
                Major Drug Interactions
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {drug.majorInteractions}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500">
                Therapeutic Monitoring
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {drug.monitoring}
              </p>
            </div>
            {drug.antidoteOrReversal && (
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-slate-500">
                  Reversal / Antidote
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-900 font-medium">
                  {drug.antidoteOrReversal}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
