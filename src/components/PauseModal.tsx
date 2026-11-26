import React, { useEffect } from 'react';
import { BookOpen, Home, Play, RotateCcw } from 'lucide-react';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onOpenCompendium: () => void;
  onReturnTitle: () => void;
}

export const PauseModal: React.FC<Props> = ({
  onResume,
  onRestart,
  onOpenCompendium,
  onReturnTitle,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onResume]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game Paused"
    >
      <div className="w-full max-w-sm rounded-2xl bg-dossier text-slate-900 border border-slate-200 shadow-2xl p-6">
        <h2
          className="text-2xl font-semibold text-slate-900"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Shift Paused
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Take a breather or review drug monographs before returning.
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Shift</span>
          </button>

          <button
            type="button"
            onClick={onOpenCompendium}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Formulary Compendium</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>Restart Shift</span>
          </button>

          <button
            type="button"
            onClick={onReturnTitle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-sm font-medium transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
