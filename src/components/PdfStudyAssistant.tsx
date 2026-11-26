import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpenCheck,
  Download,
  FileText,
  FileUp,
  HelpCircle,
  Loader2,
  Play,
  Quote,
  Send,
  ShieldAlert,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  CustomStudyDeck,
  StudyChatMessage,
  StudyDocTopic,
  UploadedStudyDoc,
} from '../types/pharma';
import { getTodayDateKey } from '../utils/daily';
import {
  buildAnkiCsvExport,
  buildStudyExportContent,
  triggerFileDownload,
} from '../utils/exportStudyGuide';
import { soundEngine } from '../utils/sound';
import { VoiceStatusSnapshot, voiceEngine } from '../utils/voice';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

interface Props {
  muted: boolean;
  aiAssistantAvailable: boolean | null;
  docs: UploadedStudyDoc[];
  activeDocId: string | null;
  chatsByDocId: Record<string, StudyChatMessage[]>;
  customDecks: CustomStudyDeck[];
  onSelectDoc: (docId: string | null) => void;
  onAddDoc: (doc: UploadedStudyDoc) => void;
  onRemoveDoc: (docId: string) => void;
  onAppendChatMessages: (docId: string, messages: StudyChatMessage[]) => void;
  onCustomDeckGenerated: (deck: CustomStudyDeck) => void;
  onPlayCustomDeck: (deck: CustomStudyDeck) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (
      token.startsWith('*') &&
      token.endsWith('*') &&
      !token.startsWith('**') &&
      token.length > 2
    ) {
      return (
        <em key={idx} className="italic text-slate-900">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 text-emerald-900 text-[0.85em]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

const SafeMarkdownText: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: { ordered: boolean; text: string }[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const isOrdered = listItems[0].ordered;
    const items = listItems;
    listItems = [];
    if (isOrdered) {
      elements.push(
        <ol
          key={`list-${keyCounter++}`}
          className="list-decimal pl-5 space-y-1 text-sm text-slate-800 leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item.text)}</li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul
          key={`list-${keyCounter++}`}
          className="list-disc pl-5 space-y-1 text-sm text-slate-800 leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item.text)}</li>
          ))}
        </ul>
      );
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (listItems.length > 0 && listItems[0].ordered) flushList();
      listItems.push({ ordered: false, text: bulletMatch[1] });
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (listItems.length > 0 && !listItems[0].ordered) flushList();
      listItems.push({ ordered: true, text: orderedMatch[1] });
      continue;
    }

    flushList();

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={`h4-${keyCounter++}`}
          className="text-sm font-semibold text-emerald-950 pt-1"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={`h3-${keyCounter++}`}
          className="text-base font-semibold text-slate-950 pt-1.5"
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="text-base font-bold text-slate-950 pt-1.5"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <hr key={`hr-${keyCounter++}`} className="border-slate-200 my-2" />
      );
    } else {
      elements.push(
        <p
          key={`p-${keyCounter++}`}
          className="text-sm text-slate-800 leading-relaxed"
        >
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    }
  }
  flushList();

  return <div className="space-y-2">{elements}</div>;
};

export const PdfStudyAssistant: React.FC<Props> = ({
  muted,
  aiAssistantAvailable,
  docs,
  activeDocId,
  chatsByDocId,
  customDecks,
  onSelectDoc,
  onAddDoc,
  onRemoveDoc,
  onAppendChatMessages,
  onCustomDeckGenerated,
  onPlayCustomDeck,
}) => {
  const [dragging, setDragging] = useState(false);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadPhase, setUploadPhase] = useState<'uploading' | 'analyzing' | null>(
    null
  );
  const [uploadStageText, setUploadStageText] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [questionInput, setQuestionInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [citationMode, setCitationMode] = useState(true);
  const [generatingMode, setGeneratingMode] = useState<
    'vignettes' | 'quick_review' | null
  >(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string | null>(null);
  const [voiceSnap, setVoiceSnap] = useState<VoiceStatusSnapshot>(() =>
    voiceEngine.getSnapshot()
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeXhrRef = useRef<XMLHttpRequest | null>(null);
  const activePollAbortRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return voiceEngine.subscribe((_tag, snap) => setVoiceSnap(snap));
  }, []);

  useEffect(() => {
    return () => {
      activeXhrRef.current?.abort();
      activePollAbortRef.current?.abort();
    };
  }, []);

  const activeDoc =
    docs.find((d) => d.id === activeDocId) ?? docs[0] ?? null;
  const activeMessages = activeDoc ? chatsByDocId[activeDoc.id] ?? [] : [];
  const activeDocDecks = activeDoc
    ? customDecks.filter((d) => d.docId === activeDoc.id)
    : [];

  useEffect(() => {
    setSelectedTopicTitle(null);
    setAskError(null);
    setGenerationError(null);
  }, [activeDoc?.id]);

  useEffect(() => {
    if (activeMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeMessages.length]);

  const resetUploadUi = () => {
    setUploadingName(null);
    setUploadPhase(null);
    setUploadStageText(null);
    setUploadProgress(0);
  };

  const applyCompletedDoc = (uploadedDoc: UploadedStudyDoc) => {
    soundEngine.playHintReveal();
    onAddDoc(uploadedDoc);
    onSelectDoc(uploadedDoc.id);
    if (uploadedDoc.initialExplanation) {
      onAppendChatMessages(uploadedDoc.id, [
        {
          id: `ai-init-${uploadedDoc.id}`,
          role: 'assistant',
          text: uploadedDoc.initialExplanation,
        },
      ]);
    }
    resetUploadUi();
  };

  const pollUploadJob = async (jobId: string, fileName: string) => {
    activePollAbortRef.current?.abort();
    const pollAbort = new AbortController();
    activePollAbortRef.current = pollAbort;

    setUploadPhase('analyzing');
    setUploadProgress(35);
    setUploadStageText(`Reading ${fileName}...`);

    let transientFailures = 0;

    try {
      while (!pollAbort.signal.aborted) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 850);
          pollAbort.signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true }
          );
        });

        if (pollAbort.signal.aborted) return;

        let res: Response;
        try {
          res = await fetch(`/api/study-docs/jobs/${encodeURIComponent(jobId)}`, {
            signal: pollAbort.signal,
            cache: 'no-store',
          });
        } catch (err: unknown) {
          if ((err as { name?: string })?.name === 'AbortError') return;
          transientFailures++;
          if (transientFailures > 6) {
            resetUploadUi();
            setUploadError(
              'Lost connection while Gemini was reading your file. Please try again.'
            );
            return;
          }
          continue;
        }

        const raw = await res.text();
        let job: {
          status?: 'preparing' | 'uploading_to_ai' | 'explaining' | 'ready' | 'error';
          stageLabel?: string;
          doc?: UploadedStudyDoc;
          error?: string;
        } = {};
        try {
          job = JSON.parse(raw || '{}');
        } catch {
          transientFailures++;
          if (transientFailures > 6) {
            resetUploadUi();
            setUploadError(
              'Unexpected server response while checking file analysis status. Please retry.'
            );
            return;
          }
          continue;
        }

        if (!res.ok) {
          resetUploadUi();
          setUploadError(
            job.error || `Unable to check file analysis status (HTTP ${res.status}).`
          );
          return;
        }

        transientFailures = 0;

        if (job.stageLabel) {
          setUploadStageText(job.stageLabel);
        }

        if (job.status === 'preparing') {
          setUploadProgress(40);
        } else if (job.status === 'uploading_to_ai') {
          setUploadProgress(65);
        } else if (job.status === 'explaining') {
          setUploadProgress(85);
        } else if (job.status === 'ready' && job.doc) {
          setUploadProgress(100);
          applyCompletedDoc(job.doc);
          return;
        } else if (job.status === 'error') {
          resetUploadUi();
          setUploadError(
            job.error || 'AI Study Helper could not read this file. Please try again.'
          );
          return;
        }
      }
    } finally {
      if (activePollAbortRef.current === pollAbort) {
        activePollAbortRef.current = null;
      }
    }
  };

  const handleFileSelected = (file: File | null | undefined) => {
    if (!file) return;
    setUploadError(null);

    if (file.size === 0) {
      setUploadError('The selected file appears to be empty.');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(
        `File size (${formatFileSize(
          file.size
        )}) exceeds the 100 MB limit. Please choose a file up to 100 MB.`
      );
      return;
    }

    activeXhrRef.current?.abort();
    activePollAbortRef.current?.abort();

    soundEngine.playUiTick();
    setUploadingName(file.name);
    setUploadProgress(0);
    setUploadPhase('uploading');
    setUploadStageText('Uploading study file to workspace...');

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    activeXhrRef.current = xhr;

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && evt.total > 0) {
        const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
        setUploadProgress(pct);
      }
    };

    xhr.upload.onload = () => {
      setUploadProgress(100);
      setUploadPhase('analyzing');
      setUploadStageText(`Starting AI reading for ${file.name}...`);
    };

    xhr.onload = () => {
      activeXhrRef.current = null;

      let payload: {
        jobId?: string;
        stageLabel?: string;
        doc?: UploadedStudyDoc;
        error?: string;
      } = {};
      let parsedJson = false;
      try {
        payload = JSON.parse(xhr.responseText || '{}');
        parsedJson = true;
      } catch {
        payload = {};
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload.doc) {
        applyCompletedDoc(payload.doc);
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload.jobId) {
        if (payload.stageLabel) {
          setUploadStageText(payload.stageLabel);
        }
        void pollUploadJob(payload.jobId, file.name);
        return;
      }

      resetUploadUi();
      if (!parsedJson && xhr.responseText?.trim().startsWith('<')) {
        setUploadError(
          'The server returned an unexpected web page instead of upload confirmation. Please refresh the page and try again.'
        );
        return;
      }
      setUploadError(
        payload.error ||
          `Upload could not be completed (HTTP ${xhr.status}). Please try again.`
      );
    };

    xhr.onerror = () => {
      activeXhrRef.current = null;
      resetUploadUi();
      setUploadError('Network error while uploading your file. Please retry.');
    };

    xhr.onabort = () => {
      activeXhrRef.current = null;
      if (!activePollAbortRef.current) {
        resetUploadUi();
      }
    };

    xhr.open('POST', '/api/study-docs/upload');
    xhr.send(formData);
  };

  const handleCancelUpload = () => {
    activeXhrRef.current?.abort();
    activeXhrRef.current = null;
    activePollAbortRef.current?.abort();
    activePollAbortRef.current = null;
    resetUploadUi();
  };

  const handleDeleteDoc = async (docId: string) => {
    soundEngine.playUiTick();
    onRemoveDoc(docId);
    try {
      await fetch(`/api/study-docs/${encodeURIComponent(docId)}`, {
        method: 'DELETE',
      });
    } catch {
      // Ignore cleanup errors
    }
  };

  const submitQuestion = async (
    rawPrompt: string,
    topicTitle?: string | null,
    isQuizPrompt = false
  ) => {
    if (!activeDoc || asking) return;
    const cleanPrompt = rawPrompt.trim();
    if (!cleanPrompt) return;

    setAskError(null);
    setAsking(true);
    soundEngine.playUiTick();

    const userMsg: StudyChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      text: cleanPrompt,
      topicTitle: topicTitle || undefined,
    };

    const historySnapshot = activeMessages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    onAppendChatMessages(activeDoc.id, [userMsg]);
    setQuestionInput('');

    try {
      const res = await fetch('/api/study-docs/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: activeDoc.id,
          question: cleanPrompt,
          topicTitle: topicTitle || undefined,
          history: historySnapshot,
          citationMode,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        answer?: string;
        error?: string;
      };

      if (!res.ok || !data.answer) {
        setAskError(
          data.error || `AI Helper could not respond (HTTP ${res.status}).`
        );
        return;
      }

      const assistantMsg: StudyChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        text: data.answer,
        topicTitle: topicTitle || undefined,
        citationMode,
        isAiGeneratedQuiz:
          isQuizPrompt ||
          data.answer.includes('[AI-Generated Study Question]'),
      };
      onAppendChatMessages(activeDoc.id, [assistantMsg]);
    } catch {
      setAskError('Unable to reach the AI Study Helper server.');
    } finally {
      setAsking(false);
    }
  };

  const handleGenerateCustomDeck = async (mode: 'vignettes' | 'quick_review') => {
    if (!activeDoc || generatingMode) return;
    setGenerationError(null);
    setGeneratingMode(mode);
    soundEngine.playUiTick();

    try {
      const res = await fetch('/api/study-docs/generate-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: activeDoc.id,
          mode,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as Partial<CustomStudyDeck> & {
        error?: string;
      };

      if (!res.ok || !Array.isArray(data.cases) || data.cases.length === 0) {
        setGenerationError(
          data.error ||
            `Could not generate clinical cases from this file (HTTP ${res.status}).`
        );
        return;
      }

      const newDeck: CustomStudyDeck = {
        docId: data.docId || activeDoc.id,
        docName: data.docName || activeDoc.displayName,
        mode: data.mode === 'quick_review' ? 'quick_review' : 'vignettes',
        generatedAt: new Date().toISOString(),
        cases: data.cases,
        drugs: Array.isArray(data.drugs) ? data.drugs : [],
      };
      soundEngine.playHintReveal();
      onCustomDeckGenerated(newDeck);
    } catch {
      setGenerationError('Unable to connect to generate clinical cases.');
    } finally {
      setGeneratingMode(null);
    }
  };

  const handleExportDeckAnki = (deck: CustomStudyDeck) => {
    soundEngine.playUiTick();
    const deckDrugMap = Object.fromEntries(deck.drugs.map((d) => [d.id, d]));
    const deckCaseMap = Object.fromEntries(deck.cases.map((c) => [c.id, c]));
    const csv = buildAnkiCsvExport({
      progress: {
        masteredDrugIds: [],
        totalCasesSolved: 0,
        totalCasesAttempted: 0,
        bestShiftScore: 0,
        dailyScore: 0,
        dailyDate: getTodayDateKey(),
        bestStreak: 0,
        perfectShiftsCompleted: 0,
        unlockedAchievements: [],
        solvedDilemmaIds: [],
        bookmarkedCaseIds: [],
      },
      customDecks: [deck],
      customDrugMap: deckDrugMap,
      customCaseMap: deckCaseMap,
    });
    const safeName = deck.docName.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    triggerFileDownload(csv, `apotheca-anki-${safeName}.csv`, 'text/csv');
  };

  const handleExportDeckMd = (deck: CustomStudyDeck) => {
    soundEngine.playUiTick();
    const deckDrugMap = Object.fromEntries(deck.drugs.map((d) => [d.id, d]));
    const deckCaseMap = Object.fromEntries(deck.cases.map((c) => [c.id, c]));
    const md = buildStudyExportContent({
      progress: {
        masteredDrugIds: [],
        totalCasesSolved: 0,
        totalCasesAttempted: 0,
        bestShiftScore: 0,
        dailyScore: 0,
        dailyDate: getTodayDateKey(),
        bestStreak: 0,
        perfectShiftsCompleted: 0,
        unlockedAchievements: [],
        solvedDilemmaIds: [],
        bookmarkedCaseIds: [],
      },
      customDecks: [deck],
      customDrugMap: deckDrugMap,
      customCaseMap: deckCaseMap,
      format: 'markdown',
    });
    const safeName = deck.docName.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    triggerFileDownload(md, `apotheca-study-${safeName}.md`, 'text/markdown');
  };

  const handleExplainTopic = (topic: StudyDocTopic) => {
    setSelectedTopicTitle(topic.title);
    void submitQuestion(
      `Explain "${topic.title}" in clear, structured detail based on the uploaded study file. Cover core mechanisms, key concepts or drug takeaways, and any clinical cautions.`,
      topic.title
    );
  };

  const handleQuizTopic = (topic: StudyDocTopic) => {
    setSelectedTopicTitle(topic.title);
    void submitQuestion(
      `Create 2 high-yield active recall practice questions on "${topic.title}" directly from the uploaded study file, followed by concise answer rationales under a clear separator.`,
      topic.title,
      true
    );
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header & Upload Dropzone Card */}
      <div className="rounded-2xl bg-surface border border-line/14 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-text">
              <Sparkles className="w-4 h-4" />
              <span>AI Study Helper · Any Format up to 100 MB</span>
            </div>
            <h2
              className="mt-1.5 text-xl sm:text-2xl font-semibold text-ink"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Upload Lectures, Slides, Notes, Images, Audio, or Video
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
              Upload any study file up to 100 MB (PDF, Word, PowerPoint, Excel, Text, Markdown, CSV, screenshots, audio, or video). Apotheca immediately explains what is inside, breaks down key topics, quizzes you, and reads explanations aloud.
            </p>
          </div>

          {docs.length > 0 && (
            <button
              type="button"
              disabled={Boolean(uploadPhase)}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-bg hover:bg-accent-hover disabled:opacity-45 text-on-accent text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <FileUp className="w-4 h-4" />
              <span>Upload Another File</span>
            </button>
          )}
        </div>

        {aiAssistantAvailable === false && (
          <div className="p-3.5 rounded-xl bg-warn-surface border border-warn-border text-xs text-warn-ink flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-warn-text shrink-0 mt-0.5" />
            <span>
              <strong>GEMINI_API_KEY</strong> is not configured yet. Add your Gemini API key in <strong>Settings &gt; Secrets</strong> to analyze uploaded files and generate explanations.
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            handleFileSelected(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {uploadPhase ? (
          <div className="rounded-xl bg-deep border border-accent-ring/45 p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Loader2 className="w-4 h-4 text-accent-text animate-spin shrink-0" />
                <span className="text-sm font-medium text-ink truncate">
                  {uploadingName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-wash/8 hover:bg-wash/14 text-xs text-ink-muted hover:text-ink cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>
                  {uploadStageText ||
                    (uploadPhase === 'uploading'
                      ? 'Uploading study file to workspace...'
                      : 'Reading file & preparing clear student explanation with Gemini...')}
                </span>
                <span
                  className="tabular-nums text-accent-text font-semibold"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-wash/12 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    uploadPhase === 'analyzing'
                      ? 'bg-accent-hover animate-pulse'
                      : 'bg-accent-bg'
                  }`}
                  style={{ width: `${Math.max(4, uploadProgress)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFileSelected(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
              dragging
                ? 'border-accent-ring bg-accent-bg/12'
                : 'border-line/20 bg-deep/65 hover:border-accent-ring/60 hover:bg-deep/90'
            }`}
          >
            <FileUp className="w-7 h-7 text-accent-text mx-auto" />
            <div className="mt-2.5 text-sm font-semibold text-ink">
              Drop any study file here, or click to browse
            </div>
            <div className="mt-1 text-xs text-ink-muted">
              PDF, Word (.docx/.doc), Slides (.pptx), Excel (.xlsx/.csv), Notes (.txt/.md/.rtf), Images, Audio, or Video up to 100 MB
            </div>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-xl bg-danger-surface border border-danger-border text-xs text-danger-ink flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-danger-text shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-danger-ink/80 hover:text-danger-ink cursor-pointer shrink-0"
              aria-label="Dismiss upload error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Uploaded Documents Selector */}
        {docs.length > 0 && (
          <div className="pt-2 border-t border-line/12">
            <div className="text-xs font-medium text-ink-muted mb-2">
              Uploaded Study Files ({docs.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {docs.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs transition-colors ${
                      isSelected
                        ? 'bg-accent-bg/18 border-accent-ring/70 text-ink'
                        : 'bg-deep/80 border-line/14 text-ink-muted hover:border-line/30 hover:text-ink'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playUiTick();
                        onSelectDoc(doc.id);
                      }}
                      className="inline-flex items-center gap-2 cursor-pointer max-w-[16rem]"
                    >
                      <FileText className="w-3.5 h-3.5 text-accent-text shrink-0" />
                      <span className="truncate font-medium">{doc.displayName}</span>
                      <span
                        className="text-[10px] text-ink-muted/85 shrink-0"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {formatFileSize(doc.sizeBytes)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1 rounded-lg text-ink-muted/70 hover:text-danger-text hover:bg-wash/8 cursor-pointer"
                      aria-label={`Remove ${doc.displayName}`}
                      title="Remove PDF from session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Document Breakdown & Interactive AI Helper */}
      {activeDoc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Document Overview & Extracted Topics */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-dossier text-slate-900 border border-slate-200 p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-semibold text-emerald-800 inline-flex items-center gap-1.5">
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  {activeDoc.fileFormatLabel || 'Uploaded File'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatFileSize(activeDoc.sizeBytes)}
                </span>
              </div>
              <h3
                className="text-lg font-semibold text-slate-950 break-words"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {activeDoc.displayName}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {activeDoc.overview}
              </p>

              {/* Turn Uploaded Material Into Playable Cases / Drills */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Convert File Into Practice
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={Boolean(generatingMode)}
                    onClick={() => void handleGenerateCustomDeck('vignettes')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {generatingMode === 'vignettes' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Building Clinical Cases...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Turn Into Clinical Cases</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(generatingMode)}
                    onClick={() => void handleGenerateCustomDeck('quick_review')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {generatingMode === 'quick_review' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                        <span>Building MOA Drill...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Generate MOA Drill</span>
                      </>
                    )}
                  </button>
                </div>

                {generationError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                    {generationError}
                  </div>
                )}

                {activeDocDecks.map((deck) => (
                  <div
                    key={`${deck.docId}-${deck.generatedAt}`}
                    className="p-3 rounded-xl bg-dossier-inset border border-emerald-700/25 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-emerald-950">
                        {deck.mode === 'vignettes'
                          ? `${deck.cases.length} Clinical Cases Ready`
                          : `${deck.cases.length} MOA Drills Ready`}
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        AI-Generated · Verify guidelines
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playUiTick();
                          onPlayCustomDeck(deck);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play Deck</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportDeckAnki(deck)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3 h-3 text-emerald-700" />
                        <span>Anki .csv</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportDeckMd(deck)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3 h-3 text-emerald-700" />
                        <span>Guide .md</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeDoc.topics.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-accent-text px-1">
                  Topics Extracted from File ({activeDoc.topics.length})
                </div>
                {activeDoc.topics.map((topic) => {
                  const focused = selectedTopicTitle === topic.title;
                  return (
                    <div
                      key={topic.id}
                      className={`rounded-2xl p-4 border transition-colors space-y-2.5 ${
                        focused
                          ? 'bg-white border-emerald-500 text-slate-900 shadow-lg'
                          : 'bg-dossier border-slate-200/90 text-slate-900'
                      }`}
                    >
                      <h4
                        className="text-base font-semibold text-slate-950"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {topic.title}
                      </h4>
                      {topic.summary && (
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {topic.summary}
                        </p>
                      )}
                      {topic.keyTerms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {topic.keyTerms.map((term) => (
                            <span
                              key={term}
                              className="px-2 py-0.5 rounded-md bg-dossier-inset border border-emerald-800/15 text-[11px] font-medium text-emerald-950"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={asking}
                          onClick={() => handleExplainTopic(topic)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Explain Topic</span>
                        </button>
                        <button
                          type="button"
                          disabled={asking}
                          onClick={() => handleQuizTopic(topic)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Quiz Me</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: AI Helper Explanation & Q&A Workspace */}
          <div className="lg:col-span-7 rounded-2xl bg-surface border border-line/14 flex flex-col overflow-hidden min-h-[28rem] lg:sticky lg:top-6">
            <div className="px-5 py-3.5 border-b border-line/12 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-text" />
                  <span>AI Topic Explainer &amp; Tutor</span>
                </div>
                <div className="text-[11px] text-ink-muted mt-0.5">
                  {selectedTopicTitle
                    ? `Focused on: ${selectedTopicTitle}`
                    : `Answering directly from ${activeDoc.displayName}`}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiTick();
                    setCitationMode((v) => !v);
                  }}
                  aria-pressed={citationMode}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    citationMode
                      ? 'bg-accent-bg/18 border-accent-ring/50 text-ink'
                      : 'bg-wash/6 border-line/14 text-ink-muted hover:text-ink'
                  }`}
                  title="Cite sections/slides from your file and attach academic integrity verification notes"
                >
                  <Quote className="w-3 h-3" />
                  <span>Clinical Citation Mode: {citationMode ? 'On' : 'Off'}</span>
                </button>
                {selectedTopicTitle && (
                  <button
                    type="button"
                    onClick={() => setSelectedTopicTitle(null)}
                    className="text-[11px] text-accent-text hover:opacity-80 underline underline-offset-2 cursor-pointer"
                  >
                    Ask across whole file
                  </button>
                )}
              </div>
            </div>

            {/* Suggested Prompts */}
            {activeDoc.suggestedQuestions.length > 0 && (
              <div className="px-5 pt-3.5 pb-2 border-b border-line/12 bg-deep/45 space-y-2">
                <div className="text-[11px] font-medium text-ink-muted">
                  Quick Follow-Up Questions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeDoc.suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={asking}
                      onClick={() => void submitQuestion(q)}
                      className="text-left px-3 py-1.5 rounded-lg bg-deep/85 hover:bg-deep border border-line/14 hover:border-accent-ring/55 text-xs text-ink transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation History */}
            {activeMessages.length > 0 && (
              <div className="p-5 space-y-4 max-h-[34rem] overflow-y-auto flex-1">
                {activeMessages.map((msg) => {
                  if (msg.role === 'user') {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-accent-bg/18 border border-accent-ring/45 px-4 py-2.5 text-xs sm:text-sm text-ink leading-relaxed">
                          {msg.topicTitle && (
                            <div className="text-[10px] font-semibold text-accent-text mb-1">
                              Topic · {msg.topicTitle}
                            </div>
                          )}
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  const speechTag = `study-msg:${msg.id}`;
                  const isSpeaking = voiceSnap.activeTag === speechTag;
                  const isLoadingSpeech = voiceSnap.loadingTag === speechTag;

                  return (
                    <div
                      key={msg.id}
                      className="rounded-2xl rounded-tl-sm bg-dossier text-slate-900 border border-slate-200 p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-emerald-800 inline-flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Apotheca AI Study Helper
                          </span>
                          {(msg.isAiGeneratedQuiz || msg.citationMode) && (
                            <span className="text-[11px] font-medium text-amber-800 inline-flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              {msg.isAiGeneratedQuiz
                                ? 'AI Study Question · Verify Primary Guidelines'
                                : 'Cited Study Summary · Verify Primary Guidelines'}
                            </span>
                          )}
                        </div>
                        {voiceEngine.isSupported() && (
                          <button
                            type="button"
                            disabled={muted}
                            onClick={() =>
                              voiceEngine.toggleSpeak(msg.text, speechTag, {
                                style:
                                  'Warm, clear clinical pharmacology tutor explaining study material',
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-45 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isLoadingSpeech ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                                <span>Synthesizing</span>
                              </>
                            ) : isSpeaking ? (
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
                      </div>

                      <SafeMarkdownText content={msg.text} />
                    </div>
                  );
                })}

                {asking && (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-deep border border-line/12 text-xs text-accent-text">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-text" />
                    <span>Reading your file and preparing explanation...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {askError && (
              <div className="mx-5 mb-3 p-3 rounded-xl bg-danger-surface border border-danger-border text-xs text-danger-ink flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-danger-text shrink-0 mt-0.5" />
                <span>{askError}</span>
              </div>
            )}

            {/* Question Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitQuestion(questionInput, selectedTopicTitle);
              }}
              className="p-4 border-t border-line/12 bg-deep/60 mt-auto flex items-center gap-2.5"
            >
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                disabled={asking}
                placeholder={
                  selectedTopicTitle
                    ? `Ask a follow-up about ${selectedTopicTitle}...`
                    : 'Ask anything about the uploaded file...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-line/16 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-accent-ring disabled:opacity-60"
              />
              <button
                type="button"
                disabled={asking || !questionInput.trim()}
                onClick={() => void submitQuestion(questionInput, selectedTopicTitle)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-bg hover:bg-accent-hover disabled:opacity-45 text-on-accent text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {asking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
