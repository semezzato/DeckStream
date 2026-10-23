/**
 * Minimalist Header Navigation Bar with Frosted Glass Icon Dock
 * Features rounded frosted dock with tactile icons (Deck, Mixer, Soundboard, Settings)
 * and intelligent Plug-and-Play connection status badge.
 */

import React from 'react';
import { useOBS } from '../context/OBSContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Laptop,
  Maximize2,
  Minimize2,
  Download,
  ChevronDown,
  LayoutGrid,
  SlidersHorizontal,
  Disc3,
  Settings2,
  Usb,
  Wifi,
  Zap,
  RefreshCw,
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
  isWakeLockActive: boolean;
  onToggleWakeLock: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  onOpenConnectionModal,
  isInstallable,
  onInstall,
  isFullscreen,
  onToggleFullscreen,
  isWakeLockActive,
  onToggleWakeLock,
}) => {
  const {
    streamState,
    profiles,
    activeProfileId,
    switchProfile,
    currentlyPlayingSoundId,
    connectionConfig,
    isAutoScanning,
  } = useOBS();
  const { themeMode, cycleTheme } = useTheme();

  const getStatusDot = () => {
    if (isAutoScanning) return 'bg-cyan-400 animate-ping';
    switch (streamState.connectionState) {
      case 'simulator':
        return 'bg-amber-400';
      case 'connected':
        return 'bg-emerald-400';
      case 'connecting':
        return 'bg-blue-400 animate-ping';
      case 'error':
        return 'bg-rose-400';
      default:
        return 'bg-zinc-400';
    }
  };

  const getStatusLabel = () => {
    if (isAutoScanning) return 'Escaneando...';
    switch (streamState.connectionState) {
      case 'simulator':
        return 'Simulador';
      case 'connected':
        return connectionConfig.host.includes('localhost') || connectionConfig.host.includes('127.0.0.1')
          ? 'USB Plug & Play'
          : 'OBS Wi-Fi';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro';
      default:
        return 'Plug & Play';
    }
  };

  const getConnectionIcon = () => {
    if (isAutoScanning) return <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />;
    if (connectionConfig.isSimulator) return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    if (connectionConfig.host.includes('localhost') || connectionConfig.host.includes('127.0.0.1')) {
      return <Usb className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <Wifi className="w-3.5 h-3.5 text-blue-400" />;
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-1.5 bg-white/80 dark:bg-[#090a0f]/85 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/[0.06] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Left: Brand Wordmark + Quick Profile Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-xs sm:text-sm font-extrabold tracking-tight text-zinc-950 dark:text-white whitespace-nowrap">
          Deck<span className="text-blue-500">Stream</span>
        </span>

        {/* Quick Profile Dropdown */}
        <div className="relative flex items-center">
          <select
            value={activeProfileId}
            onChange={e => switchProfile(e.target.value)}
            className="text-[11px] sm:text-xs font-semibold bg-zinc-100/90 dark:bg-white/[0.06] border border-zinc-200/80 dark:border-white/[0.08] rounded-lg py-1 pl-1.5 sm:pl-2 pr-5 text-zinc-800 dark:text-zinc-200 cursor-pointer appearance-none focus:outline-none focus:border-blue-500 transition-colors max-w-[110px] sm:max-w-none truncate"
            title="Alternar Perfil do Deck"
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 pointer-events-none" />
        </div>
      </div>

      {/* Middle: Frosted Glass Rounded Dock Navigation */}
      <nav
        aria-label="Navegação Principal"
        className="flex items-center p-0.5 sm:p-1 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-300/40 dark:border-white/10 shadow-sm shadow-black/5"
      >
        {/* Deck Tab */}
        <button
          type="button"
          onClick={() => onTabChange('deck')}
          title="Deck Principal (Botões e Cenas)"
          aria-label="Deck Principal"
          className={`relative p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'deck'
              ? 'bg-white dark:bg-white/15 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 scale-105 border border-black/5 dark:border-white/15'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
          }`}
        >
          <LayoutGrid className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          {activeTab === 'deck' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
          )}
        </button>

        {/* Mixer Tab */}
        <button
          type="button"
          onClick={() => onTabChange('mixer')}
          title="Mixer de Áudio (Canais e Níveis)"
          aria-label="Mixer de Áudio"
          className={`relative p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'mixer'
              ? 'bg-white dark:bg-white/15 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 scale-105 border border-black/5 dark:border-white/10'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          {activeTab === 'mixer' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
          )}
        </button>

        {/* Soundboard Tab */}
        <button
          type="button"
          onClick={() => onTabChange('soundboard')}
          title="Soundboard (Efeitos e Vinhetas)"
          aria-label="Soundboard"
          className={`relative p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'soundboard'
              ? 'bg-white dark:bg-white/15 text-amber-500 dark:text-amber-400 shadow-md shadow-amber-500/10 scale-105 border border-black/5 dark:border-white/15'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
          }`}
        >
          <Disc3 className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${currentlyPlayingSoundId ? 'animate-spin text-amber-500' : ''}`} />
          {currentlyPlayingSoundId && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
          {activeTab === 'soundboard' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-amber-500 shadow-sm shadow-amber-400" />
          )}
        </button>

        {/* Config / Settings Tab */}
        <button
          type="button"
          onClick={() => onTabChange('config')}
          title="Ajustes e Conexões"
          aria-label="Ajustes e Conexões"
          className={`relative p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'config'
              ? 'bg-white dark:bg-white/15 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 scale-105 border border-black/5 dark:border-white/10'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
          }`}
        >
          <Settings2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          {activeTab === 'config' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
          )}
        </button>
      </nav>

      {/* Right: Theme Toggle + Plug & Play Status + Screen controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Connection status button */}
        <button
          onClick={onOpenConnectionModal}
          className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium bg-zinc-100/90 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/[0.08] hover:bg-zinc-200 dark:hover:bg-white/[0.1] transition-all cursor-pointer text-zinc-800 dark:text-zinc-200"
          title="Central de Conexão Automática Plug & Play"
        >
          {getConnectionIcon()}
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot()}`} />
          <span className="hidden md:inline font-semibold">{getStatusLabel()}</span>
        </button>

        {/* Theme Toggle (Dark / Light / System) */}
        <button
          onClick={cycleTheme}
          title={`Tema atual: ${themeMode === 'system' ? 'Sistema Android' : themeMode === 'dark' ? 'Escuro' : 'Claro'}`}
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          {themeMode === 'dark' && <Moon className="w-4 h-4 text-purple-400" />}
          {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
          {themeMode === 'system' && <Laptop className="w-4 h-4 text-blue-500" />}
        </button>

        {/* Wake Lock Screen Android Toggle */}
        <button
          onClick={onToggleWakeLock}
          title={isWakeLockActive ? 'Tela sempre ligada (Ativado)' : 'Manter tela ligada'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isWakeLockActive
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
          }`}
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* PWA Install */}
        {isInstallable && (
          <button
            onClick={onInstall}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
        )}
      </div>
    </header>
  );
};
