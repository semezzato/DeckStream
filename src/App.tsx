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
import { LandingPage } from './components/LandingPage';
import { PrivacyPage } from './components/PrivacyPage';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('deck');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(() =>
    new URLSearchParams(window.location.search).get('connect') === '1'
  );

  const {
    isInstallable,
    install,
    isFullscreen,
    toggleFullscreen,
    isWakeLockActive,
    isWakeLockSupported,
    toggleWakeLock,
    triggerHaptic,
  } = usePWA();

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab !== 'deck') setIsEditMode(false);
  };

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-zinc-50 text-zinc-900 transition-colors dark:bg-[#07080c] dark:text-slate-100">
      {/* Header keeps global identity and the OBS connection status. */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        isInstallable={isInstallable}
        onInstall={install}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(mode => !mode)}
      />

      {/* Main Tab Panels */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'deck' && (
          <MobileDeck
            onTriggerHaptic={triggerHaptic}
            isEditMode={isEditMode}
          />
        )}
        {activeTab === 'mixer' && <AudioMixer />}
        {activeTab === 'soundboard' && <SoundboardView />}
        {activeTab === 'config' && (
          <GridConfigView
            onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
            isWakeLockActive={isWakeLockActive}
            isWakeLockSupported={isWakeLockSupported}
            onToggleWakeLock={toggleWakeLock}
          />
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
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (currentPath === '/privacidade') return <PrivacyPage />;
  if (currentPath !== '/app') return <LandingPage />;

  return (
    <ThemeProvider>
      <OBSProvider>
        <MainContent />
      </OBSProvider>
    </ThemeProvider>
  );
}
