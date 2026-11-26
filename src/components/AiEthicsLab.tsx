import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Scale,
  ShieldCheck,
  Square,
  Volume2,
} from 'lucide-react';
import {
  COHORT_REFLECTION_ITEMS,
  PAIP_DILEMMA_CASES,
  PAIP_FACTORS,
  PAIP_STUDY_STATS,
  PHARMACY_AI_ROADMAP,
} from '../data/aiCurriculum';
import { PaipFactor } from '../types/pharma';
import { soundEngine } from '../utils/sound';
import { voiceEngine } from '../utils/voice';

interface Props {
  solvedDilemmaIds: string[];
  muted: boolean;
  onSolveDilemma: (dilemmaId: string) => void;
}

type LabTab = 'framework' | 'dilemmas' | 'reflection';

const FACTOR_LABEL: Record<PaipFactor, string> = {
  augmented_healthcare: 'Factor 1 · Augmented Healthcare (AH)',
  ai_dehumanization: 'Factor 2 · AI-Dehumanization (AD)',
  information_misuse: 'Factor 3 · Information Misuse (IM)',
};

export const AiEthicsLab: React.FC<Props> = ({
  solvedDilemmaIds,
  muted,
  onSolveDilemma,
}) => {
  const [labTab, setLabTab] = useState<LabTab>('framework');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [reflectionChoices, setReflectionChoices] = useState<Record<string, string>>({});
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );

  useEffect(() => {
    const unsub = voiceEngine.subscribe(setActiveSpeechTag);
    return () => {
      unsub();
    };
  }, []);

  const solvedSet = new Set(solvedDilemmaIds);

  const handleSelectDilemmaOption = (
    dilemmaId: string,
    optionIdx: number,
    isOptimal: boolean
  ) => {
    setSelectedOptions((prev) => ({ ...prev, [dilemmaId]: optionIdx }));
    if (isOptimal) {
      soundEngine.playTherapeuticMatch();
      onSolveDilemma(dilemmaId);
    } else {
      soundEngine.playAdversePulse();
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Lab Header & Sub-Navigation */}
      <div className="p-5 rounded-xl bg-surface border border-line/12 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-accent-text">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Pharmacy AI Curriculum &amp; Ethics Module</span>
          </div>
          <h2
            className="mt-1 text-xl sm:text-2xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Balancing AI Advances with Human-Centered Pharmacy Care
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted max-w-3xl">
            Modeled on the Perceptions on AI in Pharmacy (PAIP) study (n = 245 BPharm students):
            build pharmacoinformatics competence while safeguarding empathy, equity, and patient privacy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-deep rounded-xl border border-line/12 shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiTick();
              setLabTab('framework');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              labTab === 'framework'
                ? 'bg-accent-bg text-on-accent font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-wash/6'
            }`}
          >
            PAIP &amp; Roadmap
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiTick();
              setLabTab('dilemmas');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              labTab === 'dilemmas'
                ? 'bg-accent-bg text-on-accent font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-wash/6'
            }`}
          >
            Ethics Cases ({solvedSet.size}/{PAIP_DILEMMA_CASES.length})
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiTick();
              setLabTab('reflection');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              labTab === 'reflection'
                ? 'bg-accent-bg text-on-accent font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-wash/6'
            }`}
          >
            Cohort Reflection
          </button>
        </div>
      </div>

      {labTab === 'framework' && (
        <div className="space-y-6">
          {/* Key Empirical Survey Findings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PAIP_STUDY_STATS.map((stat) => (
              <div
                key={stat.id}
                className="p-4 rounded-xl bg-surface border border-line/12 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="text-2xl font-semibold text-accent-text tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {stat.metric}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-ink">
                    {stat.label}
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>

          {/* 3-Factor PAIP Structure */}
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-ink-muted mb-3">
              Three-Factor Perceptions on AI in Pharmacy (PAIP) Framework
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {PAIP_FACTORS.map((factor) => (
                <div
                  key={factor.id}
                  className="p-5 rounded-xl bg-dossier text-slate-900 border border-slate-200 flex flex-col justify-between gap-4 shadow-sm"
                >
                  <div>
                    <div
                      className="text-xs font-semibold text-emerald-800"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {factor.code}
                    </div>
                    <h4
                      className="mt-1 text-lg font-semibold text-slate-900"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {factor.title}
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {factor.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                    <div className="text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-800">Survey Finding: </span>
                      {factor.surveyHighlight}
                    </div>
                    <div className="text-emerald-900 leading-relaxed">
                      <span className="font-semibold">Pharmacist Safeguard: </span>
                      {factor.pharmacistSafeguard}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Year Scaffolded Curriculum Roadmap */}
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-ink-muted mb-3">
              Scaffolded 4-Year Pharmacy AI Curriculum Roadmap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PHARMACY_AI_ROADMAP.map((stage) => (
                <div
                  key={stage.year}
                  className="p-5 rounded-xl bg-surface border border-line/12 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className="font-semibold text-accent-text"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {stage.year}
                      </span>
                      <span className="text-ink-muted/85">Progressive Competency</span>
                    </div>
                    <h4
                      className="mt-1 text-lg font-semibold text-ink"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {stage.title}
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-ink-muted">
                      {stage.focus}
                    </p>
                  </div>

                  <ul className="pt-3 border-t border-line/10 space-y-1.5 text-xs text-ink/85">
                    {stage.competencies.map((comp) => (
                      <li key={comp} className="flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent-text mt-0.5 shrink-0" />
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {labTab === 'dilemmas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            <span>
              Evaluate each clinical AI dilemma using the PAIP framework to practice ethical judgment alongside informatics skills.
            </span>
            <span className="font-semibold text-accent-text tabular-nums">
              {solvedSet.size} of {PAIP_DILEMMA_CASES.length} dilemmas resolved
            </span>
          </div>

          {PAIP_DILEMMA_CASES.map((dilemma) => {
            const chosenIdx = selectedOptions[dilemma.id];
            const chosenOption =
              chosenIdx !== undefined ? dilemma.options[chosenIdx] : null;
            const isSolved = solvedSet.has(dilemma.id);
            const speechTag = `dilemma:${dilemma.id}`;
            const isSpeaking = activeSpeechTag === speechTag;

            return (
              <div
                key={dilemma.id}
                className="p-5 sm:p-6 rounded-xl bg-dossier text-slate-900 border border-slate-200 space-y-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-emerald-800">{dilemma.yearTier}</span>
                      <span aria-hidden="true">·</span>
                      <span>{FACTOR_LABEL[dilemma.paipFactor]}</span>
                      {isSolved && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolved
                          </span>
                        </>
                      )}
                    </div>
                    <h3
                      className="mt-1 text-lg sm:text-xl font-semibold text-slate-900"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {dilemma.title}
                    </h3>
                  </div>

                  {voiceEngine.isSupported() && (
                    <button
                      type="button"
                      disabled={muted}
                      onClick={() =>
                        voiceEngine.toggleSpeak(
                          `${dilemma.title}. ${dilemma.scenario} ${dilemma.aiSystemNote} ${dilemma.question}`,
                          speechTag,
                          { rate: 0.96 }
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-45 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3 h-3 fill-current text-emerald-700" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {dilemma.scenario}
                </p>

                <div
                  className="px-3.5 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {dilemma.aiSystemNote}
                </div>

                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-2.5">
                    {dilemma.question}
                  </div>
                  <div className="space-y-2">
                    {dilemma.options.map((opt, idx) => {
                      const isChosen = chosenIdx === idx;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() =>
                            handleSelectDilemmaOption(
                              dilemma.id,
                              idx,
                              opt.isOptimal
                            )
                          }
                          className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm transition-colors cursor-pointer ${
                            isChosen
                              ? opt.isOptimal
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                                : 'bg-rose-50 border-rose-400 text-rose-950 font-medium'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {chosenOption && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                      chosenOption.isOptimal
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {chosenOption.isOptimal ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                      )}
                      <span>{chosenOption.feedback}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900">Humanistic Takeaway: </span>
                      {dilemma.humanisticTakeaway}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {labTab === 'reflection' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface border border-line/12 flex items-center gap-3 text-xs sm:text-sm text-ink-muted">
            <Scale className="w-4 h-4 text-accent-text shrink-0" />
            <span>
              Record your personal clinical stance on each PAIP item to compare with the 245 undergraduate pharmacy students surveyed in Aqeel &amp; John (2025/2026).
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COHORT_REFLECTION_ITEMS.map((item) => {
              const stance = reflectionChoices[item.id];
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-dossier text-slate-900 border border-slate-200 flex flex-col justify-between gap-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      “{item.statement}”
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(['Agree', 'Neutral', 'Disagree'] as const).map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => {
                            soundEngine.playUiTick();
                            setReflectionChoices((prev) => ({
                              ...prev,
                              [item.id]: choice,
                            }));
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            stance === choice
                              ? 'bg-emerald-700 border-emerald-700 text-white'
                              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>

                  {stance ? (
                    <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                      <div
                        className="font-semibold text-emerald-900 tabular-nums"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {item.cohortSplit}
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {item.interpretation}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Select a stance above to reveal the BPharm study benchmark.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-ink-muted/85 pt-2 border-t border-line/12">
        Curricular model &amp; PAIP benchmarks adapted from Aqeel U., John S. (2025/2026), “Artificial Intelligence in Pharmacy Education: Balancing Technological Advances and Ethical Concerns Among Aspiring Pharmacists,” Health Professions Education 12(1):41–54.
      </p>
    </div>
  );
};
