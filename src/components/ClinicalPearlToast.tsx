import React, { useEffect, useState } from 'react';
import { RefreshCw, Square, Volume2, X } from 'lucide-react';
import { ClinicalPearlItem } from '../utils/progressBackup';
import { voiceEngine } from '../utils/voice';
import { soundEngine } from '../utils/sound';

export interface PearlToastData extends ClinicalPearlItem {
  toastKey: string;
}

interface Props {
  toast: PearlToastData | null;
  onDismiss: () => void;
  onCycleNext: () => void;
}

const AUTO_DISMISS_MS = 12000;

export const ClinicalPearlToast: React.FC<Props> = ({
  toast,
  onDismiss,
  onCycleNext,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );

  useEffect(() => {
    const unsub = voiceEngine.subscribe(setActiveSpeechTag);
    return () => unsub();
  }, []);

  const speechTag = toast ? `pearl-toast:${toast.toastKey}` : '';
  const isSpeakingThis = Boolean(toast) && activeSpeechTag === speechTag;

  useEffect(() => {
    if (!toast || isPaused || isSpeakingThis) return;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast, isPaused, isSpeakingThis, onDismiss]);

  if (!toast) return null;

  const handleToggleSpeak = () => {
    soundEngine.playUiTick();
    voiceEngine.toggleSpeak(
      `Clinical Pearl for ${toast.sourceLabel}. ${toast.pearlText}`,
      speechTag,
      { rate: 0.98 }
    );
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="fixed bottom-5 right-5 z-50 w-[min(92vw,26rem)] rounded-2xl bg-surface/96 backdrop-blur-md text-ink border border-accent-ring/45 shadow-2xl p-4 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-accent-text flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span>Clinical Pearl</span>
            <span aria-hidden="true">·</span>
            <span>{toast.specialtyLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{toast.kind}</span>
          </div>
          <h3
            className="mt-1 text-sm font-semibold text-ink leading-snug"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {toast.sourceLabel}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {voiceEngine.isSupported() && (
            <button
              type="button"
              onClick={handleToggleSpeak}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-wash/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label={isSpeakingThis ? 'Stop clinical pearl narration' : 'Listen to clinical pearl'}
              title={isSpeakingThis ? 'Stop Narration' : 'Listen to Pearl'}
            >
              {isSpeakingThis ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiTick();
              onCycleNext();
            }}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-wash/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Show another clinical pearl"
            title="Another Clinical Pearl"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiTick();
              if (isSpeakingThis) {
                voiceEngine.stop();
              }
              onDismiss();
            }}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-wash/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Dismiss clinical pearl notification"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs sm:text-sm text-ink/90 leading-relaxed">
        {toast.pearlText}
      </p>
    </div>
  );
};
