import React from 'react';

export const BrandLockup: React.FC = () => {
  return (
    <div className="flex items-center gap-4 select-none">
      <svg
        viewBox="0 0 52 52"
        fill="none"
        className="w-12 h-12 shrink-0 text-accent-text"
        aria-hidden="true"
      >
        <polygon
          points="26,4 45,15 45,37 26,48 7,37 7,15"
          stroke="currentColor"
          strokeWidth="1.75"
          fill="var(--theme-accent-bg)"
          fillOpacity="0.1"
        />
        <polygon
          points="26,10 39.5,17.8 39.5,34.2 26,42 12.5,34.2 12.5,17.8"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        <path
          d="M26 16v20M18 26h16"
          stroke="var(--theme-ink)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="26" cy="26" r="3" fill="var(--theme-accent-bg)" />
      </svg>
      <div>
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-none"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Apotheca
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted tracking-wide">
          Clinical Therapeutics &amp; Pharmacology
        </p>
      </div>
    </div>
  );
};
