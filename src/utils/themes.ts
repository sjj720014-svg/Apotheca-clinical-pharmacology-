export type ApothecaThemeId =
  | 'botanical'
  | 'cardiology'
  | 'obsidian'
  | 'plum'
  | 'daylight'
  | 'parchment';

export interface ApothecaThemeDefinition {
  id: ApothecaThemeId;
  name: string;
  shortName: string;
  appearance: 'Dark' | 'Light';
  subtitle: string;
  description: string;
  swatches: {
    canvas: string;
    surface: string;
    accent: string;
    dossier: string;
  };
}

export const THEME_STORAGE_KEY = 'apotheca_theme_v1';

export const APOTHECA_THEMES: ApothecaThemeDefinition[] = [
  {
    id: 'botanical',
    name: 'Botanical Apothecary',
    shortName: 'Botanical',
    appearance: 'Dark',
    subtitle: 'Signature Forest · Emerald',
    description:
      'Deep apothecary slate-green canvas paired with calm emerald highlights and high-contrast alabaster charts.',
    swatches: {
      canvas: '#0B1B19',
      surface: '#132926',
      accent: '#10B981',
      dossier: '#F8FAFC',
    },
  },
  {
    id: 'cardiology',
    name: 'Midnight Telemetry',
    shortName: 'Telemetry',
    appearance: 'Dark',
    subtitle: 'ICU Navy · Sky Azure',
    description:
      'Crisp midnight cardiology navy inspired by clinical telemetry consoles with high-clarity azure controls.',
    swatches: {
      canvas: '#07111F',
      surface: '#0E1D34',
      accent: '#38BDF8',
      dossier: '#F8FAFC',
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian Board Prep',
    shortName: 'Obsidian',
    appearance: 'Dark',
    subtitle: 'Warm Charcoal · Amber Gold',
    description:
      'Low-glare warm obsidian surfaces accented with amber gold for focused late-night NAPLEX & OSCE sprints.',
    swatches: {
      canvas: '#111216',
      surface: '#1B1D24',
      accent: '#F59E0B',
      dossier: '#FAF9F6',
    },
  },
  {
    id: 'plum',
    name: 'Evening Formulary',
    shortName: 'Evening',
    appearance: 'Dark',
    subtitle: 'Aubergine Slate · Soft Violet',
    description:
      'Quiet nocturnal aubergine backdrop with calm violet accents tuned for long pharmacology study sessions.',
    swatches: {
      canvas: '#140E1D',
      surface: '#20172E',
      accent: '#A78BFA',
      dossier: '#F9F8FC',
    },
  },
  {
    id: 'daylight',
    name: 'Clinical Daylight',
    shortName: 'Daylight',
    appearance: 'Light',
    subtitle: 'Hospital Alabaster · Deep Emerald',
    description:
      'Bright daytime clinical reading environment with crisp white dossier cards and accessible forest-emerald controls.',
    swatches: {
      canvas: '#EDF2F0',
      surface: '#FFFFFF',
      accent: '#047857',
      dossier: '#FFFFFF',
    },
  },
  {
    id: 'parchment',
    name: 'Pharmacopeia Linen',
    shortName: 'Linen',
    appearance: 'Light',
    subtitle: 'Archival Paper · Deep Teal',
    description:
      'Warm archival paper tones inspired by classic printed pharmacopeias, reducing harsh blue-light glare in bright rooms.',
    swatches: {
      canvas: '#F3EFE6',
      surface: '#FFFDF8',
      accent: '#0F766E',
      dossier: '#FFFDF9',
    },
  },
];

const VALID_THEME_IDS = new Set<string>(APOTHECA_THEMES.map((t) => t.id));

export function isValidThemeId(value: unknown): value is ApothecaThemeId {
  return typeof value === 'string' && VALID_THEME_IDS.has(value);
}

export function getThemeDefinition(id: ApothecaThemeId): ApothecaThemeDefinition {
  return APOTHECA_THEMES.find((t) => t.id === id) ?? APOTHECA_THEMES[0];
}

export function loadSavedThemeId(): ApothecaThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidThemeId(saved)) {
      return saved;
    }
  } catch {
    // ignore storage access issues
  }
  return 'botanical';
}

export function saveThemeId(themeId: ApothecaThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore storage access issues
  }
}

export function applyThemeToDocument(themeId: ApothecaThemeId): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = themeId;
  const def = getThemeDefinition(themeId);
  document.documentElement.style.colorScheme =
    def.appearance === 'Light' ? 'light' : 'dark';
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', def.swatches.canvas);
  }
}
