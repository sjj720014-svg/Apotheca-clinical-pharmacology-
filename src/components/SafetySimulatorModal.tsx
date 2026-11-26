import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  SafetyScenario,
  SafetyScenarioCategory,
  SafetyScenarioOption,
} from '../types/pharma';
import { SAFETY_SCENARIOS } from '../data/safetyScenarios';
import { SPECIALTY_META } from '../data/drugs';
import { ApothecaThemeId } from '../utils/themes';
import { soundEngine } from '../utils/sound';
import { voiceEngine, VoiceStatusSnapshot } from '../utils/voice';
import { StudyAudioPopover, StudyAudioProps } from './StudyAudioPopover';
import { ThemePopover } from './ThemePopover';

interface Props {
  solvedSafetyIds: string[];
  muted: boolean;
  audioProps: StudyAudioProps;
  themeId: ApothecaThemeId;
  onSelectTheme: (themeId: ApothecaThemeId) => void;
  onSolveScenario: (scenarioId: string) => void;
  onToggleMute: () => void;
  onBack: () => void;
}

type CategoryFilter = 'all' | SafetyScenarioCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All Checks' },
  { id: 'cyp450', label: 'CYP450 & Enzyme' },
  { id: 'renal_dosing', label: 'Renal / CrCl' },
  { id: 'qtc_risk', label: 'QTc & Toxicity' },
  { id: 'contraindication', label: 'Contraindications' },
  { id: 'safe_verify', label: 'Safe Approvals' },
];

const CATEGORY_LABEL: Record<SafetyScenarioCategory, string> = {
  cyp450: 'CYP450 / Metabolic Check',
  renal_dosing: 'Renal & CrCl Dosing',
  qtc_risk: 'QTc & Arrhythmia Screen',
  contraindication: 'Contraindication & Washout',
  safe_verify: 'Safe Order Verification',
};

export const SafetySimulatorModal: React.FC<Props> = ({
  solvedSafetyIds,
  muted,
  audioProps,
  themeId,
  onSelectTheme,
  onSolveScenario,
  onToggleMute,
  onBack,
}) => {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SafetyScenarioOption | null>(null);
  const [voiceSnap, setVoiceSnap] = useState<VoiceStatusSnapshot>(() =>
    voiceEngine.getSnapshot()
  );

  useEffect(() => {
    const unsub = voiceEngine.subscribe((_tag, snap) => setVoiceSnap(snap));
    return () => {
      unsub();
      voiceEngine.stop();
    };
  }, []);

  const filteredScenarios = useMemo<SafetyScenario[]>(() => {
    if (category === 'all') return SAFETY_SCENARIOS;
    return SAFETY_SCENARIOS.filter((s) => s.category === category);
  }, [category]);

  const safeIndex =
    filteredScenarios.length > 0
      ? Math.min(index, filteredScenarios.length - 1)
      : 0;
  const currentScenario = filteredScenarios[safeIndex];
  const solvedSet = useMemo(() => new Set(solvedSafetyIds), [solvedSafetyIds]);

  const handleSelectCategory = (nextCat: CategoryFilter) => {
    soundEngine.playUiTick();
    voiceEngine.stop();
    setCategory(nextCat);
    setIndex(0);
    setShowHint(false);
    setSelectedOption(null);
  };

  const handleChooseOption = (option: SafetyScenarioOption) => {
    if (selectedOption || !currentScenario) return;
    setSelectedOption(option);
    if (option.isCorrect) {
      soundEngine.playTherapeuticMatch(1);
      onSolveScenario(currentScenario.id);
    } else {
      soundEngine.playAdversePulse(false);
    }
  };

  const handleNext = () => {
    soundEngine.playUiTick();
    voiceEngine.stop();
    setShowHint(false);
    setSelectedOption(null);
    setIndex((prev) =>
      filteredScenarios.length > 0 ? (prev + 1) % filteredScenarios.length : 0
    );
  };

  const handleListen = () => {
    if (!currentScenario) return;
    const tag = `safety:${currentScenario.id}`;
    const script = `${currentScenario.title}. ${currentScenario.patientSummary}. ${currentScenario.creatinineClearanceNote}. Pending order: ${currentScenario.pendingOrder}. ${currentScenario.promptQuestion}`;
    voiceEngine.toggleSpeak(script, tag, {
      style: 'Calm, meticulous hospital verifying pharmacist reviewing medication safety',
    });
  };

  const speechTag = currentScenario ? `safety:${currentScenario.id}` : '';
  const isSpeaking = voiceSnap.activeTag === speechTag;
  const isLoadingSpeech = voiceSnap.loadingTag === speechTag;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <div className="max-w-5xl w-full mx-auto px-5 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-line/12">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                voiceEngine.stop();
                onBack();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-wash/8 hover:bg-wash/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div>
              <h1
                className="text-xl sm:text-2xl font-semibold text-ink flex items-center gap-2.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <ShieldCheck className="w-5 h-5 text-accent-text shrink-0" />
                <span>Drug-Drug Interaction &amp; Renal Dosing Simulator</span>
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5 tabular-nums">
                Order verification drill · {solvedSafetyIds.length} of {SAFETY_SCENARIOS.length} checks verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemePopover themeId={themeId} onSelectTheme={onSelectTheme} compact />
            <StudyAudioPopover {...audioProps} compact />
            <button
              type="button"
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-wash/8 hover:bg-wash/14 text-ink-muted hover:text-ink transition-colors cursor-pointer"
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              title="Toggle Mute"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Category Filter Tabs */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface rounded-xl border border-line/12">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  category === tab.id
                    ? 'bg-accent-bg text-on-accent font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-wash/6'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filteredScenarios.map((item, idx) => {
              const isSolved = solvedSet.has(item.id);
              const isActive = idx === safeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiTick();
                    voiceEngine.stop();
                    setIndex(idx);
                    setShowHint(false);
                    setSelectedOption(null);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-medium tabular-nums transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-accent-bg text-on-accent font-bold'
                      : isSolved
                      ? 'bg-accent-bg/18 border border-accent-ring/50 text-accent-text'
                      : 'bg-surface border border-line/12 text-ink-muted hover:border-line/30 hover:text-ink'
                  }`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                  title={item.title}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Verification Dossier */}
        {currentScenario && (
          <main className="mt-5 flex-1 flex flex-col justify-center">
            <div className="rounded-2xl bg-dossier text-slate-900 border border-slate-200/80 shadow-2xl p-5 sm:p-7 space-y-5">
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-emerald-800">
                    {CATEGORY_LABEL[currentScenario.category]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{SPECIALTY_META[currentScenario.specialty].shortLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className="tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Order {safeIndex + 1} / {filteredScenarios.length}
                  </span>
                  {solvedSet.has(currentScenario.id) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!selectedOption && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playHintReveal();
                        setShowHint((v) => !v);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-medium text-amber-900 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                      <span>{showHint ? 'Hide Hint' : 'CrCl / Safety Hint'}</span>
                    </button>
                  )}

                  {voiceEngine.isSupported() && (
                    <button
                      type="button"
                      disabled={muted}
                      onClick={handleListen}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-45 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isLoadingSpeech || isSpeaking ? (
                        <>
                          <Square className="w-3 h-3 fill-current text-emerald-700" />
                          <span>{isLoadingSpeech ? 'Synthesizing...' : 'Stop'}</span>
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
              </div>

              <div>
                <h2
                  className="text-xl sm:text-2xl font-semibold text-slate-950"
                  style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}
                >
                  {currentScenario.title}
                </h2>
                <p className="mt-1 text-sm text-slate-700">
                  {currentScenario.patientSummary}
                  <span className="mx-2 text-slate-400" aria-hidden="true">·</span>
                  <span className="font-medium text-slate-800">
                    {currentScenario.creatinineClearanceNote}
                  </span>
                </p>
              </div>

              {/* Labs & Pending Order Grid */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-6 grid grid-cols-3 gap-2.5">
                  {currentScenario.labs.map((lab) => (
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

                <div className="md:col-span-6 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500">Active Profile: </span>
                    <span className="text-slate-800">
                      {currentScenario.activeMeds.join(' · ')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300/80">
                    <div
                      className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Pending Pharmacy Order to Verify
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-950">
                      {currentScenario.pendingOrder}
                    </div>
                  </div>
                </div>
              </div>

              {showHint && !selectedOption && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950">
                  <span className="font-semibold text-amber-800">Clinical Cue: </span>
                  {currentScenario.crclHint}
                </div>
              )}

              {/* Prompt Question & 4 Options */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-900">
                  {currentScenario.promptQuestion}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentScenario.options.map((opt, idx) => {
                    const isPicked = selectedOption?.id === opt.id;
                    const revealCorrect = Boolean(selectedOption) && opt.isCorrect;
                    const revealWrong = isPicked && !opt.isCorrect;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={Boolean(selectedOption)}
                        onClick={() => handleChooseOption(opt)}
                        className={`text-left px-4 py-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 cursor-pointer disabled:cursor-default ${
                          revealCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                            : revealWrong
                            ? 'bg-rose-50 border-rose-400 text-rose-950'
                            : selectedOption
                            ? 'bg-white/60 border-slate-200 text-slate-500 opacity-70'
                            : 'bg-white hover:bg-dossier-inset border-slate-200 hover:border-emerald-500/60 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="text-xs font-semibold text-slate-400 mt-0.5 tabular-nums shrink-0"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {idx + 1}.
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-snug">
                            {opt.label}
                          </span>
                        </div>

                        {revealCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        )}
                        {revealWrong && (
                          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resolution & Reference */}
              {selectedOption && (
                <div
                  className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${
                    selectedOption.isCorrect
                      ? 'bg-emerald-50/90 border-emerald-300'
                      : 'bg-rose-50/90 border-rose-300'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {selectedOption.rationale}
                  </p>
                  {!selectedOption.isCorrect && (
                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                      <span className="font-semibold">Correct Action: </span>
                      {
                        currentScenario.options.find((o) => o.isCorrect)
                          ?.rationale
                      }
                    </p>
                  )}
                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-600">
                      <strong className="text-slate-800">Reference: </strong>
                      {currentScenario.clinicalReference}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Next Verification Check</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
