/**
 * Minimalist Grid, Theme & Profile Configuration View
 */

import React, { useState } from 'react';
import { useOBS } from '../context/OBSContext';
import { useTheme } from '../context/ThemeContext';
import {
  Plus,
  Trash2,
  Sliders,
  Download,
  Upload,
  Copy,
  Layers,
  Moon,
  Sun,
  Laptop,
  Check,
  Sparkles,
  Monitor,
} from 'lucide-react';

interface GridConfigViewProps {
  onOpenConnectionModal: () => void;
  isWakeLockActive: boolean;
  isWakeLockSupported: boolean;
  onToggleWakeLock: () => void;
}

export const GridConfigView: React.FC<GridConfigViewProps> = ({
  onOpenConnectionModal,
  isWakeLockActive,
  isWakeLockSupported,
  onToggleWakeLock,
}) => {
  const {
    profiles,
    activeProfileId,
    switchProfile,
    createProfile,
    duplicateProfile,
    deleteProfile,
    gridConfig,
    setGridDimensions,
    addPage,
    removePage,
    setCurrentPage,
    buttons,
    resetButtonsToDefault,
  } = useOBS();

  const { themeMode, setThemeMode } = useTheme();

  const [newProfileName, setNewProfileName] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const presets = [
    { label: '3x3', rows: 3, cols: 3 },
    { label: '4x3', rows: 3, cols: 4 },
    { label: '5x3', rows: 3, cols: 5 },
    { label: '4x4', rows: 4, cols: 4 },
    { label: '5x4', rows: 4, cols: 5 },
    { label: '6x5', rows: 5, cols: 6 },
  ];

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    createProfile(newProfileName.trim());
    setNewProfileName('');
  };

  const handleExportBackup = () => {
    const data = {
      profiles,
      activeProfileId,
      timestamp: new Date().toISOString(),
      version: '2.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deckstream_profiles_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.profiles) {
          localStorage.setItem('deckstream_profiles', JSON.stringify(parsed.profiles));
          if (parsed.activeProfileId) {
            localStorage.setItem('deckstream_active_profile_id', parsed.activeProfileId);
          }
          window.location.reload();
        } else {
          setImportStatus('Arquivo inválido: formato não reconhecido');
        }
      } catch {
        setImportStatus('Erro ao ler arquivo JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-zinc-50 dark:bg-[#07080c] space-y-6 max-w-4xl mx-auto w-full text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-3">
        <div>
          <h1 className="text-sm font-bold text-zinc-950 dark:text-white tracking-tight">Ajustes & Gerenciador de Perfis</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Crie múltiplos perfis de transmissão, temas e grade</p>
        </div>

        <button
          onClick={onOpenConnectionModal}
          className="flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white transition-colors hover:bg-blue-500 cursor-pointer shadow-sm shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Central Plug & Play</span>
        </button>
      </div>

      {/* THEME MODE SELECTOR CARD */}
      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
          Aparência do Aplicativo
        </h2>
        <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
          {[
            { id: 'dark', label: 'Escuro (Estúdio)', icon: Moon, desc: 'Ideal para ambientes com pouca luz' },
            { id: 'light', label: 'Claro (Daylight)', icon: Sun, desc: 'Alto contraste para luz do dia' },
            { id: 'system', label: 'Sistema Android', icon: Laptop, desc: 'Sincroniza com o modo do celular' },
          ].map(opt => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setThemeMode(opt.id as any)}
                aria-pressed={isSelected}
                className={`min-h-11 rounded-xl border p-3 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-white/10 border-blue-500 dark:border-white/20 text-zinc-950 dark:text-white ring-1 ring-blue-500/30'
                    : 'bg-zinc-50 dark:bg-black/30 border-zinc-200 dark:border-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-white" />}
                </div>
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5 hidden sm:block">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {isWakeLockSupported && (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            <div>
              <h2 className="text-xs font-bold text-zinc-900 dark:text-white">Tela durante a transmissão</h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Evite que a tela apague enquanto o DeckStream estiver em uso.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleWakeLock}
            aria-pressed={isWakeLockActive}
            className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isWakeLockActive
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-white/[0.08] dark:bg-black/30 dark:text-zinc-300 dark:hover:bg-white/[0.06]'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isWakeLockActive ? 'bg-amber-500' : 'bg-zinc-400'}`} />
            {isWakeLockActive ? 'Tela sempre ligada' : 'Manter tela ligada'}
          </button>
        </div>
      )}

      {/* MULTI-PROFILE MANAGER */}
      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>Perfis de Deck ({profiles.length})</span>
          </h2>
        </div>

        {/* Create Profile input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newProfileName}
            onChange={e => setNewProfileName(e.target.value)}
            placeholder="Novo perfil (ex: Podcast, Música, Edição)..."
            className="min-h-11 flex-1 px-3 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreateProfile}
            className="min-h-11 rounded-lg px-3 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Perfil</span>
          </button>
        </div>

        {/* Profile List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {profiles.map(prof => {
            const isActive = prof.id === activeProfileId;
            return (
              <div
                key={prof.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-500/50 text-zinc-900 dark:text-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-black/30 border-zinc-200 dark:border-white/[0.04] text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => switchProfile(prof.id)}
                  aria-pressed={isActive}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-purple-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <div className="min-w-0">
                    <span className="text-xs font-bold truncate block">{prof.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {prof.gridConfig.rows}x{prof.gridConfig.cols} · {prof.buttons.length} botões
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => duplicateProfile(prof.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title="Duplicar Perfil"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {profiles.length > 1 && (
                    <button
                      onClick={() => deleteProfile(prof.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      title="Excluir Perfil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Dimensions for Active Profile */}
      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
          Dimensões da Grade (Perfil Atual)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Linhas</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">{gridConfig.rows}</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={gridConfig.rows}
              onChange={e => setGridDimensions(Number(e.target.value), gridConfig.cols)}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Colunas</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">{gridConfig.cols}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={gridConfig.cols}
              onChange={e => setGridDimensions(gridConfig.rows, Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Presets rápidos:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => setGridDimensions(p.rows, p.cols)}
                className={`min-h-11 min-w-11 rounded-md px-3 text-xs font-mono font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  gridConfig.rows === p.rows && gridConfig.cols === p.cols
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pages Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Páginas do Deck ({gridConfig.totalPages})
          </h2>
          <button
            onClick={addPage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Página</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: gridConfig.totalPages }, (_, i) => i + 1).map(pageNum => (
            <div
              key={pageNum}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                gridConfig.currentPage === pageNum
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-zinc-50 dark:bg-black/30 border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-400'
              }`}
            >
              <button
                onClick={() => setCurrentPage(pageNum)}
                className="cursor-pointer hover:underline"
              >
                Página {pageNum}
              </button>
              {gridConfig.totalPages > 1 && (
                <button
                  onClick={() => removePage(pageNum)}
                  className="text-zinc-400 hover:text-rose-500 p-0.5 transition-colors"
                  title="Excluir página"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Factory Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] space-y-2.5">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Backup dos Perfis</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Exporte todos os seus perfis, gadgets e botões em um arquivo JSON.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportBackup}
              className="flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.12] text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
            <label className="flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.12] text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
          {importStatus && <p className="text-[11px] text-amber-500 font-medium">{importStatus}</p>}
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] space-y-2.5">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Redefinir Deck</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Restaura os perfis e botões de fábrica originais.
          </p>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetButtonsToDefault();
                  setConfirmReset(false);
                }}
                className="flex-1 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white cursor-pointer"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="py-1.5 px-3 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              Restaurar Padrões de Fábrica
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
