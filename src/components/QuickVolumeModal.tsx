/**
 * Quick Volume Modal
 * Touch-friendly popup triggered by long-press on multimedia deck buttons
 */

import React from 'react';
import { useOBS } from '../context/OBSContext';
import {
  Volume2,
  VolumeX,
  X,
  Mic,
  Music,
  Headphones,
  RotateCcw,
  Check,
} from 'lucide-react';

interface QuickVolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputName: string;
  onTriggerHaptic?: (pattern?: number) => void;
}

export const QuickVolumeModal: React.FC<QuickVolumeModalProps> = ({
  isOpen,
  onClose,
  inputName,
  onTriggerHaptic,
}) => {
  const { streamState, setVolume, toggleMute } = useOBS();

  if (!isOpen) return null;

  const audioInput = streamState.audioInputs.find(i => i.name === inputName);

  // Fallback if audio input is not found
  const volumeMul = audioInput?.volumeMul ?? 1.0;
  const volumePercent = Math.round(volumeMul * 100);
  const isMuted = audioInput?.muted ?? false;

  const formatDb = (mul: number, dbValue?: number) => {
    if (mul <= 0.001) return '-inf dB';
    if (typeof dbValue === 'number' && !isNaN(dbValue)) {
      return `${dbValue.toFixed(1)} dB`;
    }
    const calculated = 20 * Math.log10(mul);
    return `${calculated.toFixed(1)} dB`;
  };

  const getInputIcon = () => {
    const lower = inputName.toLowerCase();
    if (lower.includes('mic') || lower.includes('microfone')) {
      return <Mic className="w-5 h-5 text-rose-500" />;
    }
    if (lower.includes('discord') || lower.includes('voz')) {
      return <Headphones className="w-5 h-5 text-cyan-500" />;
    }
    if (lower.includes('spot') || lower.includes('música') || lower.includes('music')) {
      return <Music className="w-5 h-5 text-purple-500" />;
    }
    return <Volume2 className="w-5 h-5 text-emerald-500" />;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const mul = Math.max(0, Math.min(1, val / 100));
    setVolume(inputName, mul);
  };

  const handlePreset = (pct: number) => {
    onTriggerHaptic?.(15);
    const mul = pct / 100;
    setVolume(inputName, mul);
  };

  const handleToggleMute = async () => {
    onTriggerHaptic?.(25);
    await toggleMute(inputName);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="quick-volume-title" className="my-auto w-full max-w-sm max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white dark:bg-[#11131a] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-5 text-zinc-900 dark:text-zinc-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 flex items-center justify-center shrink-0">
              {getInputIcon()}
            </div>
            <div className="min-w-0">
              <h3 id="quick-volume-title" className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {inputName}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Ajuste Rápido de Volume
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar ajuste de volume"
            className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Volume Percentage & dB Display */}
        <div className="flex items-baseline justify-between bg-zinc-50 dark:bg-black/30 border border-zinc-200/80 dark:border-white/[0.06] rounded-xl px-4 py-3">
          <div>
            <span className="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-zinc-900 dark:text-white">
              {volumePercent}%
            </span>
            <span className="text-xs text-zinc-500 ml-1.5 font-medium">nível</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatDb(volumeMul, audioInput?.volumeDb)}
            </span>
          </div>
        </div>

        {/* Main Touch Slider */}
        <div className="space-y-2">
          <div className="flex h-11 items-center">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volumePercent}
              onChange={handleSliderChange}
              className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-400 px-1">
            <span>0% (-inf)</span>
            <span>50% (-6 dB)</span>
            <span>100% (0 dB)</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Predefinições Rápidas
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePreset(pct)}
                className={`min-h-11 rounded-lg text-xs font-semibold font-mono border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  volumePercent === pct
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Mute Toggle & Reset 0dB */}
        <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={handleToggleMute}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 font-semibold text-xs transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isMuted
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4" />
                Desmutar
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Canal Ativo
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handlePreset(100)}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-3 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-400 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Resetar para 100% (0 dB)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            0 dB
          </button>
        </div>
      </div>
    </div>
  );
};
