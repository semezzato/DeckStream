/**
 * Modern Digital Audio Mixer (Mixer de Áudio do OBS)
 * Clean, minimalist, and lightweight channel strips with instant mute toggles and decibel readouts.
 */

import React from 'react';
import { useOBS } from '../context/OBSContext';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Mic,
  Music,
  Headphones,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';

export const AudioMixer: React.FC = () => {
  const { streamState, toggleMute, setVolume } = useOBS();

  const handleSliderChange = (inputName: string, value: number) => {
    const mul = value / 100;
    setVolume(inputName, mul);
  };

  const formatDb = (mul: number, dbValue?: number) => {
    if (mul <= 0.001) return '-inf dB';
    if (typeof dbValue === 'number' && !isNaN(dbValue)) {
      return `${dbValue.toFixed(1)} dB`;
    }
    const calculated = 20 * Math.log10(mul);
    return `${calculated.toFixed(1)} dB`;
  };

  const getInputIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mic') || lower.includes('microfone')) {
      return <Mic className="w-4 h-4 text-rose-500" />;
    }
    if (lower.includes('discord') || lower.includes('voz')) {
      return <Headphones className="w-4 h-4 text-cyan-500" />;
    }
    if (lower.includes('spot') || lower.includes('música') || lower.includes('music')) {
      return <Music className="w-4 h-4 text-purple-500" />;
    }
    if (lower.includes('alert') || lower.includes('soundboard')) {
      return <Bell className="w-4 h-4 text-amber-500" />;
    }
    return <Volume2 className="w-4 h-4 text-blue-500" />;
  };

  const allMuted = streamState.audioInputs.length > 0 && streamState.audioInputs.every(i => i.muted);

  const handleToggleMuteAll = async () => {
    const shouldMute = !allMuted;
    for (const input of streamState.audioInputs) {
      if (input.muted !== shouldMute) {
        await toggleMute(input.name);
      }
    }
  };

  const handleResetAllToZeroDb = async () => {
    for (const input of streamState.audioInputs) {
      await setVolume(input.name, 1.0);
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-hidden bg-zinc-50 p-2 text-zinc-900 transition-colors dark:bg-[#07080c] dark:text-zinc-100 sm:p-3">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 pb-2 dark:border-white/[0.06]">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">Mixer</h1>
            <p className="hidden text-[11px] text-zinc-500 dark:text-zinc-400 sm:block">Áudio do OBS</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={handleToggleMuteAll}
            className={`flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3 ${
              allMuted
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-200 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-white hover:bg-zinc-300 dark:hover:bg-white/10'
            }`}
            title="Alternar mudo de todos os canais"
            aria-label={allMuted ? 'Desmutar todos os canais' : 'Mutar todos os canais'}
          >
            {allMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{allMuted ? 'Desmutar' : 'Mutar'}<span className="hidden sm:inline"> todos</span></span>
          </button>

          <button
            onClick={handleResetAllToZeroDb}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-zinc-200 px-2.5 text-xs font-semibold text-zinc-700 cursor-pointer hover:text-zinc-900 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3"
            title="Resetar todos os canais para 100% (0 dB)"
            aria-label="Resetar todos os canais para zero decibéis"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>0 dB</span>
          </button>
        </div>
      </div>

      <div className="mixer-channel-grid grid min-h-0 flex-1 auto-rows-[minmax(12rem,1fr)] content-start gap-2 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        {streamState.audioInputs.map(input => {
          const percentage = Math.round(input.volumeMul * 100);
          const isMuted = input.muted;

          return (
            <div
              key={input.name}
              className={`flex min-h-0 flex-col rounded-xl border p-2.5 transition-colors ${
                isMuted
                  ? 'border-rose-300/60 dark:border-rose-900/40 bg-rose-500/[0.02]'
                  : 'border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]'
              }`}
            >
              <div className="flex min-w-0 items-center justify-between gap-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.05]">
                    {getInputIcon(input.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold text-zinc-900 dark:text-white" title={input.name}>
                      {input.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleMute(input.name)}
                  className={`flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-[10px] font-bold font-mono transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isMuted
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                  }`}
                  aria-label={`${isMuted ? 'Desmutar' : 'Mutar'} ${input.name}`}
                  aria-pressed={isMuted}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isMuted ? 'bg-white' : 'bg-emerald-500'}`} />
                  <span>{isMuted ? 'MUDO' : 'ON'}</span>
                </button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center py-2">
                <div className="flex h-full min-h-24 w-full flex-col items-center justify-between rounded-xl border border-white/[0.06] bg-[#212121] px-2 py-2.5 text-white shadow-inner">
                  <span className="font-mono text-sm font-bold tabular-nums">{percentage}%</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={percentage}
                    disabled={isMuted}
                    onChange={e => handleSliderChange(input.name, Number(e.target.value))}
                    className="mixer-uiverse-fader min-h-16 w-[50px] flex-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ '--volume-level': `${percentage}%` } as React.CSSProperties}
                    title={`${input.name}: ${percentage}%`}
                    aria-label={`Volume de ${input.name}`}
                  />
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-[10px] font-mono tabular-nums">{formatDb(input.volumeMul, input.volumeDb)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {streamState.audioInputs.length === 0 && (
          <div className="col-span-full flex min-h-32 items-center justify-center rounded-xl border border-dashed border-zinc-300 px-4 text-center text-sm text-zinc-500 dark:border-white/[0.1] dark:text-zinc-400">
            Nenhuma fonte de áudio disponível no OBS.
          </div>
        )}
      </div>
    </div>
  );
};
