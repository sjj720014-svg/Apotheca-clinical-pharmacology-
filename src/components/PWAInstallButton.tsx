import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  Copy,
  ExternalLink,
  Laptop,
  Share,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../utils/sound';

interface Props {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<Props> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, swReady, install } =
    usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (!showGuide) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowGuide(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [showGuide]);

  // Hide install trigger when already running inside an installed standalone window
  if (isInstalled) {
    return null;
  }

  const handleTriggerClick = async () => {
    soundEngine.playUiTick();
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'unavailable') {
        setShowGuide(true);
      }
      return;
    }
    setShowGuide(true);
  };

  const appUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyUrl = async () => {
    if (!appUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      // Ignore clipboard permission denials
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`inline-flex items-center gap-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          isInstallable
            ? 'bg-accent-bg hover:bg-accent-hover text-on-accent shadow-xs'
            : 'bg-wash/6 hover:bg-wash/12 text-ink-muted hover:text-ink border border-line/14'
        } ${compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'}`}
        title={
          isInstallable
            ? 'Install Apotheca onto your device for offline use'
            : 'Download / install Apotheca as a standalone desktop or mobile app'
        }
      >
        <Smartphone className="w-3.5 h-3.5 shrink-0" />
        <span>{isInstallable ? 'Install App' : compact ? 'Install' : 'Install App'}</span>
      </button>

      {showGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
            onClick={() => setShowGuide(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-dossier text-slate-900 border border-slate-200 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-dossier-inset flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="pwa-install-title"
                    className="text-xl font-bold text-slate-900 tracking-tight"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Install Apotheca App
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Save Apotheca to your desktop or home screen for instant launch and offline study.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer shrink-0"
                  aria-label="Close install instructions"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-slate-700">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>
                      {swReady
                        ? 'Offline formulary & cases cached'
                        : 'Offline app shell ready'}
                    </span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Runs standalone without browser bars</span>
                </div>

                {isInIframe && appUrl && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-3">
                    <p className="leading-relaxed">
                      <strong>Embedded Preview Detected:</strong> Browsers only show the one-click{' '}
                      <strong>Install</strong> prompt when the app is opened in its own top-level
                      tab. Open Apotheca directly in your browser to install it onto your computer or
                      phone:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors whitespace-nowrap shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open App in New Tab</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {copiedUrl ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedUrl ? 'Link Copied' : 'Copy App Link'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {isIOS ? (
                  <div className="p-4 rounded-xl bg-dossier-inset border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Share className="w-4 h-4 text-emerald-700" />
                      <span>Install on iPhone or iPad (Safari)</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                      <li>
                        Tap the <strong>Share</strong> icon in Safari&apos;s bottom or top toolbar.
                      </li>
                      <li>
                        Scroll down and tap <strong>Add to Home Screen</strong>.
                      </li>
                      <li>
                        Tap <strong>Add</strong> in the top-right corner to launch Apotheca full-screen.
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-dossier-inset border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                        <Laptop className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Desktop (Chrome, Edge, Safari)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                        <li>
                          <strong>Chrome / Edge:</strong> Click the <strong>Install Apotheca</strong>{' '}
                          icon in the address bar or menu → <em>Install page as app</em>.
                        </li>
                        <li>
                          <strong>Mac Safari:</strong> Choose <strong>File → Add to Dock…</strong>{' '}
                          from the menu bar.
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-dossier-inset border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                        <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Mobile (Android &amp; iOS)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                        <li>
                          <strong>Android Chrome:</strong> Tap the <strong>⋮</strong> menu →{' '}
                          <em>Install app</em> or <em>Add to Home screen</em>.
                        </li>
                        <li>
                          <strong>iPhone / iPad Safari:</strong> Tap <strong>Share</strong> →{' '}
                          <em>Add to Home Screen</em>.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGuide(false)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
