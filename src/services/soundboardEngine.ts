/**
 * Soundboard Audio Engine using Web Audio API
 * Generates broadcast-quality synthesized sound effects and handles user custom uploaded clips.
 */

import { SoundboardItem } from '../types';

class SoundboardEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSources: Set<AudioNode> = new Set();
  private decodedBuffers: Map<string, AudioBuffer> = new Map();
  private onPlaybackStateChangeListeners: Set<(soundId: string, isPlaying: boolean) => void> = new Set();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(volume: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public subscribePlayback(listener: (soundId: string, isPlaying: boolean) => void) {
    this.onPlaybackStateChangeListeners.add(listener);
    return () => {
      this.onPlaybackStateChangeListeners.delete(listener);
    };
  }

  private notifyPlayback(soundId: string, isPlaying: boolean) {
    this.onPlaybackStateChangeListeners.forEach(listener => listener(soundId, isPlaying));
  }

  /**
   * Play any Soundboard item
   */
  public async play(item: SoundboardItem): Promise<void> {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.notifyPlayback(item.id, true);

    try {
      if (item.customAudioUrl) {
        await this.playCustomAudio(item);
      } else {
        await this.playSynthesizedSound(item);
      }
    } catch (err) {
      console.warn('Playback error:', err);
    } finally {
      // Small timeout before resetting playing state
      setTimeout(() => {
        this.notifyPlayback(item.id, false);
      }, 800);
    }
  }

  /**
   * Stop all active sounds
   */
  public stopAll() {
    this.activeSources.forEach(source => {
      try {
        if ('stop' in source && typeof (source as AudioScheduledSourceNode).stop === 'function') {
          (source as AudioScheduledSourceNode).stop();
        }
      } catch {
        // ignore already stopped
      }
    });
    this.activeSources.clear();
  }

  /**
   * Decode and play custom audio file uploaded by streamer
   */
  public async loadCustomAudio(id: string, base64OrUrl: string): Promise<boolean> {
    this.initContext();
    if (!this.ctx) return false;
    try {
      const response = await fetch(base64OrUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.decodedBuffers.set(id, buffer);
      return true;
    } catch (err) {
      console.error('Failed to decode custom audio:', err);
      return false;
    }
  }

  private async playCustomAudio(item: SoundboardItem) {
    if (!this.ctx || !this.masterGain || !item.customAudioUrl) return;

    let buffer = this.decodedBuffers.get(item.id);
    if (!buffer) {
      await this.loadCustomAudio(item.id, item.customAudioUrl);
      buffer = this.decodedBuffers.get(item.id);
    }

    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const itemGain = this.ctx.createGain();
    itemGain.gain.setValueAtTime(item.volume ?? 1, this.ctx.currentTime);

    source.connect(itemGain);
    itemGain.connect(this.masterGain);

    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
      this.notifyPlayback(item.id, false);
    };

    source.start();
  }

  /**
   * Web Audio API Synthesized broadcast effects (zero latency, zero network requirement)
   */
  private playSynthesizedSound(item: SoundboardItem) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    const itemVol = item.volume ?? 1;
    gainNode.gain.setValueAtTime(itemVol, now);
    gainNode.connect(this.masterGain);

    switch (item.builtInType) {
      case 'airhorn':
        this.synthAirhorn(now, gainNode);
        break;
      case 'rimshot':
        this.synthRimshot(now, gainNode);
        break;
      case 'applause':
        this.synthApplause(now, gainNode);
        break;
      case 'laugh':
        this.synthLaugh(now, gainNode);
        break;
      case 'victory':
        this.synthVictory(now, gainNode);
        break;
      case 'gameover':
        this.synthGameOver(now, gainNode);
        break;
      case 'tension':
        this.synthTension(now, gainNode);
        break;
      case 'bell':
        this.synthBell(now, gainNode);
        break;
      case 'buzzer':
        this.synthBuzzer(now, gainNode);
        break;
      default:
        this.synthBell(now, gainNode);
        break;
    }
  }

  /**
   * Broadcast DJ Airhorn
   */
  private synthAirhorn(now: number, dest: GainNode) {
    if (!this.ctx) return;
    const notes = [
      { start: 0, dur: 0.14 },
      { start: 0.17, dur: 0.14 },
      { start: 0.35, dur: 0.45 },
    ];

    notes.forEach(hit => {
      const frequencies = [466.16, 587.33, 698.46]; // Bb, D, F major triad
      frequencies.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + hit.start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.03, now + hit.start + hit.dur);

        gain.gain.setValueAtTime(0, now + hit.start);
        gain.gain.linearRampToValueAtTime(0.25, now + hit.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + hit.start + hit.dur);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + hit.start);
        osc.stop(now + hit.start + hit.dur);
      });
    });
  }

  /**
   * Ba-Dum-Tss (Rimshot)
   */
  private synthRimshot(now: number, dest: GainNode) {
    if (!this.ctx) return;

    // "Ba" (Kick 1)
    const kick1 = this.ctx.createOscillator();
    const kick1Gain = this.ctx.createGain();
    kick1.frequency.setValueAtTime(120, now);
    kick1.frequency.exponentialRampToValueAtTime(45, now + 0.1);
    kick1Gain.gain.setValueAtTime(0.7, now);
    kick1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    kick1.connect(kick1Gain);
    kick1Gain.connect(dest);
    kick1.start(now);
    kick1.stop(now + 0.1);

    // "Dum" (Kick 2)
    const kick2 = this.ctx.createOscillator();
    const kick2Gain = this.ctx.createGain();
    kick2.frequency.setValueAtTime(140, now + 0.16);
    kick2.frequency.exponentialRampToValueAtTime(50, now + 0.28);
    kick2Gain.gain.setValueAtTime(0.8, now + 0.16);
    kick2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    kick2.connect(kick2Gain);
    kick2Gain.connect(dest);
    kick2.start(now + 0.16);
    kick2.stop(now + 0.28);

    // "Tss" (Snare + Crash splash)
    const bufferSize = this.ctx.sampleRate * 0.45;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3500, now + 0.34);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now + 0.34);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now + 0.34);
    noise.stop(now + 0.75);
  }

  /**
   * Crowd Applause / Clapping burst
   */
  private synthApplause(now: number, dest: GainNode) {
    if (!this.ctx) return;
    const dur = 1.6;
    const bufferSize = this.ctx.sampleRate * dur;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (0.8 + 0.2 * Math.sin(i / 100));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(now);
    noise.stop(now + dur);
  }

  /**
   * Sitcom / Cartoon Laugh chuckle
   */
  private synthLaugh(now: number, dest: GainNode) {
    if (!this.ctx) return;
    const chuckles = [0, 0.12, 0.24, 0.36, 0.48, 0.62, 0.78];
    chuckles.forEach((t, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      const baseFreq = 340 + (i % 2 === 0 ? 40 : -20);
      osc.frequency.setValueAtTime(baseFreq, now + t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + t + 0.08);

      gain.gain.setValueAtTime(0.4, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.09);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + t);
      osc.stop(now + t + 0.09);
    });
  }

  /**
   * Victory / Level Up fanfare
   */
  private synthVictory(now: number, dest: GainNode) {
    if (!this.ctx) return;
    const melody = [
      { freq: 523.25, time: 0, dur: 0.12 },     // C5
      { freq: 659.25, time: 0.12, dur: 0.12 },  // E5
      { freq: 783.99, time: 0.24, dur: 0.12 },  // G5
      { freq: 1046.50, time: 0.36, dur: 0.45 }, // C6
    ];

    melody.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.25, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  }

  /**
   * Game Over / Fail descending synth
   */
  private synthGameOver(now: number, dest: GainNode) {
    if (!this.ctx) return;
    const notes = [
      { freq: 392.00, time: 0, dur: 0.18 },    // G4
      { freq: 369.99, time: 0.18, dur: 0.18 }, // F#4
      { freq: 349.23, time: 0.36, dur: 0.18 }, // F4
      { freq: 311.13, time: 0.54, dur: 0.6 },  // Eb4
    ];

    notes.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.3, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  }

  /**
   * Dramatic Tension Horn / Bass Drop
   */
  private synthTension(now: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 1.4);
  }

  /**
   * Donation Bell Chime
   */
  private synthBell(now: number, dest: GainNode) {
    if (!this.ctx) return;
    const freqs = [1760, 2637, 3520]; // A6 harmonics
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.3 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 1.1);
    });
  }

  /**
   * Error Buzzer
   */
  private synthBuzzer(now: number, dest: GainNode) {
    if (!this.ctx) return;
    [130, 138].forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.setValueAtTime(0.35, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }
}

export const soundEngine = new SoundboardEngine();
