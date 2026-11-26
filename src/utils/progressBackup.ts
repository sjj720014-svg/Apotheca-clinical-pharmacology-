import { CLINICAL_CASES } from '../data/cases';
import { DRUG_MONOGRAPHS, SPECIALTY_META } from '../data/drugs';
import { PlayerProgress } from '../types/pharma';
import { getTodayDateKey } from './daily';
import { triggerFileDownload } from './exportStudyGuide';

export const PROGRESS_STORAGE_KEY = 'apotheca_progress_v1';
export const PROGRESS_CACHE_NAME = 'apotheca-progress-cache-v1';
export const PROGRESS_CACHE_REQUEST = '/apotheca_progress_v1.json';

export interface ClinicalPearlItem {
  id: string;
  sourceLabel: string;
  specialtyLabel: string;
  pearlText: string;
  kind: 'Clinical Case' | 'Drug Monograph';
}

export function serializeProgressSnapshot(progress: PlayerProgress): string {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return JSON.stringify(parsed, null, 2);
    }
  } catch {
    // Fall back to in-memory state if localStorage is unavailable or malformed
  }
  return JSON.stringify(progress, null, 2);
}

export async function syncProgressToBrowserCache(
  progress: PlayerProgress
): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }
  try {
    const cache = await window.caches.open(PROGRESS_CACHE_NAME);
    const json = JSON.stringify(progress, null, 2);
    const response = new Response(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Apotheca-Key': PROGRESS_STORAGE_KEY,
        'X-Synced-At': new Date().toISOString(),
      },
    });
    await cache.put(PROGRESS_CACHE_REQUEST, response);
    return true;
  } catch {
    return false;
  }
}

export function downloadProgressBackup(progress: PlayerProgress): string {
  const json = serializeProgressSnapshot(progress);
  const filename = `${PROGRESS_STORAGE_KEY}-${getTodayDateKey()}.json`;
  triggerFileDownload(json, filename, 'application/json;charset=utf-8');
  void syncProgressToBrowserCache(progress);
  return filename;
}

let cachedPearlPool: ClinicalPearlItem[] | null = null;

function getPearlPool(): ClinicalPearlItem[] {
  if (cachedPearlPool) return cachedPearlPool;

  const items: ClinicalPearlItem[] = [];
  const seenText = new Set<string>();

  for (const c of CLINICAL_CASES) {
    const text = c.clinicalPearl?.trim();
    if (!text) continue;
    const norm = text.toLowerCase();
    if (seenText.has(norm)) continue;
    seenText.add(norm);
    items.push({
      id: `case:${c.id}`,
      sourceLabel: c.title,
      specialtyLabel: SPECIALTY_META[c.specialty].shortLabel,
      pearlText: text,
      kind: 'Clinical Case',
    });
  }

  for (const d of DRUG_MONOGRAPHS) {
    const text = d.clinicalPearls?.trim();
    if (!text) continue;
    const norm = text.toLowerCase();
    if (seenText.has(norm)) continue;
    seenText.add(norm);
    items.push({
      id: `drug:${d.id}`,
      sourceLabel: `${d.genericName} (${d.drugClass})`,
      specialtyLabel: SPECIALTY_META[d.specialty].shortLabel,
      pearlText: text,
      kind: 'Drug Monograph',
    });
  }

  cachedPearlPool = items;
  return items;
}

export function pickRandomClinicalPearl(excludeText?: string): ClinicalPearlItem {
  const pool = getPearlPool();
  const candidates =
    excludeText && pool.length > 1
      ? pool.filter((item) => item.pearlText !== excludeText)
      : pool;
  const index = Math.floor(Math.random() * candidates.length);
  return (
    candidates[index] ?? {
      id: 'fallback',
      sourceLabel: 'Clinical Pharmacotherapy',
      specialtyLabel: 'Pharmacology',
      pearlText:
        'Verify renal function (CrCl/eGFR) and CYP450 substrates before finalizing narrow therapeutic index orders.',
      kind: 'Drug Monograph',
    }
  );
}
