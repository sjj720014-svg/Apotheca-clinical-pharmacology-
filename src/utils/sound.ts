class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx) {
      if (muted && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      } else if (!muted && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.08,
    delay = 0,
    endFreq?: number
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, endFreq),
        now + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.025);
  }

  private playSoftNoise(
    duration: number,
    filterFreq: number,
    gainLevel = 0.025,
    delay = 0
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const now = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.setValueAtTime(1.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration + 0.02);
  }

  public playUiTick(): void {
    this.playTone(720, 0.045, 'sine', 0.032, 0, 580);
  }

  public playShiftStart(): void {
    this.playSoftNoise(0.08, 1800, 0.018, 0);
    this.playTone(440, 0.18, 'sine', 0.055, 0);
    this.playTone(554.37, 0.22, 'sine', 0.055, 0.07);
    this.playTone(659.25, 0.28, 'triangle', 0.05, 0.14);
  }

  public playCardSelect(): void {
    this.playSoftNoise(0.04, 2200, 0.015, 0);
    this.playTone(540, 0.065, 'triangle', 0.048, 0, 620);
  }

  public playCardDeal(): void {
    this.playSoftNoise(0.075, 1600, 0.02, 0);
    this.playTone(392, 0.09, 'sine', 0.035, 0.01, 493.88);
  }

  public playMonographOpen(): void {
    this.playSoftNoise(0.09, 1300, 0.022, 0);
    this.playTone(587.33, 0.11, 'sine', 0.035, 0.02);
  }

  public playHintReveal(): void {
    this.playTone(659.25, 0.14, 'sine', 0.055, 0);
    this.playTone(880, 0.2, 'sine', 0.045, 0.065);
    this.playTone(1318.51, 0.22, 'sine', 0.02, 0.11);
  }

  public playTherapeuticMatch(streak = 1): void {
    const base = streak >= 3 ? 587.33 : 523.25; // D5 or C5
    this.playTone(base, 0.18, 'sine', 0.075, 0);
    this.playTone(base * 1.25, 0.22, 'sine', 0.07, 0.065);
    this.playTone(base * 1.5, 0.3, 'triangle', 0.06, 0.13);
    if (streak >= 2) {
      this.playTone(base * 2, 0.34, 'sine', 0.04, 0.19);
    }
  }

  public playAdversePulse(criticalStability = false): void {
    this.playTone(196, 0.18, 'triangle', 0.075, 0, 174.61);
    this.playTone(164.81, 0.28, 'sine', 0.07, 0.1, 146.83);
    if (criticalStability) {
      this.playTone(130.81, 0.32, 'triangle', 0.065, 0.22);
    }
  }

  public playAchievementUnlock(): void {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.32, idx === 3 ? 'triangle' : 'sine', 0.06, idx * 0.075);
    });
  }

  public playShiftVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.38, idx === 3 ? 'triangle' : 'sine', 0.068, idx * 0.085);
    });
  }

  public playShiftDepleted(): void {
    const notes = [392.0, 349.23, 293.66, 261.63];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.3, 'sine', 0.055, idx * 0.1);
    });
  }
}

export const soundEngine = new SoundEngine();
