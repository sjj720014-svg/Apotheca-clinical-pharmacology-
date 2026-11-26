import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Loader2,
  Music,
  Pause,
  Play,
  Shuffle,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CustomStudyDeck,
  DeckFilter,
  PlayerProgress,
  UploadedStudyDoc,
} from '../types/pharma';
import { CLINICAL_CASES } from '../data/cases';
import { DRUG_MAP, DRUG_MONOGRAPHS, SPECIALTY_META } from '../data/drugs';
import { ApothecaThemeId } from '../utils/themes';
import { soundEngine } from '../utils/sound';
import { voiceEngine, VoiceStatusSnapshot } from '../utils/voice';
import { StudyAudioPopover, StudyAudioProps } from './StudyAudioPopover';
import { ThemePopover } from './ThemePopover';

interface AudioCardItem {
  id: string;
  tag: string;
  kicker: string;
  title: string;
  subtitle: string;
  frontBody: string;
  pearlOrDetails: string;
  speechScript: string;
  isAiGenerated?: boolean;
}

type PlaylistSource =
  | 'unmastered'
  | 'all_drugs'
  | 'bookmarked_cases'
  | 'ai_docs';

interface Props {
  progress: PlayerProgress;
  studyDocs: UploadedStudyDoc[];
  customDecks: CustomStudyDeck[];
  muted: boolean;
  audioProps: StudyAudioProps;
  themeId: ApothecaThemeId;
  onSelectTheme: (themeId: ApothecaThemeId) => void;
  onToggleMute: () => void;
  onBack: () => void;
}

const PLAYLIST_TABS: { id: PlaylistSource; label: string }[] = [
  { id: 'unmastered', label: 'Unmastered Drugs' },
  { id: 'all_drugs', label: 'All Formulary' },
  { id: 'bookmarked_cases', label: 'Bookmarked Pearls' },
  { id: 'ai_docs', label: 'AI Docs & Cases' },
];

export const AudioFlashcardsModal: React.FC<Props> = ({
  progress,
  studyDocs,
  customDecks,
  muted,
  audioProps,
  themeId,
  onSelectTheme,
  onToggleMute,
  onBack,
}) => {
  const [source, setSource] = useState<PlaylistSource>('unmastered');
  const [specialtyFilter, setSpecialtyFilter] = useState<DeckFilter>('all');
  const [shuffledSeed, setShuffledSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [handsFreePlaying, setHandsFreePlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [voiceSnap, setVoiceSnap] = useState<VoiceStatusSnapshot>(() =>
    voiceEngine.getSnapshot()
  );

  const advanceTimerRef = useRef<number | null>(null);

  const cards = useMemo<AudioCardItem[]>(() => {
    const masteredSet = new Set(progress.masteredDrugIds);
    const items: AudioCardItem[] = [];

    if (source === 'unmastered' || source === 'all_drugs') {
      const baseDrugs = DRUG_MONOGRAPHS.filter((d) => {
        if (source === 'unmastered' && masteredSet.has(d.id)) return false;
        if (specialtyFilter !== 'all' && d.specialty !== specialtyFilter) {
          return false;
        }
        return true;
      });
      const drugPool =
        baseDrugs.length === 0 && source === 'unmastered'
          ? DRUG_MONOGRAPHS.filter(
              (d) => specialtyFilter === 'all' || d.specialty === specialtyFilter
            )
          : baseDrugs;

      for (const d of drugPool) {
        items.push({
          id: `drug-${d.id}`,
          tag: `flashcard:drug:${d.id}`,
          kicker: `${SPECIALTY_META[d.specialty].shortLabel} · ${d.drugClass}`,
          title: `${d.genericName} (${d.brandNames})`,
          subtitle: d.molecularTarget,
          frontBody: d.mechanism,
          pearlOrDetails: `Clinical Pearl: ${d.clinicalPearls} Renal & Hepatic: ${d.renalAndHepaticDosing}`,
          speechScript: `${d.genericName}, brand names ${d.brandNames}. Class: ${d.drugClass}. Target: ${d.molecularTarget}. Mechanism: ${d.mechanism} Clinical pearl: ${d.clinicalPearls}`,
        });
      }
    } else if (source === 'bookmarked_cases') {
      const savedIds = new Set(progress.bookmarkedCaseIds ?? []);
      const savedCases = CLINICAL_CASES.filter(
        (c) =>
          savedIds.has(c.id) &&
          (specialtyFilter === 'all' || c.specialty === specialtyFilter)
      );
      for (const c of savedCases) {
        const target = DRUG_MAP[c.correctDrugId];
        items.push({
          id: `case-${c.id}`,
          tag: `flashcard:case:${c.id}`,
          kicker: `${SPECIALTY_META[c.specialty].shortLabel} · Bookmarked Case`,
          title: c.title,
          subtitle: target
            ? `Optimal Agent: ${target.genericName} (${target.drugClass})`
            : c.targetCue,
          frontBody: c.presentation,
          pearlOrDetails: `Clinical Pearl: ${c.clinicalPearl}`,
          speechScript: `Case: ${c.title}. ${c.presentation}. Optimal therapy: ${
            target?.genericName ?? ''
          }. Clinical pearl: ${c.clinicalPearl}`,
        });
      }
    } else if (source === 'ai_docs') {
      for (const doc of studyDocs) {
        items.push({
          id: `doc-${doc.id}`,
          tag: `flashcard:doc:${doc.id}`,
          kicker: `Uploaded Study File · ${doc.fileFormatLabel}`,
          title: doc.displayName,
          subtitle: 'Overview & Core Takeaways',
          frontBody: doc.overview,
          pearlOrDetails: doc.topics
            .slice(0, 3)
            .map((t) => `${t.title}: ${t.summary}`)
            .join(' · '),
          speechScript: `Study document summary for ${doc.displayName}. ${doc.overview}. ${doc.topics
            .slice(0, 3)
            .map((t) => `Topic ${t.title}: ${t.summary}`)
            .join('. ')}`,
          isAiGenerated: true,
        });
      }
      for (const deck of customDecks) {
        const drugById = Object.fromEntries(deck.drugs.map((d) => [d.id, d]));
        for (const c of deck.cases) {
          const target = drugById[c.correctDrugId] ?? DRUG_MAP[c.correctDrugId];
          items.push({
            id: `ai-case-${c.id}`,
            tag: `flashcard:aicase:${c.id}`,
            kicker: `AI-Generated Case · ${deck.docName}`,
            title: c.title,
            subtitle: target
              ? `Optimal Therapy: ${target.genericName}`
              : c.targetCue,
            frontBody: c.presentation,
            pearlOrDetails: `Clinical Pearl: ${c.clinicalPearl}`,
            speechScript: `A I generated study case from ${deck.docName}. ${c.title}. ${c.presentation}. Optimal choice: ${
              target?.genericName ?? ''
            }. Clinical pearl: ${c.clinicalPearl}`,
            isAiGenerated: true,
          });
        }
      }
    }

    if (shuffledSeed > 0 && items.length > 1) {
      const copy = [...items];
      let seed = shuffledSeed;
      for (let i = copy.length - 1; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const j = seed % (i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    return items;
  }, [source, specialtyFilter, progress.masteredDrugIds, progress.bookmarkedCaseIds, studyDocs, customDecks, shuffledSeed]);

  const safeIndex = cards.length > 0 ? Math.min(index, cards.length - 1) : 0;
  const currentCard = cards[safeIndex] ?? null;

  useEffect(() => {
    if (cards.length === 0) {
      if (index !== 0) setIndex(0);
    } else if (index >= cards.length) {
      setIndex(cards.length - 1);
    }
  }, [cards.length, index]);

  const clearPendingAdvance = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const speakCurrentCard = useCallback(
    (card: AudioCardItem | null) => {
      if (!card || muted) return;
      voiceEngine.speak(card.speechScript, card.tag, {
        style:
          'Calm, gentle, unhurried clinical pharmacology audio flashcard narrator for hands-free study',
      });
    },
    [muted]
  );

  useEffect(() => {
    const unsubState = voiceEngine.subscribe((_tag, snap) => {
      setVoiceSnap(snap);
      if (snap.lastError && !snap.loadingTag && !snap.activeTag) {
        setHandsFreePlaying(false);
      }
    });
    return () => {
      clearPendingAdvance();
      unsubState();
      voiceEngine.stop();
    };
  }, [clearPendingAdvance]);

  useEffect(() => {
    if (!handsFreePlaying || !autoAdvance || cards.length === 0) return;

    const unsubEnded = voiceEngine.subscribeEnded((endedTag) => {
      if (!currentCard || endedTag !== currentCard.tag) return;
      clearPendingAdvance();
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;
        if (cards.length <= 1) {
          setHandsFreePlaying(false);
          return;
        }
        const nextIdx = (safeIndex + 1) % cards.length;
        setIndex(nextIdx);
        speakCurrentCard(cards[nextIdx] ?? null);
      }, 1600);
    });

    return () => {
      unsubEnded();
      clearPendingAdvance();
    };
  }, [
    handsFreePlaying,
    autoAdvance,
    cards,
    safeIndex,
    currentCard,
    clearPendingAdvance,
    speakCurrentCard,
  ]);

  const handleTogglePlay = () => {
    if (!currentCard) return;
    clearPendingAdvance();

    if (handsFreePlaying) {
      setHandsFreePlaying(false);
      voiceEngine.stop();
      return;
    }

    if (muted) {
      onToggleMute();
    }
    setHandsFreePlaying(true);
    speakCurrentCard(currentCard);
  };

  const handleStep = (delta: number) => {
    if (cards.length === 0) return;
    clearPendingAdvance();
    soundEngine.playUiTick();
    const nextIdx = (safeIndex + delta + cards.length) % cards.length;
    setIndex(nextIdx);
    if (handsFreePlaying) {
      speakCurrentCard(cards[nextIdx] ?? null);
    } else {
      voiceEngine.stop();
    }
  };

  const isLoadingAudio =
    Boolean(currentCard) && voiceSnap.loadingTag === currentCard?.tag;
  const isSpeakingCard =
    Boolean(currentCard) && voiceSnap.activeTag === currentCard?.tag;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <div className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-line/12">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                clearPendingAdvance();
                setHandsFreePlaying(false);
                voiceEngine.stop();
                soundEngine.playUiTick();
                onBack();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-wash/8 hover:bg-wash/14 text-sm font-medium text-ink transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div>
              <h1
                className="text-xl sm:text-2xl font-semibold text-ink flex items-center gap-2.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Headphones className="w-5 h-5 text-accent-text shrink-0" />
                <span>Listen &amp; Study Audio Flashcards</span>
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                Hands-free narrated monographs, bookmarked pearls, and AI lecture summaries over calm focus music
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={audioProps.onToggleMusic}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                audioProps.musicEnabled && !muted
                  ? 'bg-accent-bg/18 border-accent-ring/50 text-ink'
                  : 'bg-wash/8 border-line/12 text-ink-muted hover:bg-wash/14 hover:text-ink'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{audioProps.musicEnabled ? 'Calm Music On' : 'Calm Music Off'}</span>
            </button>
            <ThemePopover themeId={themeId} onSelectTheme={onSelectTheme} compact />
            <StudyAudioPopover {...audioProps} compact />
            <button
              type="button"
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-wash/8 hover:bg-wash/14 text-ink-muted hover:text-ink transition-colors cursor-pointer"
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Source Playlist & Specialty Filter */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface rounded-xl border border-line/12">
            {PLAYLIST_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  clearPendingAdvance();
                  setHandsFreePlaying(false);
                  voiceEngine.stop();
                  soundEngine.playUiTick();
                  setSource(tab.id);
                  setIndex(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  source === tab.id
                    ? 'bg-accent-bg text-on-accent font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-wash/6'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {source !== 'ai_docs' && (
            <select
              value={specialtyFilter}
              onChange={(e) => {
                clearPendingAdvance();
                setHandsFreePlaying(false);
                voiceEngine.stop();
                setSpecialtyFilter(e.target.value as DeckFilter);
                setIndex(0);
              }}
              aria-label="Filter audio flashcards by specialty"
              className="px-3 py-1.5 rounded-lg bg-surface border border-line/15 text-xs text-ink focus:outline-none focus:border-accent-ring"
            >
              <option value="all">All Tracks</option>
              <option value="cardiorenal">Cardiorenal</option>
              <option value="infectious">Infectious Disease</option>
              <option value="cns">CNS &amp; Psych</option>
              <option value="endocrine_gi">Endocrine &amp; GI</option>
              <option value="respiratory">Respiratory</option>
              <option value="hematology_immune">Heme &amp; Immune</option>
              <option value="musculoskeletal_derm">MSK &amp; Derm</option>
              <option value="reproductive_sensory">Repro &amp; Sensory</option>
              <option value="ai_informatics">AI &amp; Ethics</option>
            </select>
          )}
        </div>

        {/* Main Player Card */}
        <main className="mt-6 flex-1 flex flex-col justify-center">
          {!currentCard ? (
            <div className="rounded-2xl bg-surface border border-line/12 p-8 text-center space-y-2">
              <p className="text-base font-medium text-ink">
                {source === 'bookmarked_cases'
                  ? 'No bookmarked cases match this filter yet.'
                  : 'Upload a study file or generate custom cases in AI Study Helper to add items to this playlist.'}
              </p>
              <p className="text-xs text-ink-muted">
                Switch to Unmastered Drugs or All Formulary above to start hands-free narration right away.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-dossier text-slate-900 border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-semibold text-emerald-800">
                  {currentCard.kicker}
                </span>
                <span
                  className="tabular-nums font-medium"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Card {safeIndex + 1} / {cards.length}
                </span>
              </div>

              {currentCard.isAiGenerated && (
                <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    <strong>[AI-Generated Study Content]</strong> Always verify drug dosing and clinical guidelines against primary references.
                  </span>
                </div>
              )}

              <div>
                <h2
                  className="text-2xl sm:text-3xl font-semibold text-slate-950 leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {currentCard.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-emerald-800">
                  {currentCard.subtitle}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <p className="text-sm text-slate-800 leading-relaxed">
                  {currentCard.frontBody}
                </p>
                <p className="pt-3 border-t border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentCard.pearlOrDetails}
                </p>
              </div>

              {/* Player Controls */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Previous audio flashcard"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isLoadingAudio ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : handsFreePlaying || isSpeakingCard ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause Session</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Play Hands-Free</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Next audio flashcard"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                    />
                    <span>Auto-advance back-to-back</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      clearPendingAdvance();
                      soundEngine.playUiTick();
                      setShuffledSeed((s) => s + 1);
                      setIndex(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Shuffle Deck</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
