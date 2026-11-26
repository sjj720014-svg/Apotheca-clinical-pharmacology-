import React from 'react';
import { DosageForm } from '../types/pharma';

interface Props {
  form: DosageForm;
  className?: string;
}

export const DosageFormSvg: React.FC<Props> = ({ form, className = 'w-6 h-6' }) => {
  switch (form) {
    case 'tablet':
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.75" />
          <line x1="7.5" y1="14" x2="20.5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10.5 9.5A5.5 5.5 0 0 1 17.5 9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
        </svg>
      );
    case 'capsule':
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <g transform="rotate(-35 14 14)">
            <rect x="4.5" y="9" width="19" height="10" rx="5" stroke="currentColor" strokeWidth="1.75" />
            <line x1="14" y1="9" x2="14" y2="19" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 19V9h4.5a0 0 0 0 1 0 0v10h-4.5Z" fill="currentColor" opacity="0.18" />
          </g>
        </svg>
      );
    case 'iv_vial':
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <rect x="9.5" y="3.5" width="9" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M11 6.5h6v2.2l2.2 2.4c.5.55.8 1.27.8 2.02V22a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 8 22v-8.88c0-.75.3-1.47.8-2.02L11 8.7V6.5Z"
            stroke="currentColor"
            strokeWidth="1.65"
          />
          <path d="M8.5 16.5h11V22a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-5.5Z" fill="currentColor" opacity="0.18" />
          <line x1="11.5" y1="13" x2="16.5" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case 'inhaler':
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <path
            d="M11 4.5h6v10.5l4.2 3.2c.8.6 1 1.75.4 2.55l-1.1 1.45c-.55.72-1.55.9-2.32.42L12.5 19A3 3 0 0 1 11 16.4V4.5Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <rect x="12.5" y="2.5" width="3" height="2" fill="currentColor" opacity="0.5" />
          <circle cx="23.5" cy="21.5" r="1" fill="currentColor" opacity="0.55" />
          <circle cx="25.2" cy="19" r="0.8" fill="currentColor" opacity="0.4" />
        </svg>
      );
    case 'pen':
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <g transform="rotate(-40 14 14)">
            <rect x="6" y="10.5" width="15" height="7" rx="2" stroke="currentColor" strokeWidth="1.65" />
            <line x1="21" y1="14" x2="25.5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="3" y="12" width="3" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
            <line x1="10.5" y1="10.5" x2="10.5" y2="17.5" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
          </g>
        </svg>
      );
  }
};
