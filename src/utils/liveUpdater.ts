import {
  BodySystemId,
  LiveClinicalUpdateItem,
  LiveUpdatesFeedState,
} from '../types/pharma';

const LIVE_UPDATES_STORAGE_KEY = 'apotheca_live_updates_v1';
const AUTO_UPDATE_ENABLED_KEY = 'apotheca_auto_updater_enabled_v1';
const LIVE_CACHE_NAME = 'apotheca-progress-cache-v1';
const LIVE_CACHE_REQUEST = '/apotheca_live_updates_v1.json';

export const DEFAULT_LIVE_FEED_STATE: LiveUpdatesFeedState = {
  autoUpdaterActive: true,
  isRefreshing: false,
  intervalHours: 6,
  lastCheckedAt: null,
  lastSuccessAt: null,
  nextScheduledCheckAt: null,
  lastError: null,
  focusSystem: 'all',
  updates: [],
};

export function loadAutoUpdateEnabled(): boolean {
  try {
    const raw = localStorage.getItem(AUTO_UPDATE_ENABLED_KEY);
    if (raw === null) return true; // Enabled 24/7 by default
    return raw !== 'false';
  } catch {
    return true;
  }
}

export function saveAutoUpdateEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_UPDATE_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage quota errors
  }
}

function dedupeLiveUpdateItems(
  items: unknown
): LiveClinicalUpdateItem[] {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set<string>();
  const result: LiveClinicalUpdateItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as LiveClinicalUpdateItem;
    if (!item.id || seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    result.push(item);
  }
  return result;
}

export function loadCachedLiveUpdates(): LiveUpdatesFeedState {
  try {
    const raw = localStorage.getItem(LIVE_UPDATES_STORAGE_KEY);
    if (!raw) return DEFAULT_LIVE_FEED_STATE;
    const parsed = JSON.parse(raw) as Partial<LiveUpdatesFeedState>;
    return {
      ...DEFAULT_LIVE_FEED_STATE,
      ...parsed,
      isRefreshing: false,
      updates: dedupeLiveUpdateItems(parsed.updates),
    };
  } catch {
    return DEFAULT_LIVE_FEED_STATE;
  }
}

export async function persistLiveUpdatesLocally(
  state: LiveUpdatesFeedState
): Promise<void> {
  const cleanState: LiveUpdatesFeedState = {
    ...state,
    updates: dedupeLiveUpdateItems(state.updates),
  };
  try {
    localStorage.setItem(LIVE_UPDATES_STORAGE_KEY, JSON.stringify(cleanState));
  } catch {
    // Ignore storage quota errors
  }
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await window.caches.open(LIVE_CACHE_NAME);
      await cache.put(
        LIVE_CACHE_REQUEST,
        new Response(JSON.stringify(cleanState, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Synced-At': new Date().toISOString(),
          },
        })
      );
    } catch {
      // Ignore cache API failures
    }
  }
}

export async function fetchLiveClinicalUpdates(): Promise<LiveUpdatesFeedState> {
  const res = await fetch('/api/clinical-updates', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Unable to check live clinical updates (HTTP ${res.status}).`);
  }
  const payload = (await res.json()) as Partial<LiveUpdatesFeedState>;
  return {
    ...DEFAULT_LIVE_FEED_STATE,
    ...payload,
    updates: dedupeLiveUpdateItems(payload.updates),
  };
}

export async function triggerLiveClinicalRefresh(
  focusSystem: BodySystemId | 'all' = 'all'
): Promise<LiveUpdatesFeedState> {
  const res = await fetch('/api/clinical-updates/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ focusSystem }),
  });
  const payload = (await res.json().catch(() => ({}))) as Partial<LiveUpdatesFeedState> & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(
      payload.error || `Live update refresh failed (HTTP ${res.status}).`
    );
  }
  return {
    ...DEFAULT_LIVE_FEED_STATE,
    ...payload,
    updates: dedupeLiveUpdateItems(payload.updates),
  };
}

export function formatRelativeCheckTime(iso?: string | null): string {
  if (!iso) return 'Pending initial check';
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return 'Pending initial check';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just updated';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
