import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Check,
  Gauge,
  Headphones,
  Loader2,
  Play,
  SlidersHorizontal,
  Speech,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { GeminiVoiceName, VoiceProviderMode } from '../types/pharma';
import {
  AMBIENT_PRESET_LABELS,
  AmbientPreset,
} from '../utils/ambientMusic';
import {
  BrowserVoiceInfo,
  GEMINI_VOICE_OPTIONS,
  VoiceStatusSnapshot,
  voiceEngine,
} from '../utils/voice';
import { soundEngine } from '../utils/sound';

export interface StudyAudioProps {
  muted: boolean;
  voiceEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  musicPreset: AmbientPreset;
  voiceProvider: VoiceProviderMode;
  geminiVoice: GeminiVoiceName;
  browserVoiceURI: string | null;
  speechRate: number;
  geminiTtsAvailable: boolean | null;
  onToggleVoice: () => void;
  onToggleMusic: () => void;
  onChangeMusicVolume: (volume: number) => void;
  onChangeMusicPreset: (preset: AmbientPreset) => void;
  onChangeVoiceProvider: (provider: VoiceProviderMode) => void;
  onChangeGeminiVoice: (voice: GeminiVoiceName) => void;
  onChangeBrowserVoiceURI: (uri: string | null) => void;
  onChangeSpeechRate: (rate: number) => void;
}

interface Props extends StudyAudioProps {
  compact?: boolean;
}

const SPEED_OPTIONS: { value: number; label: string }[] = [
  { value: 0.85, label: '0.85× Slow' },
  { value: 0.98, label: '1.0× Calm' },
  { value: 1.15, label: '1.15× Brisk' },
];

export const StudyAudioPopover: React.FC<Props> = ({
  muted,
  voiceEnabled,
  musicEnabled,
  musicVolume,
  musicPreset,
  voiceProvider,
  geminiVoice,
  browserVoiceURI,
  speechRate,
  geminiTtsAvailable,
  onToggleVoice,
  onToggleMusic,
  onChangeMusicVolume,
  onChangeMusicPreset,
  onChangeVoiceProvider,
  onChangeGeminiVoice,
  onChangeBrowserVoiceURI,
  onChangeSpeechRate,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'voices' | 'music'>('voices');
  const [voiceSnap, setVoiceSnap] = useState<VoiceStatusSnapshot>(() =>
    voiceEngine.getSnapshot()
  );
  const [browserVoices, setBrowserVoices] = useState<BrowserVoiceInfo[]>(() =>
    voiceEngine.listBrowserVoices()
  );

  useEffect(() => {
    const refreshVoices = () => {
      setBrowserVoices(voiceEngine.listBrowserVoices());
    };
    refreshVoices();
    const unsub = voiceEngine.subscribe((_tag, snap) => {
      setVoiceSnap(snap);
      setBrowserVoices(voiceEngine.listBrowserVoices());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!open) return;
    setBrowserVoices(voiceEngine.listBrowserVoices());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  const activeBrowserVoiceName =
    browserVoiceURI &&
    browserVoices.find((v) => v.voiceURI === browserVoiceURI)?.name;

  const shortBrowserName = activeBrowserVoiceName
    ? activeBrowserVoiceName.split('(')[0].trim().split(' ').slice(0, 2).join(' ')
    : 'Auto';

  const triggerLabel =
    voiceProvider === 'gemini'
      ? `Voice · ${geminiVoice}`
      : `Voice · ${shortBrowserName}`;

  const isSpeakingAny = Boolean(voiceSnap.activeTag || voiceSnap.loadingTag);

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Calm Study Music Quick Toggle */}
      <button
        type="button"
        onClick={onToggleMusic}
        className={`inline-flex items-center gap-1.5 ${
          compact ? 'px-2.5 py-2' : 'px-3 py-1.5'
        } rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
          musicEnabled && !muted
            ? 'bg-accent-bg/18 border-accent-ring/45 text-ink hover:bg-accent-bg/26'
            : 'bg-wash/6 hover:bg-wash/12 text-ink-muted border-transparent'
        }`}
        aria-pressed={musicEnabled}
        title="Toggle Calm Study Music"
      >
        <Headphones className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden sm:inline' : ''}>
          {musicEnabled && !muted ? 'Focus Music On' : 'Focus Music'}
        </span>
      </button>

      {/* Studio Audio & Voice Selection Modal Opener */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playUiTick();
          setOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 ${
          compact ? 'px-2.5 py-2' : 'px-3 py-1.5'
        } rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
          open || voiceSnap.lastError
            ? 'bg-wash/14 border-accent-ring/55 text-ink'
            : 'bg-wash/6 hover:bg-wash/12 text-ink-muted border-transparent'
        }`}
        aria-expanded={open}
        aria-label="Open Voice Selection and Focus Music Studio"
        title="Choose Narrator Voice, Speed & Focus Music"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {!compact && <span>{triggerLabel}</span>}
        {voiceSnap.lastError && (
          <AlertCircle className="w-3.5 h-3.5 text-warn-text" />
        )}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Study Audio and Voice Studio"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl bg-surface border border-line/15 shadow-2xl text-ink overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line/10 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h2
                  className="text-lg font-semibold text-ink"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Study Audio &amp; Voice Studio
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Audition narrator voices, adjust study pace, and configure calm focus music
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSpeakingAny && (
                  <button
                    type="button"
                    onClick={() => voiceEngine.stop()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-danger-surface border border-danger-border text-xs font-medium text-danger-ink hover:opacity-90 cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-wash/10 cursor-pointer"
                  aria-label="Close studio"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 pb-2 border-b border-line/10 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  setActiveTab('voices');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'voices'
                    ? 'bg-accent-bg text-on-accent'
                    : 'bg-wash/6 text-ink-muted hover:bg-wash/12 hover:text-ink'
                }`}
              >
                <Speech className="w-3.5 h-3.5" />
                <span>Voices &amp; Narration</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiTick();
                  setActiveTab('music');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'music'
                    ? 'bg-accent-bg text-on-accent'
                    : 'bg-wash/6 text-ink-muted hover:bg-wash/12 hover:text-ink'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>
                  Calm Focus Music {musicEnabled && !muted ? '(On)' : ''}
                </span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {muted && (
                <div className="p-3 rounded-xl bg-warn-surface border border-warn-border text-xs text-warn-ink flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warn-text shrink-0" />
                  <span>
                    App audio is currently muted. Unmute from the top bar to audition voices or focus music.
                  </span>
                </div>
              )}

              {activeTab === 'voices' ? (
                <>
                  {/* Narration Controls Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-deep/80 border border-line/10 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-ink">
                          Auto-Read Cases
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          Narrate patient charts automatically
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleVoice}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                          voiceEnabled
                            ? 'bg-accent-bg text-on-accent'
                            : 'bg-wash/10 text-ink-muted hover:bg-wash/15'
                        }`}
                      >
                        {voiceEnabled ? 'On' : 'Manual'}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-deep/80 border border-line/10">
                      <div className="text-xs font-semibold text-ink flex items-center gap-1.5 mb-2">
                        <Gauge className="w-3.5 h-3.5 text-accent-text" />
                        <span>Speaking Pace</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {SPEED_OPTIONS.map((opt) => {
                          const active = Math.abs(speechRate - opt.value) < 0.04;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                soundEngine.playUiTick();
                                onChangeSpeechRate(opt.value);
                              }}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                                active
                                  ? 'bg-accent-bg text-on-accent font-semibold'
                                  : 'bg-wash/6 text-ink-muted hover:bg-wash/12'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Provider Toggle */}
                  <div>
                    <div className="text-xs font-semibold text-accent-text mb-2">
                      Voice Engine
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-deep rounded-xl border border-line/10">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playUiTick();
                          onChangeVoiceProvider('gemini');
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                          voiceProvider === 'gemini'
                            ? 'bg-accent-bg text-on-accent font-semibold'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        <span>Gemini AI Voices</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            geminiTtsAvailable === false
                              ? voiceProvider === 'gemini'
                                ? 'bg-black/15 text-on-accent'
                                : 'bg-warn-surface text-warn-ink'
                              : voiceProvider === 'gemini'
                              ? 'bg-black/15 text-on-accent'
                              : 'bg-accent-bg/20 text-accent-text'
                          }`}
                        >
                          {geminiTtsAvailable === false ? 'Key Needed' : 'Studio'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playUiTick();
                          onChangeVoiceProvider('browser');
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                          voiceProvider === 'browser'
                            ? 'bg-accent-bg text-on-accent font-semibold'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        <span>Browser Voices</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            voiceProvider === 'browser'
                              ? 'bg-black/15 text-on-accent'
                              : 'bg-wash/10 text-ink-muted'
                          }`}
                        >
                          {browserVoices.length} available
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Gemini Voices Full List */}
                  {voiceProvider === 'gemini' ? (
                    <div className="space-y-2.5">
                      {geminiTtsAvailable === false && (
                        <div className="p-3 rounded-xl bg-warn-surface border border-warn-border text-xs text-warn-ink flex flex-wrap items-center justify-between gap-2">
                          <span>
                            Add <strong>GEMINI_API_KEY</strong> in Settings &gt; Secrets to enable studio Gemini voices, or switch to free Browser Voices right now.
                          </span>
                          {voiceEngine.isBrowserSpeechSupported() && (
                            <button
                              type="button"
                              onClick={() => {
                                onChangeVoiceProvider('browser');
                                voiceEngine.clearError();
                              }}
                              className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-semibold text-[11px] hover:bg-amber-300 cursor-pointer shrink-0"
                            >
                              Use Browser Voices
                            </button>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        {GEMINI_VOICE_OPTIONS.map((v) => {
                          const selected = geminiVoice === v.id;
                          const previewTag = `preview:gemini:${v.id}`;
                          const isLoading = voiceSnap.loadingTag === previewTag;
                          const isPlaying = voiceSnap.activeTag === previewTag;

                          return (
                            <div
                              key={v.id}
                              onClick={() => {
                                soundEngine.playUiTick();
                                onChangeGeminiVoice(v.id);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  soundEngine.playUiTick();
                                  onChangeGeminiVoice(v.id);
                                }
                              }}
                              className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                selected
                                  ? 'bg-accent-bg/14 border-accent-ring/70 text-ink'
                                  : 'bg-deep/75 border-line/10 text-ink-muted hover:border-line/25'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-ink">
                                    {v.label}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-wash/8 text-[11px] text-accent-text font-medium">
                                    {v.tone}
                                  </span>
                                  {selected && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-text">
                                      <Check className="w-3.5 h-3.5" />
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                                  {v.character}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={muted}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChangeGeminiVoice(v.id);
                                  voiceEngine.previewGeminiVoice(v.id);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isPlaying || isLoading
                                    ? 'bg-accent-bg text-on-accent font-semibold'
                                    : 'bg-wash/10 hover:bg-wash/18 text-ink'
                                }`}
                                aria-label={`Sample ${v.label} voice`}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Loading</span>
                                  </>
                                ) : isPlaying ? (
                                  <>
                                    <Square className="w-3 h-3 fill-current" />
                                    <span>Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Sample</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Browser Voices Full List */
                    <div className="space-y-2">
                      {!voiceEngine.isBrowserSpeechSupported() ? (
                        <div className="p-4 rounded-xl bg-deep/80 border border-line/10 text-xs text-ink-muted">
                          Browser speech synthesis is not available in this browser environment.
                        </div>
                      ) : browserVoices.length === 0 ? (
                        <div className="p-4 rounded-xl bg-deep/80 border border-line/10 text-xs text-ink-muted">
                          Loading system voices... If none appear, your OS has no speech voices installed; Gemini AI Voices can still be used once an API key is configured.
                        </div>
                      ) : (
                        <>
                          {/* Auto Best Match Row */}
                          <div
                            onClick={() => {
                              soundEngine.playUiTick();
                              onChangeBrowserVoiceURI(null);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                soundEngine.playUiTick();
                                onChangeBrowserVoiceURI(null);
                              }
                            }}
                            className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                              browserVoiceURI === null
                                ? 'bg-accent-bg/14 border-accent-ring/70 text-ink'
                                : 'bg-deep/75 border-line/10 text-ink-muted hover:border-line/25'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-ink">
                                  Auto (Best Natural English Voice)
                                </span>
                                {browserVoiceURI === null && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-text">
                                    <Check className="w-3.5 h-3.5" />
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-ink-muted mt-0.5">
                                Automatically selects the highest-quality English system voice available
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={muted}
                              onClick={(e) => {
                                e.stopPropagation();
                                onChangeBrowserVoiceURI(null);
                                voiceEngine.toggleSpeak(
                                  'Hello from Apotheca. Reading clinical cases with your clearest available system voice.',
                                  'preview:browser:auto',
                                  { forceProvider: 'browser' }
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer disabled:opacity-40 ${
                                voiceSnap.activeTag === 'preview:browser:auto'
                                  ? 'bg-accent-bg text-on-accent font-semibold'
                                  : 'bg-wash/10 hover:bg-wash/18 text-ink'
                              }`}
                            >
                              {voiceSnap.activeTag === 'preview:browser:auto' ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Sample</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                            {browserVoices.map((bv) => {
                              const selected = browserVoiceURI === bv.voiceURI;
                              const previewTag = `preview:browser:${bv.voiceURI}`;
                              const isPlaying = voiceSnap.activeTag === previewTag;
                              return (
                                <div
                                  key={bv.voiceURI}
                                  onClick={() => {
                                    soundEngine.playUiTick();
                                    onChangeBrowserVoiceURI(bv.voiceURI);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      soundEngine.playUiTick();
                                      onChangeBrowserVoiceURI(bv.voiceURI);
                                    }
                                  }}
                                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                    selected
                                      ? 'bg-accent-bg/14 border-accent-ring/70 text-ink'
                                      : 'bg-deep/75 border-line/10 text-ink-muted hover:border-line/25'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs sm:text-sm font-semibold text-ink">
                                        {bv.name}
                                      </span>
                                      {selected && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-text">
                                          <Check className="w-3.5 h-3.5" />
                                          Selected
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-ink-muted mt-0.5">
                                      {bv.lang} · {bv.localService ? 'On-device' : 'Network voice'}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={muted}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onChangeBrowserVoiceURI(bv.voiceURI);
                                      voiceEngine.previewBrowserVoice(
                                        bv.voiceURI,
                                        bv.name
                                      );
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer disabled:opacity-40 ${
                                      isPlaying
                                        ? 'bg-accent-bg text-on-accent font-semibold'
                                        : 'bg-wash/10 hover:bg-wash/18 text-ink'
                                    }`}
                                  >
                                    {isPlaying ? (
                                      <>
                                        <Square className="w-3 h-3 fill-current" />
                                        <span>Stop</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>Sample</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {voiceSnap.lastError && (
                    <div className="p-3 rounded-xl bg-warn-surface border border-warn-border text-xs text-warn-ink flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-warn-text shrink-0 mt-0.5" />
                        <span>{voiceSnap.lastError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => voiceEngine.clearError()}
                        className="text-warn-text hover:underline underline-offset-2 cursor-pointer shrink-0 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Calm Focus Music Tab */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-deep/80 border border-line/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">
                        Calm Background Study Music
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        Softly ducks volume whenever a voice reads a case or explanation
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleMusic}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                        musicEnabled
                          ? 'bg-accent-bg text-on-accent'
                          : 'bg-wash/10 text-ink-muted hover:bg-wash/15'
                      }`}
                    >
                      {musicEnabled ? 'Playing' : 'Off'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(Object.keys(AMBIENT_PRESET_LABELS) as AmbientPreset[]).map(
                      (presetKey) => {
                        const info = AMBIENT_PRESET_LABELS[presetKey];
                        const active = musicPreset === presetKey;
                        return (
                          <button
                            key={presetKey}
                            type="button"
                            onClick={() => {
                              soundEngine.playUiTick();
                              onChangeMusicPreset(presetKey);
                              if (!musicEnabled && !muted) {
                                onToggleMusic();
                              }
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                              active
                                ? 'bg-accent-bg/14 border-accent-ring/70 text-ink'
                                : 'bg-deep/75 border-line/10 text-ink-muted hover:border-line/25'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-semibold">{info.label}</div>
                              <div className="text-xs text-ink-muted mt-0.5">
                                {info.description}
                              </div>
                            </div>
                            {active && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text shrink-0">
                                <Check className="w-4 h-4" />
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-deep/80 border border-line/10 flex items-center gap-3">
                    <span className="text-xs font-medium text-ink-muted w-16 shrink-0">
                      Volume
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(musicVolume * 100)}
                      onChange={(e) =>
                        onChangeMusicVolume(Number(e.target.value) / 100)
                      }
                      aria-label="Study music volume"
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <span
                      className="text-xs text-accent-text w-10 text-right tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
          document.body
        )}
    </div>
  );
};
