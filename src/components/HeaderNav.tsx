/**
 * Responsive navigation and deck controls. The primary destinations stay in
 * the header; frequent page switching is direct and setup actions are grouped.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useOBS } from '../context/OBSContext';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Disc,
  Download,
  Edit2,
  Layers3,
  LayoutGrid,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Radio,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Usb,
  Wifi,
  Zap,
  Disc3,
} from 'lucide-react';

export type ActiveTab = 'deck' | 'mixer' | 'soundboard' | 'config';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenConnectionModal: () => void;
  isInstallable: boolean;
  onInstall: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

const NAV_ITEMS = [
  { id: 'deck', label: 'Deck', icon: LayoutGrid },
  { id: 'mixer', label: 'Mixer', icon: SlidersHorizontal },
  { id: 'soundboard', label: 'Sons', icon: Disc3 },
  { id: 'config', label: 'Ajustes', icon: Settings2 },
] as const satisfies ReadonlyArray<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }>;

const tabClass = (isActive: boolean) =>
  `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transform-none motion-reduce:transition-none md:flex-none md:flex-row md:gap-2 md:rounded-xl md:px-3 md:text-xs ${
    isActive
      ? 'border border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:border-blue-500 dark:bg-blue-500'
      : 'border border-transparent text-zinc-600 hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
  }`;

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  onOpenConnectionModal,
  isInstallable,
  onInstall,
  isFullscreen,
  onToggleFullscreen,
  isEditMode,
  onToggleEditMode,
}) => {
  const {
    streamState,
    connectionConfig,
    isAutoScanning,
    profiles,
    activeProfileId,
    switchProfile,
    gridConfig,
    setCurrentPage,
  } = useOBS();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const actionsTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isActionsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) setIsActionsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionsOpen(false);
        actionsTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActionsOpen]);

  useEffect(() => {
    if (activeTab !== 'deck') setIsActionsOpen(false);
  }, [activeTab]);

  const getStatusLabel = () => {
    if (isAutoScanning) return 'Escaneando';
    switch (streamState.connectionState) {
      case 'simulator': return 'Simulador';
      case 'connected':
        return connectionConfig.host.includes('localhost') || connectionConfig.host.includes('127.0.0.1')
          ? 'Conectado via USB'
          : 'Conectado via Wi-Fi';
      case 'connecting': return 'Conectando';
      case 'error': return 'Erro de conexão';
      default: return 'Conectar ao OBS';
    }
  };

  const getStatusDotClass = () => {
    if (isAutoScanning || streamState.connectionState === 'connecting') return 'bg-cyan-400 animate-pulse motion-reduce:animate-none';
    switch (streamState.connectionState) {
      case 'simulator': return 'bg-amber-400';
      case 'connected': return 'bg-emerald-400';
      case 'error': return 'bg-rose-400';
      default: return 'bg-zinc-400';
    }
  };

  const getConnectionIcon = () => {
    if (isAutoScanning) return <RefreshCw aria-hidden="true" className="h-4 w-4 animate-spin text-cyan-500 motion-reduce:animate-none" />;
    if (connectionConfig.isSimulator) return <Zap aria-hidden="true" className="h-4 w-4 text-amber-500" />;
    if (connectionConfig.host.includes('localhost') || connectionConfig.host.includes('127.0.0.1')) {
      return <Usb aria-hidden="true" className="h-4 w-4 text-emerald-500" />;
    }
    return <Wifi aria-hidden="true" className="h-4 w-4 text-blue-500" />;
  };

  const showDeckPages = activeTab === 'deck' && gridConfig.totalPages > 1;

  return (
    <header className={`app-header sticky top-0 z-30 grid shrink-0 ${showDeckPages ? 'grid-cols-[6.75rem_1fr_auto] grid-rows-[2.75rem_2.75rem]' : 'grid-cols-[2rem_1fr_auto] grid-rows-[2.25rem_2.75rem]'} items-center gap-x-2 gap-y-1 border-b border-zinc-200/80 bg-white/95 px-2 py-1 text-zinc-900 backdrop-blur-xl transition-colors dark:border-white/[0.06] dark:bg-[#090a0f]/95 dark:text-zinc-100 md:flex md:h-14 md:justify-between md:gap-3 md:px-4 md:py-1.5`}>
      {showDeckPages ? (
        <div role="group" aria-label="Páginas do Deck" className="col-start-1 row-start-1 flex h-11 shrink-0 items-center gap-0 md:shrink-0">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, gridConfig.currentPage - 1))}
            disabled={gridConfig.currentPage === 1}
            aria-label="Página anterior do Deck"
            title="Página anterior"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <span aria-label={`Página ${gridConfig.currentPage} de ${gridConfig.totalPages}`} className="min-w-5 text-center text-[10px] font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
            {gridConfig.currentPage}/{gridConfig.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(gridConfig.totalPages, gridConfig.currentPage + 1))}
            disabled={gridConfig.currentPage === gridConfig.totalPages}
            aria-label="Próxima página do Deck"
            title="Próxima página"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div role="img" aria-label="DeckStream" title="DeckStream" className="col-start-1 row-start-1 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-600/25 md:shrink-0">
          <Layers3 aria-hidden="true" className="h-4 w-4" />
        </div>
      )}

      <nav aria-label="Navegação principal" className="col-span-3 row-start-2 flex min-w-0 items-center justify-between gap-0.5 rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-0.5 dark:border-white/[0.08] dark:bg-zinc-900/70 md:col-span-1 md:row-auto md:mx-auto md:flex-1 md:justify-center md:gap-1 md:rounded-2xl md:p-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setIsActionsOpen(false);
              onTabChange(id);
            }}
            aria-label={label}
            aria-current={activeTab === id ? 'page' : undefined}
            title={label}
            className={tabClass(activeTab === id)}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="app-header-actions col-start-3 row-start-1 flex min-w-0 shrink-0 items-center justify-self-end gap-1 md:row-auto md:gap-1.5">
        {activeTab === 'deck' && (
          <div ref={actionsRef} className="relative">
            <button
              ref={actionsTriggerRef}
              type="button"
              onClick={() => setIsActionsOpen(open => !open)}
              aria-label={`Ações do Deck${isEditMode ? ', organização ativa' : ''}${isFullscreen ? ', tela cheia ativa' : ''}`}
              aria-expanded={isActionsOpen}
              aria-controls={isActionsOpen ? 'deck-actions-popover' : undefined}
              title="Ações do Deck"
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transform-none motion-reduce:transition-none ${
                isActionsOpen || isFullscreen || isEditMode
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.07]'
              }`}
            >
              <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
            </button>

            {isActionsOpen && (
              <div id="deck-actions-popover" className="absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-1rem)] rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-900 shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-[#11141c] dark:text-white">
                <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Ações do Deck</p>
                <label htmlFor="header-deck-profile" className="mb-1 block px-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">Perfil ativo</label>
                <select
                  id="header-deck-profile"
                  value={activeProfileId}
                  onChange={event => switchProfile(event.target.value)}
                  className="mb-2 h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/[0.05]"
                >
                  {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleFullscreen();
                      setIsActionsOpen(false);
                      actionsTriggerRef.current?.focus();
                    }}
                    aria-pressed={isFullscreen}
                    className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFullscreen ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/10'}`}
                  >
                    {isFullscreen ? <Minimize2 aria-hidden="true" className="h-3.5 w-3.5" /> : <Maximize2 aria-hidden="true" className="h-3.5 w-3.5" />}
                    {isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleEditMode();
                      setIsActionsOpen(false);
                      actionsTriggerRef.current?.focus();
                    }}
                    aria-pressed={isEditMode}
                    className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isEditMode ? 'bg-amber-500 text-slate-950' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/10'}`}
                  >
                    {isEditMode ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Edit2 aria-hidden="true" className="h-3.5 w-3.5" />}
                    {isEditMode ? 'Concluir' : 'Organizar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(streamState.isStreaming || streamState.isRecording) && (
          <div role="status" aria-live="polite" aria-label="Status da transmissão" className="flex shrink-0 items-center gap-1">
            {streamState.isStreaming && (
              <span title="Transmissão ao vivo" aria-label="Transmissão ao vivo" className="inline-flex h-9 items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 text-[9px] font-extrabold tracking-wide text-rose-700 dark:text-rose-300">
                <Radio aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="stream-state-label">LIVE</span>
              </span>
            )}
            {streamState.isRecording && (
              <span title="Gravação ativa" aria-label="Gravação ativa" className="inline-flex h-9 items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 text-[9px] font-extrabold tracking-wide text-violet-700 dark:text-violet-300">
                <Disc aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="stream-state-label">REC</span>
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onOpenConnectionModal}
          aria-label={`Conexão com OBS: ${getStatusLabel()}. Abrir central de conexão`}
          title={`OBS: ${getStatusLabel()}`}
          className="flex min-h-10 max-w-24 items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100/90 px-2 text-[10px] font-semibold text-zinc-800 transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transform-none motion-reduce:transition-none dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-zinc-200 dark:hover:bg-white/[0.1] md:min-h-11 md:max-w-none md:gap-2 md:px-3 md:text-xs"
        >
          {getConnectionIcon()}
          <span className={`h-2 w-2 shrink-0 rounded-full ${getStatusDotClass()}`} />
          <span className="connection-label truncate">{getStatusLabel()}</span>
        </button>

        {isInstallable && (
          <button
            type="button"
            onClick={onInstall}
            className="hidden min-h-11 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 xl:flex"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            <span>Instalar</span>
          </button>
        )}
      </div>
    </header>
  );
};
