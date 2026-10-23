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
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-zinc-50 dark:bg-[#07080c] space-y-4 max-w-5xl mx-auto w-full text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-950 dark:text-white tracking-tight">Mixer de Áudio</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Controles limpos e responsivos de canais do OBS</p>
          </div>
        </div>

        {/* Global Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMuteAll}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              allMuted
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-zinc-200 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-white hover:bg-zinc-300 dark:hover:bg-white/10'
            }`}
            title="Alternar mudo de todos os canais"
          >
            {allMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{allMuted ? 'Desmutar Todos' : 'Mutar Todos'}</span>
          </button>

          <button
            onClick={handleResetAllToZeroDb}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-200 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            title="Resetar todos os canais para 100% (0 dB)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 0 dB</span>
          </button>
        </div>
      </div>

      {/* Modern Audio Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {streamState.audioInputs.map(input => {
          const percentage = Math.round(input.volumeMul * 100);
          const isMuted = input.muted;

          return (
            <div
              key={input.name}
              className={`rounded-2xl border p-4 bg-white dark:bg-white/[0.02] transition-all space-y-3.5 shadow-xs ${
                isMuted
                  ? 'border-rose-300/60 dark:border-rose-900/40 bg-rose-500/[0.02]'
                  : 'border-zinc-200 dark:border-white/[0.06]'
              }`}
            >
              {/* Channel Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/[0.05] flex items-center justify-center shrink-0">
                    {getInputIcon(input.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={input.name}>
                      {input.name}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {percentage}% · {formatDb(input.volumeMul, input.volumeDb)}
                    </span>
                  </div>
                </div>

                {/* Mute Toggle */}
                <button
                  type="button"
                  onClick={() => toggleMute(input.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isMuted
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                  <span>{isMuted ? 'MUDO' : 'ATIVO'}</span>
                </button>
              </div>

              {/* Clean Range Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={percentage}
                  disabled={isMuted}
                  onChange={e => handleSliderChange(input.name, Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 disabled:opacity-30"
                  title={`${input.name}: ${percentage}%`}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-white/[0.04]">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Atalhos</span>
                <div className="flex items-center gap-1.5">
                  {[0, 50, 75, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      disabled={isMuted}
                      onClick={() => handleSliderChange(input.name, val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer disabled:opacity-30 ${
                        percentage === val
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
