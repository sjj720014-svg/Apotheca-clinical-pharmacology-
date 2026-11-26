import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Palette, X } from 'lucide-react';
import {
  APOTHECA_THEMES,
  ApothecaThemeId,
  getThemeDefinition,
} from '../utils/themes';
import { soundEngine } from '../utils/sound';

interface Props {
  themeId: ApothecaThemeId;
  onSelectTheme: (themeId: ApothecaThemeId) => void;
  compact?: boolean;
}

export const ThemePopover: React.FC<Props> = ({
  themeId,
  onSelectTheme,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const current = getThemeDefinition(themeId);

  useEffect(() => {
    if (!open) return;
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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          soundEngine.playUiTick();
          setOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 ${
          compact ? 'px-2.5 py-2' : 'px-3 py-1.5'
        } rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
          open
            ? 'bg-wash/14 border-accent-ring/60 text-ink'
            : 'bg-wash/6 hover:bg-wash/12 text-ink-muted border-transparent'
        }`}
        aria-expanded={open}
        aria-label={`Change visual theme (current: ${current.name})`}
        title="Choose Visual Theme"
      >
        <Palette className="w-3.5 h-3.5 text-accent-text shrink-0" />
        <span className={compact ? 'hidden md:inline' : ''}>
          {compact ? current.shortName : `Theme · ${current.shortName}`}
        </span>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Choose Visual Theme"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-surface border border-line/15 shadow-2xl text-ink overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-line/10 flex items-center justify-between gap-3 shrink-0">
                <div>
                  <h2
                    className="text-lg font-semibold text-ink"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Appearance &amp; Study Themes
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Switch between calm dark clinical palettes and high-clarity daylight paper modes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-wash/10 cursor-pointer"
                  aria-label="Close theme selector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                {APOTHECA_THEMES.map((theme) => {
                  const active = theme.id === themeId;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiTick();
                        onSelectTheme(theme.id);
                      }}
                      className={`text-left p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                        active
                          ? 'bg-accent-bg/12 border-accent-ring text-ink'
                          : 'bg-deep/75 border-line/12 text-ink hover:border-line/28 hover:bg-surface-alt'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Clean geometric palette strip */}
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className="h-7 flex-1 rounded-lg overflow-hidden border border-line/15 grid grid-cols-4"
                            aria-hidden="true"
                          >
                            <div style={{ backgroundColor: theme.swatches.canvas }} />
                            <div style={{ backgroundColor: theme.swatches.surface }} />
                            <div style={{ backgroundColor: theme.swatches.accent }} />
                            <div style={{ backgroundColor: theme.swatches.dossier }} />
                          </div>
                          {active && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text shrink-0">
                              <Check className="w-3.5 h-3.5" />
                              Active
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className="text-sm font-semibold text-ink"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {theme.name}
                            </span>
                            <span className="text-[11px] text-ink-muted shrink-0">
                              {theme.appearance}
                            </span>
                          </div>
                          <div className="text-[11px] font-medium text-accent-text mt-0.5">
                            {theme.subtitle}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-ink-muted leading-relaxed">
                        {theme.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
