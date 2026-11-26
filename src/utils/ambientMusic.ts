export type AmbientPreset = 'felt_pads' | 'deep_drone' | 'library_rain';

export const AMBIENT_PRESET_LABELS: Record<
  AmbientPreset,
  { label: string; description: string }
> = {
  felt_pads: {
    label: 'Warm Felt Pads',
    description: 'Slow, consonant ambient chords with soft study air',
  },
  deep_drone: {
    label: 'Deep Focus Drone',
    description: 'Steady harmonic fifths and warm low-pass shelter',
  },
  library_rain: {
    label: 'Quiet Study Rain',
    description: 'Gentle acoustic rain bed with zero melodic distraction',
  },
};

type MusicListener = () => void;

const FELT_CHORDS: number[][] = [
  [174.61, 220.0, 261.63, 329.63, 392.0], // Fmaj9
  [146.83, 220.0, 261.63, 329.63, 349.23], // Dm9
  [116.54, 174.61, 220.0, 261.63, 293.66], // Bbmaj9
  [130.81, 196.0, 246.94, 293.66, 329.63], // C6/9
];

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  private droneOscs: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private lfoOsc: OscillatorNode | null = null;

  private chordTimer: number | null = null;
  private chordIndex = 0;

  private enabled = false;
  private muted = false;
  private volume = 0.45;
  private preset: AmbientPreset = 'felt_pads';
  private isPlaying = false;
  private isDucked = false;
  private gestureListenerAttached = false;
  private listeners = new Set<MusicListener>();

  public subscribe(listener: MusicListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getPreset(): AmbientPreset {
    return this.preset;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public configure(opts: {
    enabled?: boolean;
    volume?: number;
    preset?: AmbientPreset;
    muted?: boolean;
  }): void {
    if (opts.volume !== undefined) {
      this.volume = Math.max(0, Math.min(1, opts.volume));
    }
    if (opts.preset !== undefined) {
      const changed = this.preset !== opts.preset;
      this.preset = opts.preset;
      if (changed && this.isPlaying) {
        this.rebuildVoices();
      }
    }
    if (opts.muted !== undefined) {
      this.muted = opts.muted;
    }
    if (opts.enabled !== undefined) {
      this.enabled = opts.enabled;
    }

    this.syncPlaybackState();
    this.notify();
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.syncPlaybackState();
    this.notify();
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateGains();
    this.notify();
  }

  public setPreset(preset: AmbientPreset): void {
    if (this.preset === preset) return;
    this.preset = preset;
    if (this.isPlaying) {
      this.rebuildVoices();
    }
    this.notify();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.syncPlaybackState();
    this.notify();
  }

  public setVoiceDucking(ducked: boolean): void {
    this.isDucked = ducked;
    if (!this.ctx || !this.duckGain) return;
    const now = this.ctx.currentTime;
    const target = ducked ? 0.25 : 1.0;
    this.duckGain.gain.cancelScheduledValues(now);
    this.duckGain.gain.setTargetAtTime(target, now, ducked ? 0.14 : 0.45);
  }

  private attachGestureUnlock(): void {
    if (this.gestureListenerAttached || typeof window === 'undefined') return;
    this.gestureListenerAttached = true;

    const handleGesture = () => {
      if (this.enabled && !this.muted && !this.isPlaying) {
        this.start();
      } else if (this.ctx && this.ctx.state === 'suspended' && this.enabled && !this.muted) {
        this.ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      this.gestureListenerAttached = false;
    };

    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });
  }

  private syncPlaybackState(): void {
    if (this.enabled && !this.muted) {
      if (!this.isPlaying) {
        this.start();
      } else {
        this.updateGains();
      }
    } else if (this.isPlaying) {
      this.stop();
    }
  }

  private ensureGraph(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        this.attachGestureUnlock();
      });
    }

    if (!this.masterGain) {
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(820, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(0.6, this.ctx.currentTime);

      this.duckGain = this.ctx.createGain();
      this.duckGain.gain.setValueAtTime(this.isDucked ? 0.25 : 1.0, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      this.filterNode.connect(this.duckGain);
      this.duckGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    return this.ctx;
  }

  private updateGains(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const target = this.enabled && !this.muted ? 0.16 * this.volume : 0.0001;
    this.masterGain.gain.setTargetAtTime(target, now, 0.35);
  }

  private createWarmRainBuffer(ctx: AudioContext): AudioBuffer {
    const seconds = 6;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * seconds;
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        // Soft brown/pink slope noise
        lastOut = (lastOut + 0.028 * white) / 1.028;
        data[i] = lastOut * 2.8;
      }
      // Crossfade edges for seamless infinite looping
      const fadeSamples = Math.floor(sampleRate * 0.4);
      for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        const head = data[i];
        const tail = data[length - fadeSamples + i];
        data[i] = head * t + tail * (1 - t);
      }
    }

    return buffer;
  }

  private clearActiveVoices(): void {
    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {
        // ignore
      }
      this.noiseSource = null;
    }
    if (this.noiseGain) {
      this.noiseGain.disconnect();
      this.noiseGain = null;
    }
    for (const osc of this.droneOscs) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    }
    this.droneOscs = [];
    if (this.lfoOsc) {
      try {
        this.lfoOsc.stop();
        this.lfoOsc.disconnect();
      } catch {
        // ignore
      }
      this.lfoOsc = null;
    }
    if (this.droneGain) {
      this.droneGain.disconnect();
      this.droneGain = null;
    }
  }

  private rebuildVoices(): void {
    this.clearActiveVoices();
    const ctx = this.ctx;
    if (!ctx || !this.filterNode) return;
    const now = ctx.currentTime;

    // Subtle acoustic air / rain bed present across all presets, prominent in library_rain
    const rainGainLevel =
      this.preset === 'library_rain'
        ? 0.55
        : this.preset === 'deep_drone'
        ? 0.22
        : 0.14;
    const noiseBuffer = this.createWarmRainBuffer(ctx);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(
      this.preset === 'library_rain' ? 680 : 420,
      now
    );

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.0001, now);
    nGain.gain.setTargetAtTime(rainGainLevel, now, 0.8);

    noise.connect(rainFilter);
    rainFilter.connect(nGain);
    nGain.connect(this.filterNode);
    noise.start(now);

    this.noiseSource = noise;
    this.noiseGain = nGain;

    if (this.preset === 'felt_pads') {
      this.filterNode.frequency.setTargetAtTime(840, now, 0.4);
      this.playFeltChord();
      this.chordTimer = window.setInterval(() => {
        if (this.isPlaying && !this.muted) {
          this.playFeltChord();
        }
      }, 6200);
    } else if (this.preset === 'deep_drone') {
      this.filterNode.frequency.setTargetAtTime(520, now, 0.4);
      const dGain = ctx.createGain();
      dGain.gain.setValueAtTime(0.0001, now);
      dGain.gain.setTargetAtTime(0.18, now, 1.4);
      dGain.connect(this.filterNode);
      this.droneGain = dGain;

      // Warm D major/fifth harmonic drone (D3, A3, E4, A4) with gentle detune
      const freqs = [146.83, 220.0, 329.63, 440.0];
      const detunes = [-4, 3, -3, 5];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);
        osc.detune.setValueAtTime(detunes[idx], now);

        const voiceGain = ctx.createGain();
        voiceGain.gain.setValueAtTime(idx === 0 ? 0.36 : 0.2 / (idx + 0.5), now);

        osc.connect(voiceGain);
        voiceGain.connect(dGain);
        osc.start(now);
        this.droneOscs.push(osc);
      });

      // Slow breathing filter modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.075, now);
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.setValueAtTime(140, now);
      lfo.connect(lfoDepth);
      lfoDepth.connect(this.filterNode.frequency);
      lfo.start(now);
      this.lfoOsc = lfo;
    } else {
      // library_rain
      this.filterNode.frequency.setTargetAtTime(920, now, 0.4);
    }
  }

  private playFeltChord(): void {
    const ctx = this.ctx;
    if (!ctx || !this.filterNode) return;
    const chord = FELT_CHORDS[this.chordIndex % FELT_CHORDS.length];
    this.chordIndex = (this.chordIndex + 1) % FELT_CHORDS.length;

    const now = ctx.currentTime;
    chord.forEach((freq, idx) => {
      const start = now + idx * 0.14;
      const duration = 6.8;

      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.detune.setValueAtTime((idx % 2 === 0 ? -1 : 1) * 3.5, start);

      const noteGain = ctx.createGain();
      const peak = idx === 0 ? 0.095 : 0.06;
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.linearRampToValueAtTime(peak, start + 1.5);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(noteGain);
      noteGain.connect(this.filterNode!);

      osc.start(start);
      osc.stop(start + duration + 0.1);
    });
  }

  private start(): void {
    const ctx = this.ensureGraph();
    if (!ctx || !this.masterGain) {
      this.attachGestureUnlock();
      return;
    }
    this.isPlaying = true;
    this.rebuildVoices();
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.setTargetAtTime(0.16 * this.volume, now, 0.7);
  }

  private stop(): void {
    this.isPlaying = false;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.18);
      window.setTimeout(() => {
        if (!this.isPlaying) {
          this.clearActiveVoices();
        }
      }, 450);
    } else {
      this.clearActiveVoices();
    }
  }
}

export const ambientMusic = new AmbientMusicEngine();
