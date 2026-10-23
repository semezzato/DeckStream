/**
 * OBS Studio Interactive Simulator
 * Allows full offline testing of scenes, audio mixer, streaming and recording controls.
 */

import { OBSStreamState, AudioInputItem } from '../types';

export type SimulatorListener = (state: OBSStreamState) => void;

class OBSSimulator {
  private listeners: Set<SimulatorListener> = new Set();
  private streamTimer: number | null = null;
  private recordTimer: number | null = null;
  private streamSeconds = 0;
  private recordSeconds = 0;
  private statsTimer: number | null = null;

  public state: OBSStreamState = {
    currentProgramScene: '🎮 Gameplay Principal',
    currentPreviewScene: '👤 Facecam Tela Cheia',
    scenes: [
      '🎮 Gameplay Principal',
      '👤 Facecam Tela Cheia',
      '⏳ BRB - Voltamos Já',
      '🚀 Início da Live',
      '👋 Encerramento',
      '🖥️ Compartilhamento de Tela',
    ],
    audioInputs: [
      { name: 'Microfone Principal (Shure SM7B)', volumeDb: -6.2, volumeMul: 0.85, muted: false },
      { name: 'Som do Jogo / Desktop Audio', volumeDb: -12.5, volumeMul: 0.65, muted: false },
      { name: 'Discord Voz (Equipe)', volumeDb: -9.8, volumeMul: 0.75, muted: false },
      { name: 'Spotify Música de Fundo', volumeDb: -22.0, volumeMul: 0.35, muted: false },
      { name: 'Alertas & Soundboard', volumeDb: -4.5, volumeMul: 0.9, muted: false },
    ],
    isStreaming: false,
    isRecording: false,
    streamTimecode: '00:00:00',
    recordTimecode: '00:00:00',
    cpuUsage: 8,
    memoryUsage: 450,
    outputFps: 60,
    connectionState: 'simulator',
  };

  public subscribe(listener: SimulatorListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private update(partial: Partial<OBSStreamState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(fn => fn(this.state));
  }

  public start() {
    this.stop();
    this.update({ connectionState: 'simulator' });
    this.statsTimer = window.setInterval(() => {
      // fluctuate CPU slightly for realism
      const randomCpu = Math.floor(6 + Math.random() * 5);
      const randomFps = Math.floor(59 + Math.random() * 2);
      this.update({
        cpuUsage: randomCpu,
        outputFps: randomFps,
      });
    }, 3000);
  }

  public stop() {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    if (this.streamTimer) {
      clearInterval(this.streamTimer);
      this.streamTimer = null;
    }
    if (this.recordTimer) {
      clearInterval(this.recordTimer);
      this.recordTimer = null;
    }
  }

  private formatTime(totalSecs: number): string {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // --- Actions ---

  public setScene(sceneName: string) {
    if (this.state.scenes.includes(sceneName)) {
      this.update({ currentProgramScene: sceneName });
    }
  }

  public toggleMute(inputName: string): boolean {
    let nowMuted = false;
    const updated = this.state.audioInputs.map(input => {
      if (input.name === inputName) {
        nowMuted = !input.muted;
        return { ...input, muted: nowMuted };
      }
      return input;
    });
    this.update({ audioInputs: updated });
    return nowMuted;
  }

  public setInputVolume(inputName: string, volumeMul: number) {
    const clamped = Math.max(0, Math.min(1, volumeMul));
    const db = clamped === 0 ? -100 : Math.round(20 * Math.log10(clamped) * 10) / 10;
    const updated = this.state.audioInputs.map(input => {
      if (input.name === inputName) {
        return { ...input, volumeMul: clamped, volumeDb: db };
      }
      return input;
    });
    this.update({ audioInputs: updated });
  }

  public toggleStream(): boolean {
    const willStream = !this.state.isStreaming;
    if (willStream) {
      this.streamSeconds = 0;
      this.streamTimer = window.setInterval(() => {
        this.streamSeconds++;
        this.update({ streamTimecode: this.formatTime(this.streamSeconds) });
      }, 1000);
      this.update({ isStreaming: true, streamTimecode: '00:00:00' });
    } else {
      if (this.streamTimer) clearInterval(this.streamTimer);
      this.update({ isStreaming: false, streamTimecode: '00:00:00' });
    }
    return willStream;
  }

  public toggleRecord(): boolean {
    const willRecord = !this.state.isRecording;
    if (willRecord) {
      this.recordSeconds = 0;
      this.recordTimer = window.setInterval(() => {
        this.recordSeconds++;
        this.update({ recordTimecode: this.formatTime(this.recordSeconds) });
      }, 1000);
      this.update({ isRecording: true, recordTimecode: '00:00:00' });
    } else {
      if (this.recordTimer) clearInterval(this.recordTimer);
      this.update({ isRecording: false, recordTimecode: '00:00:00' });
    }
    return willRecord;
  }

  public addScene(name: string) {
    if (!this.state.scenes.includes(name)) {
      this.update({ scenes: [...this.state.scenes, name] });
    }
  }
}

export const obsSimulator = new OBSSimulator();
