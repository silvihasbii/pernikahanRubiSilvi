// Audio Player with HTML5 Audio & Web Audio API fallback for romantic ambient wedding melody

class WeddingAudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private playing = false;
  private listeners: ((playing: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';

      this.audioElement.addEventListener('playing', () => this.setPlaying(true));
      this.audioElement.addEventListener('pause', () => this.setPlaying(false));
      this.audioElement.addEventListener('ended', () => this.setPlaying(false));
    }
  }

  public setAudioUrl(url: string) {
    if (this.audioElement && url) {
      this.audioElement.src = url;
    }
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private setPlaying(state: boolean) {
    this.playing = state;
    this.listeners.forEach((cb) => cb(state));
  }

  public async play(): Promise<boolean> {
    if (this.playing) return true;

    // First attempt HTML Audio
    if (this.audioElement && this.audioElement.src) {
      try {
        await this.audioElement.play();
        this.setPlaying(true);
        return true;
      } catch (err) {
        console.warn('Audio tag play failed or blocked, starting synthesized acoustic melody:', err);
      }
    }

    // Fallback to Web Audio Romantic Acoustic Synthesis
    this.startRomanticSynth();
    return true;
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopRomanticSynth();
    this.setPlaying(false);
  }

  public toggle() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  public getIsPlaying(): boolean {
    return this.playing;
  }

  // Romantic acoustic chord progression (Canon in D / Wedding Chords) using Web Audio API
  private startRomanticSynth() {
    if (this.isSynthesizing) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isSynthesizing = true;
      this.setPlaying(true);

      // Chords: D - A - Bm - F#m - G - D - G - A (in Hz)
      const chordProgressions = [
        [293.66, 369.99, 440.0], // D Maj
        [220.0, 277.18, 329.63], // A Maj
        [246.94, 293.66, 369.99], // B min
        [185.0, 220.0, 277.18],  // F# min
        [196.0, 246.94, 293.66], // G Maj
        [293.66, 369.99, 440.0], // D Maj
        [196.0, 246.94, 293.66], // G Maj
        [220.0, 277.18, 329.63], // A Maj
      ];

      let step = 0;
      const playNote = (freq: number, delay: number, dur: number, vol = 0.08) => {
        if (!this.audioCtx || !this.isSynthesizing) return;
        const now = this.audioCtx.currentTime + delay;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle'; // Warm acoustic tone
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + dur + 0.1);
      };

      const triggerArpeggio = () => {
        if (!this.isSynthesizing || !this.audioCtx) return;
        const chord = chordProgressions[step % chordProgressions.length];
        // Arpeggiate note 1, 2, 3, 2
        playNote(chord[0], 0, 1.8, 0.09);
        playNote(chord[1], 0.25, 1.6, 0.07);
        playNote(chord[2], 0.5, 1.6, 0.08);
        playNote(chord[1], 0.75, 1.4, 0.06);
        playNote(chord[2] * 1.5, 1.0, 1.5, 0.05);
        step++;
      };

      triggerArpeggio();
      this.synthInterval = window.setInterval(triggerArpeggio, 1600);
    } catch (e) {
      console.error('Error starting synth audio:', e);
    }
  }

  private stopRomanticSynth() {
    this.isSynthesizing = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

export const weddingAudio = new WeddingAudioManager();
