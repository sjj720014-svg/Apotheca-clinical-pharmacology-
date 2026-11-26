import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Award,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  Headphones,
  Lock,
  Play,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';
import {
  BodySystemId,
  ClinicalCase,
  CustomStudyDeck,
  DeckFilter,
  DrugMonograph,
  LiveUpdatesFeedState,
  PlayerProgress,
  Specialty,
  StudyChatMessage,
  UploadedStudyDoc,
} from '../types/pharma';
import { HUMAN_BODY_SYSTEMS } from '../data/bodySystems';
import { DRUG_MAP, DRUG_MONOGRAPHS, SPECIALTY_META } from '../data/drugs';
import { CLINICAL_CASES } from '../data/cases';
import { ACHIEVEMENTS } from '../data/achievements';
import { PAIP_DILEMMA_CASES } from '../data/aiCurriculum';
import { getTodayDateKey } from '../utils/daily';
import { DIFFICULTY_DISPLAY } from '../utils/deck';
import {
  buildStudyExportContent,
  ExportFormat,
  triggerFileDownload,
} from '../utils/exportStudyGuide';
import { getDueTodaySummary } from '../utils/spacedRepetition';
import { soundEngine } from '../utils/sound';
import { voiceEngine, VoiceStatusSnapshot } from '../utils/voice';
import { ApothecaThemeId } from '../utils/themes';
import { DosageFormSvg } from './DosageFormSvg';
import { MonographSheet } from './MonographSheet';
import { AiEthicsLab } from './AiEthicsLab';
import { PdfStudyAssistant } from './PdfStudyAssistant';
import { ReviewAnalyticsPanel } from './ReviewAnalyticsPanel';
import { PrintableStudySheetModal } from './PrintableStudySheetModal';
import { StudyAudioPopover, StudyAudioProps } from './StudyAudioPopover';
import { ThemePopover } from './ThemePopover';
import { BodySystemsAtlas } from './BodySystemsAtlas';
import { LiveUpdatesPanel } from './LiveUpdatesPanel';

export type CompendiumSection =
  | 'monographs'
  | 'body_systems'
  | 'live_updates'
  | 'review_queue'
  | 'bookmarks'
  | 'achievements'
  | 'ai_lab'
  | 'study_helper';

interface Props {
  progress: PlayerProgress;
  muted: boolean;
  audioProps: StudyAudioProps;
  themeId: ApothecaThemeId;
  onSelectTheme: (themeId: ApothecaThemeId) => void;
  initialSection?: CompendiumSection;
  aiAssistantAvailable: boolean | null;
  studyDocs: UploadedStudyDoc[];
  activeStudyDocId: string | null;
  studyChatsByDocId: Record<string, StudyChatMessage[]>;
  customDecks: CustomStudyDeck[];
  customDrugMap: Record<string, DrugMonograph>;
  customCaseMap: Record<string, ClinicalCase>;
  onSelectStudyDoc: (docId: string | null) => void;
  onAddStudyDoc: (doc: UploadedStudyDoc) => void;
  onRemoveStudyDoc: (docId: string) => void;
  onAppendStudyChatMessages: (docId: string, messages: StudyChatMessage[]) => void;
  onCustomDeckGenerated: (deck: CustomStudyDeck) => void;
  onPlayCustomDeck: (deck: CustomStudyDeck) => void;
  onStartDueReview: (specialtyFilter?: Specialty) => void;
  onOpenSafetySim: () => void;
  onOpenAudioFlashcards: () => void;
  onSolveDilemma: (dilemmaId: string) => void;
  onToggleBookmarkCase: (caseId: string) => void;
  onPracticeBookmarks?: () => void;
  onBackupProgress: () => string;
  liveFeed: LiveUpdatesFeedState;
  autoUpdateEnabled: boolean;
  isLiveRefreshing: boolean;
  liveRefreshError: string | null;
  onToggleAutoUpdate: () => void;
  onRefreshLiveUpdates: (focusSystem?: BodySystemId | 'all') => void;
  onBack: () => void;
}

const FILTER_TABS: { id: DeckFilter; label: string }[] = [
  { id: 'all', label: 'All Drugs' },
  { id: 'cardiorenal', label: 'Cardiorenal' },
  { id: 'infectious', label: 'Infectious Disease' },
  { id: 'cns', label: 'CNS & Psych' },
  { id: 'endocrine_gi', label: 'Endocrine & GI' },
  { id: 'respiratory', label: 'Respiratory' },
  { id: 'hematology_immune', label: 'Heme & Immune' },
  { id: 'musculoskeletal_derm', label: 'MSK & Derm' },
  { id: 'reproductive_sensory', label: 'Repro & Sensory' },
  { id: 'ai_informatics', label: 'AI & Ethics' },
];

export const CompendiumModal: React.FC<Props> = ({
  progress,
  muted,
  audioProps,
  themeId,
  onSelectTheme,
  initialSection = 'monographs',
  aiAssistantAvailable,
  studyDocs,
  activeStudyDocId,
  studyChatsByDocId,
  customDecks,
  customDrugMap,
  customCaseMap,
  onSelectStudyDoc,
  onAddStudyDoc,
  onRemoveStudyDoc,
  onAppendStudyChatMessages,
  onCustomDeckGenerated,
  onPlayCustomDeck,
  onStartDueReview,
  onOpenSafetySim,
  onOpenAudioFlashcards,
  onSolveDilemma,
  onToggleBookmarkCase,
  onPracticeBookmarks,
  onBackupProgress,
  liveFeed,
  autoUpdateEnabled,
  isLiveRefreshing,
  liveRefreshError,
  onToggleAutoUpdate,
  onRefreshLiveUpdates,
  onBack,
}) => {
  const [section, setSection] = useState<CompendiumSection>(initialSection);
  const [filter, setFilter] = useState<DeckFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<DrugMonograph | null>(null);
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [revealedBookmarkIds, setRevealedBookmarkIds] = useState<string[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [backupSaved, setBackupSaved] = useState(false);
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(() =>
    voiceEngine.getActiveTag()
  );
  const [voiceSnap, setVoiceSnap] = useState<VoiceStatusSnapshot>(() =>
    voiceEngine.getSnapshot()
  );

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const unsub = voiceEngine.subscribe((tag, snap) => {
      setActiveSpeechTag(tag);
      setVoiceSnap(snap);
    });
    return () => {
      unsub();
      voiceEngine.stop();
    };
  }, []);

  const dueSummary = useMemo(
    () => getDueTodaySummary(progress, CLINICAL_CASES, DRUG_MONOGRAPHS),
    [progress]
  );
  const masteredDrugIds = progress.masteredDrugIds;
  const bookmarkedCaseIds = progress.bookmarkedCaseIds ?? [];
  const unlockedSet = useMemo(
    () => new Set(progress.unlockedAchievements),
    [progress.unlockedAchievements]
  );

  const bookmarkedCases = useMemo(() => {
    const idSet = new Set(bookmarkedCaseIds);
    return CLINICAL_CASES.filter((c) => idSet.has(c.id));
  }, [bookmarkedCaseIds]);

  const filteredBookmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookmarkedCases.filter((c) => {
      if (!q) return true;
      const targetDrug = DRUG_MAP[c.correctDrugId];
      return (
        c.title.toLowerCase().includes(q) ||
        c.presentation.toLowerCase().includes(q) ||
        c.targetCue.toLowerCase().includes(q) ||
        c.clinicalPearl.toLowerCase().includes(q) ||
        (targetDrug?.genericName.toLowerCase().includes(q) ?? false)
      );
    });
  }, [bookmarkedCases, query]);

  const filteredDrugs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DRUG_MONOGRAPHS.filter((d) => {
      if (filter !== 'all' && d.specialty !== filter) return false;
      if (!q) return true;
      return (
        d.genericName.toLowerCase().includes(q) ||
        d.brandNames.toLowerCase().includes(q) ||
        d.drugClass.toLowerCase().includes(q) ||
        d.chemicalClass.toLowerCase().includes(q) ||
        d.molecularTarget.toLowerCase().includes(q) ||
        d.pharmacokinetics.metabolism.toLowerCase().includes(q) ||
        d.clinicalPearls.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const toggleRevealBookmark = (caseId: string) => {
    soundEngine.playUiTick();
    setRevealedBookmarkIds((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]
    );
  };

  const handleExportStudyGuide = (format: ExportFormat) => {
    soundEngine.playUiTick();
    const content = buildStudyExportContent({
      progress,
      customDecks,
      customDrugMap,
      customCaseMap,
      format,
    });
    const dateStamp = getTodayDateKey();
    const ext =
      format === 'markdown' ? 'md' : format === 'csv_anki' ? 'csv' : 'txt';
    const mime =
      format === 'markdown'
        ? 'text/markdown'
        : format === 'csv_anki'
        ? 'text/csv'
        : 'text/plain';
    const filename =
      format === 'csv_anki'
        ? `apotheca-anki-cards-${dateStamp}.csv`
        : `apotheca-study-guide-${dateStamp}.${ext}`;
    triggerFileDownload(content, filename, mime);
    setExportNotice(`Exported ${filename}`);
    window.setTimeout(() => setExportNotice(null), 3000);
  };

  const hasExportableData =
    bookmarkedCases.length > 0 ||
    (progress.solvedOutcomes?.length ?? 0) > 0 ||
    masteredDrugIds.length > 0 ||
    customDecks.length > 0;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <div className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/12">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-wash/8 hover:bg-wash/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-semibold text-ink"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Formulary Compendium
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5 tabular-nums">
                <span>
                  {masteredDrugIds.length} of {DRUG_MONOGRAPHS.length} monographs mastered
                </span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>
                  {bookmarkedCases.length} bookmarked {bookmarkedCases.length === 1 ? 'case' : 'cases'}
                </span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>
                  {unlockedSet.size} of {ACHIEVEMENTS.length} achievements unlocked
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                onOpenSafetySim();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-wash/8 hover:bg-wash/14 border border-line/12 text-xs font-medium text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent-text" />
              <span>Safety Check Lab</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                onOpenAudioFlashcards();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-wash/8 hover:bg-wash/14 border border-line/12 text-xs font-medium text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              <Headphones className="w-3.5 h-3.5 text-accent-text" />
              <span>Audio Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onBackupProgress();
                setBackupSaved(true);
                window.setTimeout(() => setBackupSaved(false), 2600);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                backupSaved
                  ? 'bg-accent-bg/18 border-accent-ring/45 text-ink'
                  : 'bg-wash/8 hover:bg-wash/14 border-line/12 text-ink'
              }`}
              title="Download apotheca_progress_v1 state as a JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-accent-text" />
              <span>{backupSaved ? 'Backup Saved' : 'Backup Progress'}</span>
            </button>
            <ThemePopover themeId={themeId} onSelectTheme={onSelectTheme} compact />
            <StudyAudioPopover {...audioProps} compact />
            {(section === 'monographs' || section === 'bookmarks') && (
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-ink-muted/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    section === 'bookmarks'
                      ? 'Search saved cases...'
                      : 'Search generic, brand, target...'
                  }
                  aria-label={
                    section === 'bookmarks'
                      ? 'Search bookmarked clinical cases'
                      : 'Search formulary monographs'
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-line/15 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-accent-ring"
                />
              </div>
            )}
          </div>
        </div>

        {voiceSnap.lastError && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-warn-surface border border-warn-border text-xs text-warn-ink flex flex-wrap items-center justify-between gap-2">
            <span>{voiceSnap.lastError}</span>
            <div className="flex items-center gap-3 shrink-0">
              {voiceEngine.isBrowserSpeechSupported() &&
                voiceSnap.provider === 'gemini' && (
                  <button
                    type="button"
                    onClick={() => {
                      audioProps.onChangeVoiceProvider('browser');
                      voiceEngine.clearError();
                    }}
                    className="text-warn-ink hover:opacity-80 underline underline-offset-2 cursor-pointer font-medium"
                  >
                    Use Browser Speech
                  </button>
                )}
              <button
                type="button"
                onClick={() => voiceEngine.clearError()}
                className="text-warn-ink/80 hover:text-warn-ink cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Section Switcher + Specialty Filter Row */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface rounded-xl border border-line/12">
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('monographs');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'monographs'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              Formulary ({DRUG_MONOGRAPHS.length})
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('review_queue');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'review_queue'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Due Today &amp; Analytics ({dueSummary.totalDueCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('bookmarks');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'bookmarks'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarkedCases.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('achievements');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'achievements'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>
                Achievements ({unlockedSet.size}/{ACHIEVEMENTS.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('ai_lab');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'ai_lab'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>
                AI &amp; Ethics Lab ({(progress.solvedDilemmaIds ?? []).length}/{PAIP_DILEMMA_CASES.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('study_helper');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'study_helper'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                AI Study Helper{studyDocs.length > 0 ? ` (${studyDocs.length})` : ''}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('body_systems');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'body_systems'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Body Systems ({HUMAN_BODY_SYSTEMS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiTick();
                setSection('live_updates');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'live_updates'
                  ? 'bg-accent-bg text-on-accent font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-wash/6'
              }`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isLiveRefreshing || liveFeed.isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>
                Live 24/7 Updates
                {liveFeed.updates.length > 0 ? ` (${liveFeed.updates.length})` : ''}
              </span>
            </button>
          </div>

          {section === 'monographs' && (
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface rounded-xl border border-line/10">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiTick();
                    setFilter(tab.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filter === tab.id
                      ? 'bg-wash/15 text-ink font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-wash/6'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {section === 'bookmarks' && (
            <div className="flex flex-wrap items-center gap-2">
              {exportNotice && (
                <span className="text-xs text-accent-text font-medium">
                  {exportNotice}
                </span>
              )}
              <button
                type="button"
                disabled={!hasExportableData}
                onClick={() => handleExportStudyGuide('markdown')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-wash/8 hover:bg-wash/14 disabled:opacity-40 border border-line/14 text-xs font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
                title="Download bookmarked cases and solved outcomes as Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5 text-accent-text" />
                <span>Export .md</span>
              </button>
              <button
                type="button"
                disabled={!hasExportableData}
                onClick={() => handleExportStudyGuide('csv_anki')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-wash/8 hover:bg-wash/14 disabled:opacity-40 border border-line/14 text-xs font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
                title="Download Anki-ready flashcards (.csv)"
              >
                <Download className="w-3.5 h-3.5 text-accent-text" />
                <span>Anki .csv</span>
              </button>
              <button
                type="button"
                disabled={!hasExportableData}
                onClick={() => handleExportStudyGuide('text')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-wash/8 hover:bg-wash/14 disabled:opacity-40 border border-line/14 text-xs font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
                title="Download bookmarked cases and solved outcomes as Plain Text (.txt)"
              >
                <Download className="w-3.5 h-3.5 text-accent-text" />
                <span>Export .txt</span>
              </button>
              <button
                type="button"
                disabled={!hasExportableData}
                onClick={() => {
                  soundEngine.playUiTick();
                  setShowPrintSheet(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-wash/8 hover:bg-wash/14 disabled:opacity-40 border border-line/14 text-xs font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
                title="Open Printable / Save PDF Study Sheet"
              >
                <Printer className="w-3.5 h-3.5 text-accent-text" />
                <span>Print / PDF</span>
              </button>
              {bookmarkedCases.length > 0 && onPracticeBookmarks && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiTick();
                    onPracticeBookmarks();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-bg hover:bg-accent-hover text-on-accent text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Review Bookmarked Cases ({bookmarkedCases.length})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Monographs Section */}
        {section === 'monographs' ? (
          filteredDrugs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <p className="text-base font-medium text-ink-muted">
                No monographs match "{query}"
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
                className="mt-3 text-sm text-accent-text hover:opacity-80 underline underline-offset-4 cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrugs.map((drug) => {
                const mastered = masteredDrugIds.includes(drug.id);
                const isPronouncing = activeSpeechTag === `drug:${drug.id}`;
                return (
                  <div
                    key={drug.id}
                    className="rounded-xl bg-dossier text-slate-900 hover:bg-white transition-transform duration-150 hover:-translate-y-0.5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDrug(drug)}
                      className="text-left p-5 pb-3 flex-1 flex flex-col justify-between gap-2 cursor-pointer rounded-t-xl focus-visible:outline-2 focus-visible:outline-emerald-400"
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                          <span className="truncate">
                            {SPECIALTY_META[drug.specialty].shortLabel} · {drug.drugClass}
                          </span>
                          {mastered && (
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-600 shrink-0"
                              aria-label="Mastered"
                            />
                          )}
                        </div>
                        <div className="mt-2.5 flex items-center gap-2.5">
                          <span className="text-emerald-800 shrink-0">
                            <DosageFormSvg form={drug.dosageForm} className="w-5 h-5" />
                          </span>
                          <h2
                            className="text-lg font-semibold text-slate-900 truncate"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {drug.genericName}
                          </h2>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {drug.molecularTarget}
                        </p>
                      </div>
                    </button>

                    <div
                      className="px-5 pb-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2 text-[11px] text-slate-500 tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <span className="truncate">
                        t½ {drug.pharmacokinetics.halfLife.split('(')[0].trim()}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {voiceEngine.isSupported() && (
                          <button
                            type="button"
                            onClick={() => voiceEngine.pronounceDrug(drug)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isPronouncing
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500 hover:text-emerald-800 hover:bg-slate-200/70'
                            }`}
                            aria-label={`Pronounce ${drug.genericName}`}
                            title={`Pronounce ${drug.genericName}`}
                          >
                            {isPronouncing ? (
                              <Square className="w-3 h-3 fill-current" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedDrug(drug)}
                          className="text-emerald-800 hover:text-emerald-700 font-medium cursor-pointer whitespace-nowrap"
                        >
                          Read monograph →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : section === 'bookmarks' ? (
          bookmarkedCases.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-line/12 flex items-center justify-center text-warn-text">
                <Bookmark className="w-6 h-6" />
              </div>
              <h2
                className="mt-4 text-xl font-semibold text-ink"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                No Bookmarked Cases Yet
              </h2>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                During any Clinical Shift, Daily Challenge, or Study Zen round, select{' '}
                <span className="text-ink font-medium">Bookmark</span> (or press{' '}
                <span className="text-ink font-mono">B</span>) to save tricky cases here for focused review.
              </p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <p className="text-base font-medium text-ink-muted">
                No bookmarked cases match "{query}"
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-3 text-sm text-accent-text hover:opacity-80 underline underline-offset-4 cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredBookmarks.map((clinicalCase) => {
                const targetDrug = DRUG_MAP[clinicalCase.correctDrugId];
                const isRevealed = revealedBookmarkIds.includes(clinicalCase.id);
                const isSpeaking = activeSpeechTag === `case:${clinicalCase.id}`;

                return (
                  <article
                    key={clinicalCase.id}
                    className="rounded-2xl bg-dossier text-slate-900 border border-slate-200/80 p-5 sm:p-6 shadow-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="font-semibold text-slate-700">
                            {SPECIALTY_META[clinicalCase.specialty].shortLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{DIFFICULTY_DISPLAY[clinicalCase.difficulty]}</span>
                          <span aria-hidden="true">·</span>
                          <span>{clinicalCase.patientLine}</span>
                        </div>
                        <h2
                          className="mt-1.5 text-lg sm:text-xl font-semibold text-slate-900"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {clinicalCase.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {voiceEngine.isSupported() && (
                          <button
                            type="button"
                            disabled={muted}
                            onClick={() => voiceEngine.speakCase(clinicalCase, true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-45 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                          >
                            {isSpeaking ? (
                              <>
                                <Square className="w-3 h-3 fill-current text-emerald-700" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleBookmarkCase(clinicalCase.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-medium text-slate-600 hover:text-rose-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          title="Remove from bookmarks"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-2.5 text-sm text-slate-700 leading-relaxed">
                      {clinicalCase.presentation}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {clinicalCase.labs.map((lab) => (
                          <span
                            key={lab.label}
                            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 tabular-nums"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            <span className="text-slate-500">{lab.label}: </span>
                            <span
                              className={
                                lab.flag === 'high'
                                  ? 'font-semibold text-rose-700'
                                  : lab.flag === 'low'
                                  ? 'font-semibold text-amber-700'
                                  : 'font-semibold text-slate-900'
                              }
                            >
                              {lab.value}
                            </span>
                          </span>
                        ))}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-700">Regimen: </span>
                        <span>{clinicalCase.activeMeds.join(' · ')}</span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-dossier-inset border border-emerald-700/20 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm font-medium text-slate-900">
                        <span
                          className="block text-[11px] font-semibold text-emerald-800 mb-0.5"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {clinicalCase.targetCue}
                        </span>
                        {clinicalCase.promptQuestion}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleRevealBookmark(clinicalCase.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide Answer</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal Answer &amp; Pearl</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isRevealed && targetDrug && (
                      <div className="mt-3 p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-emerald-950">
                            Optimal Agent: {targetDrug.genericName} ({targetDrug.drugClass})
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedDrug(targetDrug)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-emerald-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Inspect {targetDrug.genericName}</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          <span className="font-semibold text-slate-900">Clinical Pearl: </span>
                          {clinicalCase.clinicalPearl}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )
        ) : section === 'review_queue' ? (
          <ReviewAnalyticsPanel
            progress={progress}
            onStartDueReview={onStartDueReview}
            onDrillWeakestTrack={(spec) => onStartDueReview(spec)}
          />
        ) : section === 'ai_lab' ? (
          <AiEthicsLab
            solvedDilemmaIds={progress.solvedDilemmaIds ?? []}
            muted={muted}
            onSolveDilemma={onSolveDilemma}
          />
        ) : section === 'body_systems' ? (
          <BodySystemsAtlas
            liveFeed={liveFeed}
            isManualRefreshing={isLiveRefreshing}
            refreshError={liveRefreshError}
            onRefreshSystem={(systemId) => onRefreshLiveUpdates(systemId)}
            onInspectDrug={(drug) => setSelectedDrug(drug)}
          />
        ) : section === 'live_updates' ? (
          <LiveUpdatesPanel
            liveFeed={liveFeed}
            autoUpdateEnabled={autoUpdateEnabled}
            isManualRefreshing={isLiveRefreshing}
            refreshError={liveRefreshError}
            onToggleAutoUpdate={onToggleAutoUpdate}
            onRefreshNow={onRefreshLiveUpdates}
          />
        ) : section === 'study_helper' ? (
          <PdfStudyAssistant
            muted={muted}
            aiAssistantAvailable={aiAssistantAvailable}
            docs={studyDocs}
            activeDocId={activeStudyDocId}
            chatsByDocId={studyChatsByDocId}
            customDecks={customDecks}
            onSelectDoc={onSelectStudyDoc}
            onAddDoc={onAddStudyDoc}
            onRemoveDoc={onRemoveStudyDoc}
            onAppendChatMessages={onAppendStudyChatMessages}
            onCustomDeckGenerated={onCustomDeckGenerated}
            onPlayCustomDeck={onPlayCustomDeck}
          />
        ) : (
          /* Achievements Section */
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-surface border border-line/12">
                <div className="text-xs text-ink-muted">Milestones Unlocked</div>
                <div
                  className="mt-1 text-xl font-semibold text-ink tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {unlockedSet.size} / {ACHIEVEMENTS.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-line/12">
                <div className="text-xs text-ink-muted">Peak Streak</div>
                <div
                  className="mt-1 text-xl font-semibold text-accent-text tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {progress.bestStreak}×
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-line/12">
                <div className="text-xs text-ink-muted">Perfect Shifts</div>
                <div
                  className="mt-1 text-xl font-semibold text-ink tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {progress.perfectShiftsCompleted}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-line/12">
                <div className="text-xs text-ink-muted">Cases Solved</div>
                <div
                  className="mt-1 text-xl font-semibold text-ink tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {progress.totalCasesSolved}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                const { current, target } = achievement.getProgress(progress);
                const isUnlocked =
                  unlockedSet.has(achievement.id) || current >= target;
                const pct = Math.min(100, Math.round((current / target) * 100));

                return (
                  <div
                    key={achievement.id}
                    className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                      isUnlocked
                        ? 'bg-dossier text-slate-900 border-emerald-300 shadow-sm'
                        : 'bg-surface/90 text-ink border-line/12'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span
                          className={
                            isUnlocked ? 'text-slate-500' : 'text-ink-muted'
                          }
                        >
                          {achievement.category}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold ${
                            isUnlocked ? 'text-emerald-700' : 'text-ink-muted/85'
                          }`}
                        >
                          {isUnlocked ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Unlocked</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>In Progress</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Award
                          className={`w-5 h-5 shrink-0 ${
                            isUnlocked ? 'text-emerald-700' : 'text-accent-text/60'
                          }`}
                        />
                        <h2
                          className={`text-lg font-semibold ${
                            isUnlocked ? 'text-slate-900' : 'text-ink'
                          }`}
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {achievement.title}
                        </h2>
                      </div>

                      <p
                        className={`mt-1.5 text-sm leading-relaxed ${
                          isUnlocked ? 'text-slate-600' : 'text-ink-muted'
                        }`}
                      >
                        {achievement.description}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div
                        className={`flex items-center justify-between text-xs tabular-nums ${
                          isUnlocked ? 'text-slate-600' : 'text-ink-muted'
                        }`}
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        <span>Progress</span>
                        <span>
                          {current} / {target}
                        </span>
                      </div>
                      <div
                        className={`h-1.5 rounded-full overflow-hidden ${
                          isUnlocked ? 'bg-emerald-100' : 'bg-wash/12'
                        }`}
                      >
                        <div
                          className={`h-full transition-all duration-200 ${
                            isUnlocked ? 'bg-emerald-600' : 'bg-accent-bg/75'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedDrug && (
        <MonographSheet
          drug={selectedDrug}
          isMastered={masteredDrugIds.includes(selectedDrug.id)}
          onClose={() => setSelectedDrug(null)}
        />
      )}

      {showPrintSheet && (
        <PrintableStudySheetModal
          progress={progress}
          customDecks={customDecks}
          customDrugMap={customDrugMap}
          customCaseMap={customCaseMap}
          onClose={() => setShowPrintSheet(false)}
        />
      )}
    </div>
  );
};
