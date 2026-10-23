/**
 * DeckStream OBS - Main Application Entrypoint
 * Touch Stream Deck Controller for Android & Web Studio
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { OBSProvider } from './context/OBSContext';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { MobileDeck } from './components/MobileDeck';
import { AudioMixer } from './components/AudioMixer';
import { SoundboardView } from './components/SoundboardView';
import { GridConfigView } from './components/GridConfigView';
import { ConnectionModal } from './components/ConnectionModal';
import { usePWA } from './hooks/usePWA';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('deck');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  const {
    isInstallable,
    install,
    isFullscreen,
    toggleFullscreen,
    isWakeLockActive,
    toggleWakeLock,
    triggerHaptic,
  } = usePWA();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#07080c] text-zinc-900 dark:text-slate-100 select-none transition-colors">
      {/* 3-Zone Top Navigation Contract with Theme and Profile controls */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        isInstallable={isInstallable}
        onInstall={install}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isWakeLockActive={isWakeLockActive}
        onToggleWakeLock={toggleWakeLock}
      />

      {/* Main Tab Panels */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === 'deck' && (
          <MobileDeck
            onTriggerHaptic={triggerHaptic}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        )}
        {activeTab === 'mixer' && <AudioMixer />}
        {activeTab === 'soundboard' && <SoundboardView />}
        {activeTab === 'config' && (
          <GridConfigView onOpenConnectionModal={() => setIsConnectionModalOpen(true)} />
        )}
      </main>

      {/* Intelligent 3-Point Connection Assistant Modal */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <OBSProvider>
        <MainContent />
      </OBSProvider>
    </ThemeProvider>
  );
}
