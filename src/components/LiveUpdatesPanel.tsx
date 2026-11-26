import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Square,
  Volume2,
} from 'lucide-react';
import { HUMAN_BODY_SYSTEMS } from '../data/bodySystems';
import { BodySystemId, LiveUpdatesFeedState } from '../types/pharma';
import { formatRelativeCheckTime } from '../utils/liveUpdater';
import { soundEngine } from '../utils/sound';
import { voiceEngine } from '../utils/voice';

interface Props {
  liveFeed: LiveUpdatesFeedState;
  autoUpdateEnabled: boolean;
  isManualRefreshing: boolean;
  refreshError: string | null;
  onToggleAutoUpdate: () => void;
  onRefreshNow: (focusSystem?: BodySystemId | 'all') => void;
}

export const LiveUpdatesPanel: React.FC<Props> = ({
  liveFeed,
  autoUpdateEnabled,
  isManualRefreshing,
  refreshError,
  onToggleAutoUpdate,
  onRefreshNow,
}) => {
  const [systemFilter, setSystemFilter] = useState<BodySystemId | 'all'>('all');
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );

  useEffect(() => {
    const unsub = voiceEngine.subscribe(setActiveSpeechTag);
    return () => unsub();
  }, []);

  const filteredUpdates = useMemo(() => {
    const seen = new Set<string>();
    const list =
      systemFilter === 'all'
        ? liveFeed.updates
        : liveFeed.updates.filter((u) => u.systemId === systemFilter);
    return list.filter((u) => {
      if (!u.id || seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }, [liveFeed.updates, systemFilter]);

  const busy = isManualRefreshing || liveFeed.isRefreshing;
  const activeError = refreshError || liveFeed.lastError;

  const formatExactDateTime = (iso?: string | null) => {
    if (!iso) return 'Not yet checked';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Not yet checked';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="mt-6 space-y-5">
      {/* Control Banner */}
      <div className="rounded-2xl bg-surface border border-line/12 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2
            className="text-xl font-semibold text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            24/7 Live Clinical Information Updater
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-2xl">
            Automatically checks every {liveFeed.intervalHours} hours using live medical web search for FDA safety alerts, drug approvals, and guideline revisions across all 12 human body systems.
          </p>
          <div className="pt-1 text-xs text-ink-muted/90 tabular-nums flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Last checked: {formatExactDateTime(liveFeed.lastCheckedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>Next scheduled: {formatExactDateTime(liveFeed.nextScheduledCheckAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{liveFeed.updates.length} cached updates</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiTick();
              onToggleAutoUpdate();
            }}
            className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              autoUpdateEnabled
                ? 'bg-accent-bg/18 border-accent-ring/50 text-ink'
                : 'bg-wash/6 border-line/15 text-ink-muted hover:bg-wash/12 hover:text-ink'
            }`}
          >
            {autoUpdateEnabled ? '24/7 Auto-Update: On' : '24/7 Auto-Update: Off'}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              soundEngine.playUiTick();
              onRefreshNow(systemFilter);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-bg hover:bg-accent-hover disabled:opacity-60 text-on-accent text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
            <span>
              {busy
                ? 'Checking Live Sources...'
                : systemFilter === 'all'
                ? 'Refresh All Systems'
                : 'Refresh Selected System'}
            </span>
          </button>
        </div>
      </div>

      {/* System Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiTick();
            setSystemFilter('all');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            systemFilter === 'all'
              ? 'bg-accent-bg text-on-accent font-semibold'
              : 'bg-surface text-ink-muted border border-line/12 hover:text-ink hover:bg-surface-alt'
          }`}
        >
          All Systems ({liveFeed.updates.length})
        </button>
        {HUMAN_BODY_SYSTEMS.map((sys) => {
          const count = liveFeed.updates.filter((u) => u.systemId === sys.id).length;
          return (
            <button
              key={sys.id}
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSystemFilter(sys.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                systemFilter === sys.id
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'bg-surface text-ink-muted border border-line/12 hover:text-ink hover:bg-surface-alt'
              }`}
            >
              {sys.shortName}
              {count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {activeError && (
        <div className="p-4 rounded-xl bg-warn-surface border border-warn-border text-xs sm:text-sm text-warn-ink flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-warn-text mt-0.5 shrink-0" />
            <span>{activeError}</span>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onRefreshNow(systemFilter)}
            className="px-3 py-1.5 rounded-lg bg-wash/12 hover:bg-wash/20 text-warn-ink text-xs font-medium cursor-pointer whitespace-nowrap shrink-0"
          >
            Retry Now
          </button>
        </div>
      )}

      {filteredUpdates.length === 0 ? (
        <div className="rounded-2xl bg-surface border border-line/12 p-10 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            {busy
              ? 'Querying live pharmacology guidelines and FDA safety feeds...'
              : 'No live updates cached for this filter yet.'}
          </p>
          {!busy && (
            <button
              type="button"
              onClick={() => onRefreshNow(systemFilter)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-bg hover:bg-accent-hover text-on-accent text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fetch Live Updates Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUpdates.map((item) => {
            const speechTag = `live-upd:${item.id}`;
            const isSpeakingThis = activeSpeechTag === speechTag;
            return (
              <article
                key={item.id}
                className="rounded-xl bg-dossier text-slate-900 border border-slate-200 p-5 flex flex-col justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      <span>{item.category}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span>{item.systemLabel}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span>{formatRelativeCheckTime(item.checkedAt)}</span>
                    </div>
                    {voiceEngine.isSupported() && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playUiTick();
                          voiceEngine.toggleSpeak(
                            `${item.category} for ${item.systemLabel}. ${item.title}. ${item.summary}. Clinical impact: ${item.clinicalImpact}`,
                            speechTag,
                            { rate: 0.98 }
                          );
                        }}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                        aria-label={
                          isSpeakingThis ? 'Stop reading bulletin' : 'Listen to bulletin'
                        }
                        title={isSpeakingThis ? 'Stop' : 'Listen'}
                      >
                        {isSpeakingThis ? (
                          <Square className="w-3 h-3 fill-current text-emerald-700" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                      </button>
                    )}
                  </div>

                  <h3
                    className="mt-1.5 text-base font-semibold text-slate-900 leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {item.summary}
                  </p>

                  {item.clinicalImpact && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                      <span className="font-semibold">Clinical Takeaway: </span>
                      {item.clinicalImpact}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200/80">
                  {item.affectedDrugs.length > 0 && (
                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-700">Agents: </span>
                      <span>{item.affectedDrugs.join(', ')}</span>
                    </div>
                  )}
                  {item.sources.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {item.sources.slice(0, 3).map((src, srcIdx) => (
                        <a
                          key={`${src.uri}-${srcIdx}`}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                        >
                          <span className="truncate max-w-[190px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
