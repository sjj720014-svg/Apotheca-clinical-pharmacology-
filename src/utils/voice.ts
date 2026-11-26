import {
  ClinicalCase,
  DrugMonograph,
  GeminiVoiceName,
  VoiceProviderMode,
} from '../types/pharma';
import { ambientMusic } from './ambientMusic';

export interface GeminiVoiceOption {
  id: GeminiVoiceName;
  label: string;
  tone: string;
  character: string;
}

export const GEMINI_VOICE_OPTIONS: GeminiVoiceOption[] = [
  {
    id: 'Kore',
    label: 'Kore',
    tone: 'Warm · Balanced',
    character: 'Clear, calm clinical educator ideal for case presentations',
  },
  {
    id: 'Zephyr',
    label: 'Zephyr',
    tone: 'Gentle · Bright',
    character: 'Relaxed, smooth study narrator for long monograph reviews',
  },
  {
    id: 'Charon',
    label: 'Charon',
    tone: 'Deep · Steady',
    character: 'Measured, authoritative attending tone for high-alert pearls',
  },
  {
    id: 'Puck',
    label: 'Puck',
    tone: 'Crisp · Upbeat',
    character: 'Engaging, lively mentor pacing for rapid mechanism drills',
  },
  {
    id: 'Fenrir',
    label: 'Fenrir',
    tone: 'Grounded · Rich',
    character: 'Focused, low-distraction baritone voice for deep study',
  },
];

export interface BrowserVoiceInfo {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
}

export interface VoiceStatusSnapshot {
  activeTag: string | null;
  loadingTag: string | null;
  provider: VoiceProviderMode;
  geminiVoice: GeminiVoiceName;
  browserVoiceURI: string | null;
  speechRate: number;
  lastError: string | null;
}

type VoiceListener = (activeTag: string | null, snapshot: VoiceStatusSnapshot) => void;
type VoiceEndedListener = (tag: string) => void;

export function formatMedicalSpeech(input: string): string {
  return input
    .replace(/[#*_`]/g, '')
    .replace(/t½/g, 'half-life')
    .replace(/\bVd\b/g, 'volume of distribution')
    .replace(/\beGFR\b/g, 'estimated G F R')
    .replace(/\bCrCl\b/g, 'creatinine clearance')
    .replace(/\bSCr\b/g, 'serum creatinine')
    .replace(/\bHbA1c\b/g, 'hemoglobin A 1 C')
    .replace(/\bQTc\b/g, 'Q T c')
    .replace(/\bINR\b/g, 'I N R')
    .replace(/\bBUN\b/g, 'B U N')
    .replace(/\bTSH\b/g, 'T S H')
    .replace(/\bBP\b/g, 'blood pressure')
    .replace(/\bHR\b/g, 'heart rate')
    .replace(/\bCYP(\d)([A-Z])(\d+)/g, 'C Y P $1 $2 $3')
    .replace(/\bq(\d+)h\b/gi, 'every $1 hours')
    .replace(/\bBID\b/g, 'twice daily')
    .replace(/\bTID\b/g, 'three times daily')
    .replace(/\bQID\b/g, 'four times daily')
    .replace(/\bQD\b/g, 'once daily')
    .replace(/\bmEq\/L\b/g, 'milliequivalents per liter')
    .replace(/\bmg\/dL\b/g, 'milligrams per deciliter')
    .replace(/\bmcg\/mL\b/g, 'micrograms per milliliter')
    .replace(/\bmcg\/L\b/g, 'micrograms per liter')
    .replace(/\bmL\/min\b/g, 'milliliters per minute')
    .replace(/\bmmol\/L\b/g, 'millimoles per liter')
    .replace(/\bmmHg\b/g, 'millimeters of mercury')
    .replace(/\bbpm\b/g, 'beats per minute')
    .replace(/\bmg\b/g, 'milligrams')
    .replace(/\bmcg\b/g, 'micrograms')
    .replace(/↑/g, 'elevated ')
    .replace(/↓/g, 'low ')
    .replace(/·/g, ', ')
    .replace(/→|->/g, ' to ')
    .replace(/≥|>=/g, 'at least ')
    .replace(/≤|<=/g, 'at most ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MAX_AUDIO_CACHE = 40;

class VoiceEngine {
  private muted = false;
  private autoVoiceEnabled = true;
  private provider: VoiceProviderMode = 'gemini';
  private geminiVoice: GeminiVoiceName = 'Kore';
  private browserVoiceURI: string | null = null;
  private speechRate = 0.98;
  private activeTag: string | null = null;
  private loadingTag: string | null = null;
  private lastError: string | null = null;

  private listeners = new Set<VoiceListener>();
  private endedListeners = new Set<VoiceEndedListener>();
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private initializedVoices = false;

  private audioCtx: AudioContext | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAbort: AbortController | null = null;
  private browserSpeakTimer: ReturnType<typeof setTimeout> | null = null;
  private audioBufferCache = new Map<string, ArrayBuffer>();
  private audioUrlCache = new Map<string, string>();
  private requestSeq = 0;

  public isBrowserSpeechSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Must be called synchronously inside a user click/tap handler so browsers
   * and cross-origin preview iframes permit audio playback after async fetch().
   */
  private unlockAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume().catch(() => {});
      }
      // Play a 1-sample silent buffer synchronously to lock in gesture activation
      const silent = this.audioCtx.createBuffer(1, 1, 22050);
      const src = this.audioCtx.createBufferSource();
      src.buffer = silent;
      src.connect(this.audioCtx.destination);
      src.start(0);
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private ensureVoicesInitialized(): void {
    if (this.initializedVoices || !this.isBrowserSpeechSupported()) return;
    this.initializedVoices = true;
    const synth = window.speechSynthesis;
    const initialVoices = synth.getVoices();
    if (initialVoices.length > 0 && !this.preferredVoice) {
      this.preferredVoice = this.pickBestBrowserVoice(initialVoices);
    }
    synth.addEventListener?.('voiceschanged', () => {
      this.preferredVoice = this.pickBestBrowserVoice(synth.getVoices());
      this.notify();
    });
  }

  public listBrowserVoices(): BrowserVoiceInfo[] {
    if (!this.isBrowserSpeechSupported()) return [];
    this.ensureVoicesInitialized();
    const voices = window.speechSynthesis.getVoices();
    const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const pool = english.length > 0 ? english : voices;
    return pool.map((v) => ({
      voiceURI: v.voiceURI,
      name: v.name,
      lang: v.lang,
      localService: v.localService,
    }));
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stop();
    }
  }

  public setAutoVoiceEnabled(enabled: boolean): void {
    this.autoVoiceEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isAutoVoiceEnabled(): boolean {
    return this.autoVoiceEnabled;
  }

  public getProvider(): VoiceProviderMode {
    return this.provider;
  }

  public setProvider(provider: VoiceProviderMode): void {
    if (this.provider === provider) return;
    this.provider = provider;
    this.lastError = null;
    this.stop();
    this.notify();
  }

  public getGeminiVoice(): GeminiVoiceName {
    return this.geminiVoice;
  }

  public setGeminiVoice(voice: GeminiVoiceName): void {
    if (this.geminiVoice === voice) return;
    this.geminiVoice = voice;
    this.lastError = null;
    this.notify();
  }

  public getBrowserVoiceURI(): string | null {
    return this.browserVoiceURI;
  }

  public setBrowserVoiceURI(uri: string | null): void {
    if (this.browserVoiceURI === uri) return;
    this.browserVoiceURI = uri;
    this.preferredVoice = null;
    this.lastError = null;
    this.notify();
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public setSpeechRate(rate: number): void {
    const clamped = Math.max(0.75, Math.min(1.3, Number(rate) || 0.98));
    if (this.speechRate === clamped) return;
    this.speechRate = clamped;
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.playbackRate.value = clamped;
      } catch {
        // ignore
      }
    }
    if (this.currentAudio) {
      this.currentAudio.playbackRate = clamped;
    }
    this.notify();
  }

  public clearError(): void {
    if (this.lastError !== null) {
      this.lastError = null;
      this.notify();
    }
  }

  public getActiveTag(): string | null {
    return this.activeTag;
  }

  public getSnapshot(): VoiceStatusSnapshot {
    return {
      activeTag: this.activeTag,
      loadingTag: this.loadingTag,
      provider: this.provider,
      geminiVoice: this.geminiVoice,
      browserVoiceURI: this.browserVoiceURI,
      speechRate: this.speechRate,
      lastError: this.lastError,
    };
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeEnded(listener: VoiceEndedListener): () => void {
    this.endedListeners.add(listener);
    return () => {
      this.endedListeners.delete(listener);
    };
  }

  private emitNaturalEnd(tag: string): void {
    this.endedListeners.forEach((cb) => cb(tag));
  }

  private notify(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((cb) => cb(this.activeTag, snap));
  }

  private setState(patch: {
    activeTag?: string | null;
    loadingTag?: string | null;
    lastError?: string | null;
  }): void {
    if (patch.activeTag !== undefined) this.activeTag = patch.activeTag;
    if (patch.loadingTag !== undefined) this.loadingTag = patch.loadingTag;
    if (patch.lastError !== undefined) this.lastError = patch.lastError;
    this.notify();
  }

  private resolveBrowserVoice(): SpeechSynthesisVoice | null {
    if (!this.isBrowserSpeechSupported()) return null;
    this.ensureVoicesInitialized();
    const synth = window.speechSynthesis;
    const allVoices = synth.getVoices();
    if (this.browserVoiceURI) {
      const explicit = allVoices.find((v) => v.voiceURI === this.browserVoiceURI);
      if (explicit) return explicit;
    }
    if (!this.preferredVoice) {
      this.preferredVoice = this.pickBestBrowserVoice(allVoices);
    }
    return this.preferredVoice;
  }

  private pickBestBrowserVoice(
    voices: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | null {
    if (!voices.length) return null;
    const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const pool = english.length > 0 ? english : voices;

    const scored = pool.map((v) => {
      let score = 0;
      const name = v.name.toLowerCase();
      if (v.lang === 'en-US') score += 4;
      else if (v.lang === 'en-GB') score += 3;
      if (
        name.includes('natural') ||
        name.includes('neural') ||
        name.includes('enhanced') ||
        name.includes('samantha') ||
        name.includes('daniel') ||
        name.includes('aria') ||
        name.includes('jenny') ||
        name.includes('google us english')
      ) {
        score += 5;
      }
      if (v.localService) score += 1;
      return { voice: v, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.voice ?? null;
  }

  private stopAudioPlayback(): void {
    if (this.currentSourceNode) {
      const node = this.currentSourceNode;
      this.currentSourceNode = null;
      node.onended = null;
      try {
        node.stop();
      } catch {
        // already stopped
      }
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio = null;
    }
  }

  public stop(): void {
    this.requestSeq++;
    if (this.browserSpeakTimer) {
      clearTimeout(this.browserSpeakTimer);
      this.browserSpeakTimer = null;
    }
    if (this.currentAbort) {
      this.currentAbort.abort();
      this.currentAbort = null;
    }
    this.stopAudioPlayback();
    if (this.isBrowserSpeechSupported()) {
      window.speechSynthesis.cancel();
    }
    ambientMusic.setVoiceDucking(false);
    if (this.activeTag !== null || this.loadingTag !== null) {
      this.setState({ activeTag: null, loadingTag: null });
    }
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private cacheAudioData(
    key: string,
    bytes: Uint8Array,
    mimeType: string
  ): { buffer: ArrayBuffer; blobUrl: string } {
    if (this.audioUrlCache.size >= MAX_AUDIO_CACHE) {
      const oldestKey = this.audioUrlCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = this.audioUrlCache.get(oldestKey);
        if (oldUrl && this.currentAudio?.src !== oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
        this.audioUrlCache.delete(oldestKey);
        this.audioBufferCache.delete(oldestKey);
      }
    }
    const copy = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([copy], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    this.audioBufferCache.set(key, copy);
    this.audioUrlCache.set(key, blobUrl);
    return { buffer: copy, blobUrl };
  }

  private async speakWithGemini(
    cleanText: string,
    tag: string,
    style?: string,
    voiceOverride?: GeminiVoiceName
  ): Promise<void> {
    const seq = ++this.requestSeq;
    const voiceName = voiceOverride ?? this.geminiVoice;
    const cacheKey = `${voiceName}:${style ?? ''}:${cleanText}`;

    const cachedBuffer = this.audioBufferCache.get(cacheKey);
    const cachedUrl = this.audioUrlCache.get(cacheKey);
    if (cachedBuffer && cachedUrl) {
      await this.playAudioData(cachedBuffer, cachedUrl, tag, seq);
      return;
    }

    const controller = new AbortController();
    this.currentAbort = controller;
    this.setState({ loadingTag: tag, activeTag: null, lastError: null });

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceName,
          style:
            style ?? 'Calm, warm, articulate clinical pharmacology educator',
        }),
        signal: controller.signal,
      });

      if (seq !== this.requestSeq) return;

      const data = (await res.json().catch(() => ({}))) as {
        audioBase64?: string;
        mimeType?: string;
        error?: string;
      };

      if (!res.ok || !data.audioBase64) {
        const msg =
          data.error || `Gemini voice synthesis failed (HTTP ${res.status}).`;
        if (!tag.startsWith('preview:gemini:') && this.isBrowserSpeechSupported()) {
          this.setState({ loadingTag: null, activeTag: null, lastError: null });
          this.speakWithBrowser(cleanText, tag);
          return;
        }
        this.setState({ loadingTag: null, activeTag: null, lastError: msg });
        return;
      }

      const bytes = this.base64ToBytes(data.audioBase64);
      const { buffer, blobUrl } = this.cacheAudioData(
        cacheKey,
        bytes,
        data.mimeType || 'audio/wav'
      );

      if (seq !== this.requestSeq) return;
      await this.playAudioData(buffer, blobUrl, tag, seq);
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      if (seq !== this.requestSeq) return;
      if (!tag.startsWith('preview:gemini:') && this.isBrowserSpeechSupported()) {
        this.setState({ loadingTag: null, activeTag: null, lastError: null });
        this.speakWithBrowser(cleanText, tag);
        return;
      }
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to reach Gemini voice service.';
      this.setState({ loadingTag: null, activeTag: null, lastError: msg });
    } finally {
      if (this.currentAbort === controller) {
        this.currentAbort = null;
      }
    }
  }

  private async playAudioData(
    arrayBuffer: ArrayBuffer,
    blobUrl: string,
    tag: string,
    seq: number
  ): Promise<void> {
    if (this.muted || seq !== this.requestSeq) return;
    this.stopAudioPlayback();

    const ctx = this.audioCtx ?? this.unlockAudio();
    if (ctx) {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        // decodeAudioData detaches its input buffer in some engines, so pass a slice
        const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
        if (this.muted || seq !== this.requestSeq) return;

        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.playbackRate.value = this.speechRate;
        source.connect(ctx.destination);
        this.currentSourceNode = source;
        ambientMusic.setVoiceDucking(true);
        this.setState({ loadingTag: null, activeTag: tag, lastError: null });

        source.onended = () => {
          if (this.currentSourceNode === source) {
            this.currentSourceNode = null;
          }
          ambientMusic.setVoiceDucking(false);
          if (this.activeTag === tag && seq === this.requestSeq) {
            this.setState({ activeTag: null });
            this.emitNaturalEnd(tag);
          }
        };

        source.start(0);
        return;
      } catch {
        // Fall through to HTMLAudioElement playback
      }
    }

    if (this.muted || seq !== this.requestSeq) return;
    const audio = new Audio(blobUrl);
    audio.playbackRate = this.speechRate;
    this.currentAudio = audio;
    ambientMusic.setVoiceDucking(true);
    this.setState({ loadingTag: null, activeTag: tag, lastError: null });

    audio.onended = () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
      ambientMusic.setVoiceDucking(false);
      if (this.activeTag === tag && seq === this.requestSeq) {
        this.setState({ activeTag: null });
        this.emitNaturalEnd(tag);
      }
    };

    audio.onerror = () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
      ambientMusic.setVoiceDucking(false);
      if (this.activeTag === tag) {
        this.setState({
          activeTag: null,
          lastError: 'Audio playback failed in this browser.',
        });
      }
    };

    try {
      await audio.play();
    } catch {
      ambientMusic.setVoiceDucking(false);
      if (seq === this.requestSeq) {
        this.setState({
          activeTag: null,
          loadingTag: null,
          lastError: 'Click Sample or Listen again to start voice playback.',
        });
      }
    }
  }

  private speakWithBrowser(
    cleanText: string,
    tag: string,
    options?: { rate?: number; pitch?: number; browserVoiceURI?: string }
  ): void {
    if (!this.isBrowserSpeechSupported()) return;
    const synth = window.speechSynthesis;
    const seq = ++this.requestSeq;
    const needsDelay = synth.speaking || synth.pending;

    if (needsDelay) {
      synth.cancel();
    }
    if (synth.paused) {
      synth.resume();
    }

    const startUtterance = () => {
      if (this.muted || seq !== this.requestSeq) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (options?.browserVoiceURI) {
        const chosen = synth
          .getVoices()
          .find((v) => v.voiceURI === options.browserVoiceURI);
        if (chosen) {
          utterance.voice = chosen;
          utterance.lang = chosen.lang;
        }
      } else {
        const voice = this.resolveBrowserVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = 'en-US';
        }
      }
      utterance.rate = options?.rate ?? this.speechRate;
      utterance.pitch = options?.pitch ?? 1.0;

      ambientMusic.setVoiceDucking(true);
      this.setState({ activeTag: tag, loadingTag: null, lastError: null });
      utterance.onend = () => {
        ambientMusic.setVoiceDucking(false);
        if (this.activeTag === tag && seq === this.requestSeq) {
          this.setState({ activeTag: null });
          this.emitNaturalEnd(tag);
        }
      };
      utterance.onerror = (evt) => {
        ambientMusic.setVoiceDucking(false);
        const errCode = (evt as SpeechSynthesisErrorEvent)?.error;
        if (this.activeTag === tag && seq === this.requestSeq) {
          this.setState({
            activeTag: null,
            lastError:
              errCode && errCode !== 'canceled' && errCode !== 'interrupted'
                ? `Browser speech could not play (${errCode}). Try Gemini AI Voices.`
                : null,
          });
        }
      };

      synth.speak(utterance);
    };

    if (needsDelay) {
      this.browserSpeakTimer = setTimeout(() => {
        this.browserSpeakTimer = null;
        startUtterance();
      }, 45);
    } else {
      startUtterance();
    }
  }

  public previewGeminiVoice(voiceName: GeminiVoiceName): void {
    if (this.muted) return;
    this.unlockAudio();
    const tag = `preview:gemini:${voiceName}`;
    if (this.activeTag === tag || this.loadingTag === tag) {
      this.stop();
      return;
    }
    const meta = GEMINI_VOICE_OPTIONS.find((v) => v.id === voiceName);
    const sample = `Hello, this is ${voiceName}. Ready to guide your clinical pharmacology rounds at a calm study pace.`;
    this.stop();
    void this.speakWithGemini(
      sample,
      tag,
      meta ? `${meta.tone} clinical pharmacology tutor` : undefined,
      voiceName
    );
  }

  public previewBrowserVoice(voiceURI: string, displayName: string): void {
    if (this.muted || !this.isBrowserSpeechSupported()) return;
    this.unlockAudio();
    const tag = `preview:browser:${voiceURI}`;
    if (this.activeTag === tag || this.loadingTag === tag) {
      this.stop();
      return;
    }
    this.stop();
    this.speakWithBrowser(
      `Hello, this is ${displayName.replace(/\s*\(.*?\)\s*/g, '')}. Ready to read your clinical pharmacology cases.`,
      tag,
      { browserVoiceURI: voiceURI }
    );
  }

  public speak(
    text: string,
    tag = 'speech',
    options?: {
      rate?: number;
      pitch?: number;
      style?: string;
      forceProvider?: VoiceProviderMode;
    }
  ): void {
    if (this.muted || !this.isSupported()) return;
    this.unlockAudio();
    const cleanText = formatMedicalSpeech(text);
    if (!cleanText) return;

    this.stop();

    const mode = options?.forceProvider ?? this.provider;
    if (mode === 'gemini') {
      void this.speakWithGemini(cleanText, tag, options?.style);
    } else {
      this.speakWithBrowser(cleanText, tag, options);
    }
  }

  public toggleSpeak(
    text: string,
    tag: string,
    options?: {
      rate?: number;
      pitch?: number;
      style?: string;
      forceProvider?: VoiceProviderMode;
    }
  ): void {
    this.unlockAudio();
    if (this.activeTag === tag || this.loadingTag === tag) {
      this.stop();
      return;
    }
    this.speak(text, tag, options);
  }

  public pronounceDrug(drug: DrugMonograph, includeMechanism = false): void {
    this.unlockAudio();
    const tag = `drug:${drug.id}`;
    if (this.activeTag === tag || this.loadingTag === tag) {
      this.stop();
      return;
    }
    const base = `${drug.genericName}. Brand names: ${drug.brandNames}. ${drug.drugClass}.`;
    const full = includeMechanism
      ? `${base} Target: ${drug.molecularTarget}. ${drug.mechanism} Clinical pearl: ${drug.clinicalPearls}`
      : base;
    this.speak(full, tag, {
      style: 'Clear, unhurried clinical pharmacist pronouncing drug terminology',
    });
  }

  public speakCase(clinicalCase: ClinicalCase, force = false): void {
    if (!force && !this.autoVoiceEnabled) return;
    if (force) this.unlockAudio();
    const tag = `case:${clinicalCase.id}`;
    if (force && (this.activeTag === tag || this.loadingTag === tag)) {
      this.stop();
      return;
    }
    const script = `${clinicalCase.title}. ${clinicalCase.patientLine}. ${clinicalCase.presentation} ${clinicalCase.promptQuestion}`;
    this.speak(script, tag, {
      style: 'Calm, focused attending pharmacist presenting clinical rounds',
    });
  }

  public speakHint(hintText: string, tier: number, force = false): void {
    if (!force && !this.autoVoiceEnabled) return;
    if (force) this.unlockAudio();
    this.speak(`Clinical hint ${tier}: ${hintText}`, `hint:${tier}`, {
      style: 'Supportive, concise clinical tutor giving a subtle hint',
    });
  }

  public speakResolution(
    isCorrect: boolean,
    correctDrug: DrugMonograph,
    chosenDrug: DrugMonograph | null,
    clinicalCase: ClinicalCase,
    force = false
  ): void {
    if (!force && !this.autoVoiceEnabled) return;
    if (force) this.unlockAudio();
    const tag = `pearl:${clinicalCase.id}`;
    if (force && (this.activeTag === tag || this.loadingTag === tag)) {
      this.stop();
      return;
    }
    const lead = isCorrect
      ? `Therapeutic target achieved with ${correctDrug.genericName}.`
      : `Adverse outcome with ${chosenDrug?.genericName ?? 'selected agent'}. Optimal therapy is ${correctDrug.genericName}. ${
          chosenDrug ? clinicalCase.distractorRationales[chosenDrug.id] ?? '' : ''
        }`;
    const script = `${lead} Clinical pearl: ${clinicalCase.clinicalPearl}`;
    this.speak(script, tag, {
      style: 'Warm, encouraging clinical pharmacology debriefing voice',
    });
  }
}

export const voiceEngine = new VoiceEngine();
