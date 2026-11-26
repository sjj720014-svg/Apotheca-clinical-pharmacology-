import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Search,
  Square,
  Volume2,
} from 'lucide-react';
import { HUMAN_BODY_SYSTEMS } from '../data/bodySystems';
import { DRUG_MAP } from '../data/drugs';
import {
  BodySystemId,
  DrugMonograph,
  LiveUpdatesFeedState,
} from '../types/pharma';
import { formatRelativeCheckTime } from '../utils/liveUpdater';
import { soundEngine } from '../utils/sound';
import { voiceEngine } from '../utils/voice';

interface Props {
  liveFeed: LiveUpdatesFeedState;
  isManualRefreshing: boolean;
  refreshError?: string | null;
  onRefreshSystem: (systemId: BodySystemId) => void;
  onInspectDrug: (drug: DrugMonograph) => void;
}

export const BodySystemsAtlas: React.FC<Props> = ({
  liveFeed,
  isManualRefreshing,
  refreshError,
  onRefreshSystem,
  onInspectDrug,
}) => {
  const [selectedId, setSelectedId] = useState<BodySystemId>('cardiovascular');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );

  useEffect(() => {
    const unsub = voiceEngine.subscribe(setActiveSpeechTag);
    return () => unsub();
  }, []);

  const filteredSystems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return HUMAN_BODY_SYSTEMS;
    return HUMAN_BODY_SYSTEMS.filter((sys) => {
      const haystack = [
        sys.name,
        sys.anatomicalScope,
        sys.physiologySummary,
        sys.clinicalPearl,
        ...sys.keyReceptorsAndTargets,
        ...sys.flagshipTherapies,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [searchTerm]);

  const activeSystem =
    HUMAN_BODY_SYSTEMS.find((s) => s.id === selectedId) ?? HUMAN_BODY_SYSTEMS[0];

  const systemUpdates = useMemo(() => {
    const seen = new Set<string>();
    return liveFeed.updates.filter((u) => {
      if (u.systemId !== activeSystem.id && u.systemId !== 'general') return false;
      if (!u.id || seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }, [liveFeed.updates, activeSystem.id]);

  const linkedDrugs = useMemo(
    () =>
      activeSystem.linkedDrugIds
        .map((id) => DRUG_MAP[id])
        .filter((d): d is DrugMonograph => Boolean(d)),
    [activeSystem]
  );

  const speechTag = `body-system:${activeSystem.id}`;
  const isSpeakingThis = activeSpeechTag === speechTag;

  const handleToggleSpeakSystem = () => {
    soundEngine.playUiTick();
    const script = `${activeSystem.name}. Anatomy: ${activeSystem.anatomicalScope}. Physiology: ${activeSystem.physiologySummary}. Clinical pearl: ${activeSystem.clinicalPearl}. Red-flag toxicities: ${activeSystem.redFlagToxicities}`;
    voiceEngine.toggleSpeak(script, speechTag, { rate: 0.96 });
  };

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: All 12 Human Body Systems */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              className="text-lg font-semibold text-ink"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Human Body Systems ({HUMAN_BODY_SYSTEMS.length})
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Complete organ-system anatomy, receptor targets &amp; therapeutics
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter organ system, receptor, biomarker..."
            aria-label="Filter human body systems"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-line/15 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-accent-ring"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[640px] overflow-y-auto pr-1">
          {filteredSystems.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface border border-line/12 text-xs text-ink-muted">
              No body systems matched "{searchTerm}". Try clearing the filter.
            </div>
          ) : (
            filteredSystems.map((sys, idx) => {
              const isSelected = sys.id === activeSystem.id;
              const matchingUpdateCount = liveFeed.updates.filter(
                (u) => u.systemId === sys.id
              ).length;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiTick();
                    setSelectedId(sys.id);
                  }}
                  className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-accent-bg/16 border-accent-ring/70 text-ink'
                      : 'bg-surface border-line/12 text-ink-muted hover:border-line/28 hover:bg-surface-alt hover:text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink truncate">
                      {String(idx + 1).padStart(2, '0')}. {sys.name}
                    </span>
                    {matchingUpdateCount > 0 && (
                      <span className="text-xs text-accent-text tabular-nums shrink-0">
                        {matchingUpdateCount} live
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted line-clamp-1">
                    {sys.anatomicalScope}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detailed Body System Dossier */}
      <div className="lg:col-span-7 rounded-2xl bg-dossier text-slate-900 border border-slate-200 p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Human Anatomy &amp; Clinical Therapeutics</span>
            </div>
            <h2
              className="mt-1 text-2xl font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {activeSystem.name}
            </h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {activeSystem.anatomicalScope}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {voiceEngine.isSupported() && (
              <button
                type="button"
                onClick={handleToggleSpeakSystem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isSpeakingThis ? (
                  <>
                    <Square className="w-3 h-3 fill-current text-emerald-700" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              disabled={isManualRefreshing || liveFeed.isRefreshing}
              onClick={() => {
                soundEngine.playUiTick();
                onRefreshSystem(activeSystem.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title={`Search live 24/7 updates for ${activeSystem.shortName}`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isManualRefreshing || liveFeed.isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>Update System Info</span>
            </button>
          </div>
        </div>

        {/* Physiology */}
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-slate-500">
            Physiology &amp; Pharmacodynamic Pathways
          </h3>
          <p className="mt-1.5 text-sm text-slate-800 leading-relaxed">
            {activeSystem.physiologySummary}
          </p>
        </div>

        {/* Receptors & Biomarkers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-slate-500">
              Primary Drug Targets &amp; Receptors
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-800">
              {activeSystem.keyReceptorsAndTargets.map((item) => (
                <li key={item} className="leading-snug">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-slate-500">
              Diagnostic Labs &amp; Monitoring
            </h3>
            <ul
              className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-800"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {activeSystem.diagnosticBiomarkers.map((lab) => (
                <li key={lab} className="leading-snug">
                  · {lab}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Flagship Therapies */}
        <div className="pt-2 border-t border-slate-200/80">
          <h3 className="text-xs font-semibold tracking-wide text-slate-500">
            Evidence-Based Therapies
          </h3>
          <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-800">
            {activeSystem.flagshipTherapies.map((therapy) => (
              <li key={therapy} className="leading-relaxed">
                · {therapy}
              </li>
            ))}
          </ul>
        </div>

        {/* Linked Formulary Monographs */}
        {linkedDrugs.length > 0 && (
          <div className="pt-2 border-t border-slate-200/80">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500">
              Linked Formulary Monographs ({linkedDrugs.length})
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {linkedDrugs.map((drug) => (
                <button
                  key={drug.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiTick();
                    onInspectDrug(drug);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 text-xs font-medium text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{drug.genericName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pearl & Toxicity Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-xs font-semibold text-emerald-900">
              Clinical Pearl
            </div>
            <p className="mt-1 text-xs text-emerald-950 leading-relaxed">
              {activeSystem.clinicalPearl}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
              <span>Red-Flag Toxicities</span>
            </div>
            <p className="mt-1 text-xs text-rose-950 leading-relaxed">
              {activeSystem.redFlagToxicities}
            </p>
          </div>
        </div>

        {/* Live 24/7 Clinical Updates for Selected System */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500">
              Live 24/7 Updates · {activeSystem.shortName}
            </h3>
            <span className="text-xs text-slate-500 tabular-nums">
              {formatRelativeCheckTime(liveFeed.lastSuccessAt ?? liveFeed.lastCheckedAt)}
            </span>
          </div>

          {(refreshError || liveFeed.lastError) && (
            <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
              {refreshError || liveFeed.lastError}
            </div>
          )}

          {systemUpdates.length === 0 ? (
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              No system-specific live bulletin cached yet. Click{' '}
              <strong>Update System Info</strong> to pull the latest guidelines
              and safety alerts for the {activeSystem.name}.
            </p>
          ) : (
            <div className="mt-2.5 space-y-2.5">
              {systemUpdates.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200"
                >
                  <div className="text-xs text-slate-500">
                    {item.category}
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    {formatRelativeCheckTime(item.checkedAt)}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {item.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {item.summary}
                  </p>
                  {item.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {item.sources.slice(0, 2).map((src, srcIdx) => (
                        <a
                          key={`${src.uri}-${srcIdx}`}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                        >
                          <span className="truncate max-w-[200px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
