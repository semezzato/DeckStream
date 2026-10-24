/**
 * Minimalist Soundboard View
 * Clean audio pads, instant trigger, file upload and category navigation with dark/light theme support.
 */

import React, { useState, useRef } from 'react';
import { useOBS } from '../context/OBSContext';
import { SoundboardItem } from '../types';
import { IconRenderer } from './IconRenderer';
import {
  Square,
  Upload,
  Trash2,
  Sparkles,
  Volume2,
} from 'lucide-react';

export const SoundboardView: React.FC = () => {
  const {
    soundboardItems,
    currentlyPlayingSoundId,
    soundboardMasterVolume,
    setSoundboardMasterVolume,
    playSound,
    stopAllSounds,
    addSoundboardItem,
    deleteSoundboardItem,
  } = useOBS();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [newSoundName, setNewSoundName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = soundboardItems.filter(item => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const newItem: SoundboardItem = {
        id: `custom_${Date.now()}`,
        name: newSoundName.trim() || file.name.replace(/\.[^/.]+$/, ''),
        category: 'custom',
        color: 'purple',
        icon: 'Music',
        volume: 0.9,
        customAudioUrl: base64Data,
      };
      addSoundboardItem(newItem);
      setIsUploading(false);
      setNewSoundName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const soundboardVolPercent = Math.round(soundboardMasterVolume * 100);

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-zinc-50 dark:bg-[#07080c] space-y-4 max-w-5xl mx-auto w-full text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-3 gap-3">
        <div>
          <h1 className="text-sm font-bold text-zinc-950 dark:text-white tracking-tight">Soundboard</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Disparo instantâneo de efeitos sonoros</p>
        </div>

        {/* Master Volume Slider & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Soundboard Master Volume */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.08]">
            <Volume2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={soundboardVolPercent}
              onChange={e => setSoundboardMasterVolume(Number(e.target.value) / 100)}
              className="w-20 sm:w-28 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              title={`Volume do Soundboard: ${soundboardVolPercent}%`}
            />
            <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300 min-w-[32px] tabular-nums text-right">
              {soundboardVolPercent}%
            </span>
          </div>

          <button
            onClick={stopAllSounds}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Parar reprodução de todos os sons"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Parar</span>
          </button>

          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Novo Áudio</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'memes', label: 'Memes' },
          { id: 'reactions', label: 'Reações' },
          { id: 'gameplay', label: 'Gameplay' },
          { id: 'custom', label: 'Personalizados' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`min-h-11 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              filterCategory === cat.id
                ? 'bg-purple-600 text-white font-bold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload Custom Audio Drawer */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">Carregar áudio do dispositivo</span>
            <button
              onClick={() => setIsUploading(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newSoundName}
              onChange={e => setNewSoundName(e.target.value)}
              placeholder="Nome do efeito sonoro..."
              className="w-full px-3 py-1.5 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-200 dark:file:bg-white/10 file:text-zinc-800 dark:file:text-white hover:file:bg-zinc-300 dark:hover:file:bg-white/20 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Minimal Sound Pads Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filteredItems.map(item => {
          const isPlaying = currentlyPlayingSoundId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => playSound(item)}
              className={`relative rounded-xl border p-3 flex flex-col items-center justify-center gap-2 select-none cursor-pointer transition-all duration-75 active:scale-[0.96] text-center min-h-[90px] shadow-xs ${
                isPlaying
                  ? 'bg-purple-100 dark:bg-purple-950/50 border-purple-400 text-purple-900 dark:text-purple-100 ring-1 ring-purple-400/30'
                  : 'bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.14] hover:bg-zinc-50 dark:hover:bg-white/[0.04] text-zinc-800 dark:text-zinc-200'
              }`}
            >
              {/* Delete button for custom sound */}
              {item.customAudioUrl && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSoundboardItem(item.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3 h-3" />
                </div>
              )}

              {isPlaying ? (
                <Sparkles className="w-5 h-5 text-purple-500 animate-spin" />
              ) : (
                <IconRenderer name={item.icon || 'Music'} className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              )}

              <span className="text-xs font-semibold tracking-tight truncate w-full px-1">
                {item.name}
              </span>

              {isPlaying && (
                <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                  TOCANDO
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
