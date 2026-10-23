/**
 * Unified OBS & Stream Deck Context Provider
 * Cleaned of timers and stat monitors; focused on scenes, volume control gadgets, soundboard and profiles.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  DeckButton,
  GridConfig,
  OBSConnectionConfig,
  OBSStreamState,
  SoundboardItem,
  DeckProfile,
  ConnectionDiagnostics,
} from '../types';
import { obsClient } from '../services/obsClient';
import { obsSimulator } from '../services/obsSimulator';
import { soundEngine } from '../services/soundboardEngine';
import { OBSAutoDiscoveryService, ScanTarget, ScanResult } from '../services/obsAutoDiscovery';

interface OBSContextValue {
  connectionConfig: OBSConnectionConfig;
  streamState: OBSStreamState;
  // Profiles
  profiles: DeckProfile[];
  activeProfileId: string;
  activeProfile: DeckProfile;
  switchProfile: (profileId: string) => void;
  createProfile: (name: string, icon?: string) => string;
  renameProfile: (profileId: string, name: string, icon?: string) => void;
  duplicateProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  // Active Profile Grid & Buttons
  gridConfig: GridConfig;
  buttons: DeckButton[];
  setGridDimensions: (rows: number, cols: number) => void;
  setCurrentPage: (page: number) => void;
  addPage: () => void;
  removePage: (page: number) => void;
  saveButton: (button: DeckButton) => void;
  deleteButton: (id: string) => void;
  reorderButtons: (sourceId: string, targetRow: number, targetCol: number) => void;
  resetButtonsToDefault: () => void;
  // Soundboard
  soundboardItems: SoundboardItem[];
  currentlyPlayingSoundId: string | null;
  soundboardMasterVolume: number;
  setSoundboardMasterVolume: (vol: number) => void;
  playSound: (item: SoundboardItem) => void;
  playSoundById: (soundId: string) => void;
  stopAllSounds: () => void;
  addSoundboardItem: (item: SoundboardItem) => void;
  deleteSoundboardItem: (id: string) => void;
  // Connection methods & Diagnostics
  connectToOBS: (config: OBSConnectionConfig) => void;
  startSimulator: () => void;
  disconnectOBS: () => void;
  getDiagnostics: () => ConnectionDiagnostics;
  // Plug-and-Play Auto Discovery
  isAutoScanning: boolean;
  autoScanStatus: string;
  autoScanAndConnect: (customHost?: string) => Promise<boolean>;
  // OBS Direct Actions
  changeScene: (sceneName: string) => Promise<void>;
  toggleMute: (inputName: string) => Promise<boolean>;
  setVolume: (inputName: string, volumeMul: number) => Promise<void>;
  toggleStream: () => Promise<void>;
  toggleRecord: () => Promise<void>;
  triggerHotkey: (hotkeyName: string) => Promise<void>;
}

const STORAGE_KEYS = {
  CONFIG: 'deckstream_obs_config',
  PROFILES: 'deckstream_profiles_v6',
  ACTIVE_PROFILE_ID: 'deckstream_active_profile_id_v6',
  SOUNDBOARD: 'deckstream_soundboard_items',
};

const DEFAULT_SOUNDBOARD: SoundboardItem[] = [
  { id: 'sb_airhorn', name: 'DJ Airhorn', category: 'memes', color: 'amber', icon: 'Megaphone', volume: 0.9, builtInType: 'airhorn' },
  { id: 'sb_rimshot', name: 'Ba-Dum-Tss', category: 'reactions', color: 'purple', icon: 'Music', volume: 0.85, builtInType: 'rimshot' },
  { id: 'sb_applause', name: 'Aplausos Plateia', category: 'reactions', color: 'emerald', icon: 'ThumbsUp', volume: 0.85, builtInType: 'applause' },
  { id: 'sb_laugh', name: 'Risada Sitcom', category: 'reactions', color: 'amber', icon: 'Smile', volume: 0.8, builtInType: 'laugh' },
  { id: 'sb_victory', name: 'Vitória GG', category: 'gameplay', color: 'blue', icon: 'Trophy', volume: 0.85, builtInType: 'victory' },
  { id: 'sb_gameover', name: 'Game Over Fail', category: 'gameplay', color: 'rose', icon: 'Skull', volume: 0.85, builtInType: 'gameover' },
  { id: 'sb_tension', name: 'Tensão Dramática', category: 'memes', color: 'rose', icon: 'Flame', volume: 0.9, builtInType: 'tension' },
  { id: 'sb_bell', name: 'Sino Doação', category: 'reactions', color: 'cyan', icon: 'Bell', volume: 0.75, builtInType: 'bell' },
  { id: 'sb_buzzer', name: 'Buzzer Erro', category: 'memes', color: 'rose', icon: 'AlertCircle', volume: 0.8, builtInType: 'buzzer' },
];

const INITIAL_PROFILES: DeckProfile[] = [
  {
    id: 'prof_gaming',
    name: 'Streaming & Games',
    icon: 'Gamepad2',
    gridConfig: { rows: 3, cols: 4, currentPage: 1, totalPages: 2 },
    buttons: [
      // Row 0: Cenas & Transmissão
      {
        id: 'btn_gm_0',
        page: 1,
        row: 0,
        col: 0,
        colSpan: 1,
        rowSpan: 1,
        title: 'Gameplay',
        icon: 'Gamepad2',
        color: 'blue',
        actionType: 'CHANGE_SCENE',
        actionPayload: { sceneName: '🎮 Gameplay Principal' },
      },
      {
        id: 'btn_gm_1',
        page: 1,
        row: 0,
        col: 1,
        colSpan: 1,
        rowSpan: 1,
        title: 'Facecam',
        icon: 'Video',
        color: 'emerald',
        actionType: 'CHANGE_SCENE',
        actionPayload: { sceneName: '👤 Facecam Tela Cheia' },
      },
      {
        id: 'btn_gm_2',
        page: 1,
        row: 0,
        col: 2,
        colSpan: 1,
        rowSpan: 1,
        title: 'Já Volto',
        icon: 'Clock',
        color: 'amber',
        actionType: 'CHANGE_SCENE',
        actionPayload: { sceneName: '⏳ BRB - Voltamos Já' },
      },
      {
        id: 'btn_gm_3',
        page: 1,
        row: 0,
        col: 3,
        colSpan: 1,
        rowSpan: 1,
        title: 'Ao Vivo',
        icon: 'Radio',
        color: 'rose',
        actionType: 'TOGGLE_STREAM',
      },
      // Row 1: Controles de Áudio & Gravação
      {
        id: 'btn_gm_mic',
        page: 1,
        row: 1,
        col: 0,
        colSpan: 1,
        rowSpan: 1,
        title: 'Microfone',
        icon: 'Mic',
        color: 'rose',
        actionType: 'TOGGLE_MUTE',
        actionPayload: { inputName: 'Microfone Principal (Shure SM7B)' },
      },
      {
        id: 'btn_gm_pc',
        page: 1,
        row: 1,
        col: 1,
        colSpan: 1,
        rowSpan: 1,
        title: 'Som do PC',
        icon: 'Volume2',
        color: 'cyan',
        actionType: 'TOGGLE_MUTE',
        actionPayload: { inputName: 'Som do Jogo / Desktop Audio' },
      },
      {
        id: 'btn_gm_spot',
        page: 1,
        row: 1,
        col: 2,
        colSpan: 1,
        rowSpan: 1,
        title: 'Spotify',
        icon: 'Music',
        color: 'purple',
        actionType: 'TOGGLE_MUTE',
        actionPayload: { inputName: 'Spotify Música de Fundo' },
      },
      {
        id: 'btn_gm_rec',
        page: 1,
        row: 1,
        col: 3,
        colSpan: 1,
        rowSpan: 1,
        title: 'Gravar',
        icon: 'Disc',
        color: 'purple',
        actionType: 'TOGGLE_RECORD',
      },
      // Row 2: Soundboard & Efeitos
      {
        id: 'btn_gm_s1',
        page: 1,
        row: 2,
        col: 0,
        colSpan: 1,
        rowSpan: 1,
        title: 'Airhorn',
        icon: 'Megaphone',
        color: 'amber',
        actionType: 'SOUNDBOARD_PLAY',
        actionPayload: { soundId: 'sb_airhorn' },
      },
      {
        id: 'btn_gm_s2',
        page: 1,
        row: 2,
        col: 1,
        colSpan: 1,
        rowSpan: 1,
        title: 'Aplausos',
        icon: 'ThumbsUp',
        color: 'emerald',
        actionType: 'SOUNDBOARD_PLAY',
        actionPayload: { soundId: 'sb_applause' },
      },
      {
        id: 'btn_gm_s3',
        page: 1,
        row: 2,
        col: 2,
        colSpan: 1,
        rowSpan: 1,
        title: 'Vitória GG',
        icon: 'Trophy',
        color: 'blue',
        actionType: 'SOUNDBOARD_PLAY',
        actionPayload: { soundId: 'sb_victory' },
      },
      {
        id: 'btn_gm_s4',
        page: 1,
        row: 2,
        col: 3,
        colSpan: 1,
        rowSpan: 1,
        title: 'Sino',
        icon: 'Bell',
        color: 'cyan',
        actionType: 'SOUNDBOARD_PLAY',
        actionPayload: { soundId: 'sb_bell' },
      },
    ],
  },
  {
    id: 'prof_chatting',
    name: 'Just Chatting',
    icon: 'MessageSquare',
    gridConfig: { rows: 3, cols: 3, currentPage: 1, totalPages: 1 },
    buttons: [
      {
        id: 'btn_ch_1',
        page: 1,
        row: 0,
        col: 0,
        colSpan: 1,
        rowSpan: 1,
        title: 'Facecam Full',
        icon: 'Video',
        color: 'emerald',
        actionType: 'CHANGE_SCENE',
        actionPayload: { sceneName: '👤 Facecam Tela Cheia' },
      },
      {
        id: 'btn_ch_mic_mute',
        page: 1,
        row: 0,
        col: 1,
        colSpan: 1,
        rowSpan: 1,
        title: 'Mudo Mic',
        icon: 'Mic',
        color: 'rose',
        actionType: 'TOGGLE_MUTE',
        actionPayload: { inputName: 'Microfone Principal (Shure SM7B)' },
      },
      {
        id: 'btn_ch_pc_mute',
        page: 1,
        row: 0,
        col: 2,
        colSpan: 1,
        rowSpan: 1,
        title: 'Som do PC',
        icon: 'Volume2',
        color: 'cyan',
        actionType: 'TOGGLE_MUTE',
        actionPayload: { inputName: 'Som do Jogo / Desktop Audio' },
      },
      {
        id: 'btn_ch_s1',
        page: 1,
        row: 1,
        col: 0,
        colSpan: 1,
        rowSpan: 1,
        title: 'Risada',
        icon: 'Smile',
        color: 'amber',
        actionType: 'SOUNDBOARD_PLAY',
        actionPayload: { soundId: 'sb_laugh' },
      },
      {
        id: 'btn_ch_s2',
        page: 1,
        row: 1,
        col: 1,
        colSpan: 1,
        rowSpan: 1,
        title: 'Ba-Dum-Tss',
        icon: 'Music',
        color: 'purple',
        actionType: 'SOUNDBOARD_PLAY',
        actionPayload: { soundId: 'sb_rimshot' },
      },
      {
        id: 'btn_ch_s3',
        page: 1,
        row: 1,
        col: 2,
        colSpan: 1,
        rowSpan: 1,
        title: 'Tensão',
        icon: 'Flame',
        color: 'rose',
        actionType: 'SOUNDBOARD_PLAY',
        actionPayload: { soundId: 'sb_tension' },
      },
      {
        id: 'btn_ch_spot_mute',
        page: 1,
        row: 2,
        col: 0,
        colSpan: 1,
        rowSpan: 1,
        title: 'Spotify',
        icon: 'Music',
        color: 'indigo',
        actionType: 'TOGGLE_MUTE',
        actionPayload: { inputName: 'Spotify Música de Fundo' },
      },
      {
        id: 'btn_ch_gameplay',
        page: 1,
        row: 2,
        col: 1,
        colSpan: 1,
        rowSpan: 1,
        title: 'Gameplay',
        icon: 'Gamepad2',
        color: 'blue',
        actionType: 'CHANGE_SCENE',
        actionPayload: { sceneName: '🎮 Gameplay Principal' },
      },
      {
        id: 'btn_ch_rec',
        page: 1,
        row: 2,
        col: 2,
        colSpan: 1,
        rowSpan: 1,
        title: 'Gravar',
        icon: 'Disc',
        color: 'purple',
        actionType: 'TOGGLE_RECORD',
      },
    ],
  },
];

const OBSContext = createContext<OBSContextValue | null>(null);

export const OBSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Connection config
  const [connectionConfig, setConnectionConfig] = useState<OBSConnectionConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      host: 'localhost',
      port: 4455,
      password: '',
      autoReconnect: true,
      isSimulator: true,
    };
  });

  // Profiles
  const [profiles, setProfiles] = useState<DeckProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROFILES;
  });

  // Active Profile ID
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
      if (saved && profiles.some(p => p.id === saved)) return saved;
    } catch {}
    return profiles[0]?.id || 'prof_gaming';
  });

  // Soundboard
  const [soundboardItems, setSoundboardItems] = useState<SoundboardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUNDBOARD);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SOUNDBOARD;
  });

  // Stream state
  const [streamState, setStreamState] = useState<OBSStreamState>(() => obsSimulator.state);
  const [currentlyPlayingSoundId, setCurrentlyPlayingSoundId] = useState<string | null>(null);
  const [soundboardMasterVolume, setSoundboardMasterVolumeState] = useState<number>(0.85);

  // Plug & Play Auto-Discovery State
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);
  const [autoScanStatus, setAutoScanStatus] = useState<string>('');

  const setSoundboardMasterVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSoundboardMasterVolumeState(clamped);
    soundEngine.setMasterVolume(clamped);
  }, []);

  // Active profile object
  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILES[0];
  }, [profiles, activeProfileId]);

  const gridConfig = activeProfile.gridConfig;
  const buttons = activeProfile.buttons;

  // Persist storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(connectionConfig));
    } catch {}
  }, [connectionConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch {}
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, activeProfileId);
    } catch {}
  }, [activeProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUNDBOARD, JSON.stringify(soundboardItems));
    } catch {}
  }, [soundboardItems]);

  // Sound playback listener
  useEffect(() => {
    const unsub = soundEngine.subscribePlayback((soundId, isPlaying) => {
      setCurrentlyPlayingSoundId(isPlaying ? soundId : null);
    });
    return () => {
      unsub();
    };
  }, []);

  // OBS Client / Simulator Connection Hook
  useEffect(() => {
    if (connectionConfig.isSimulator) {
      obsSimulator.start();
      const unsub = obsSimulator.subscribe(setStreamState);
      return () => {
        unsub();
        obsSimulator.stop();
      };
    } else {
      const unsub = obsClient.subscribe(setStreamState);
      return () => {
        unsub();
      };
    }
  }, [connectionConfig.isSimulator]);

  // Profile Management methods
  const switchProfile = useCallback((profileId: string) => {
    if (profiles.some(p => p.id === profileId)) {
      setActiveProfileId(profileId);
    }
  }, [profiles]);

  const createProfile = useCallback((name: string, icon: string = 'Layers') => {
    const newId = `prof_${Date.now()}`;
    const newProfile: DeckProfile = {
      id: newId,
      name: name.trim() || 'Novo Perfil',
      icon,
      gridConfig: { rows: 3, cols: 4, currentPage: 1, totalPages: 1 },
      buttons: [],
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newId);
    return newId;
  }, []);

  const renameProfile = useCallback((profileId: string, name: string, icon?: string) => {
    setProfiles(prev =>
      prev.map(p =>
        p.id === profileId
          ? { ...p, name: name.trim() || p.name, icon: icon || p.icon }
          : p
      )
    );
  }, []);

  const duplicateProfile = useCallback((profileId: string) => {
    const original = profiles.find(p => p.id === profileId);
    if (!original) return;
    const newId = `prof_${Date.now()}`;
    const cloned: DeckProfile = {
      ...original,
      id: newId,
      name: `${original.name} (Cópia)`,
      buttons: original.buttons.map(b => ({ ...b, id: `btn_${Math.random().toString(36).substring(2, 8)}` })),
    };
    setProfiles(prev => [...prev, cloned]);
    setActiveProfileId(newId);
  }, [profiles]);

  const deleteProfile = useCallback((profileId: string) => {
    if (profiles.length <= 1) return;
    setProfiles(prev => {
      const filtered = prev.filter(p => p.id !== profileId);
      if (activeProfileId === profileId) {
        setActiveProfileId(filtered[0]?.id || '');
      }
      return filtered;
    });
  }, [profiles, activeProfileId]);

  const updateActiveProfile = useCallback((updater: (current: DeckProfile) => DeckProfile) => {
    setProfiles(prev =>
      prev.map(p => (p.id === activeProfileId ? updater(p) : p))
    );
  }, [activeProfileId]);

  // Deck Controls for Active Profile
  const setGridDimensions = useCallback((rows: number, cols: number) => {
    updateActiveProfile(prof => ({
      ...prof,
      gridConfig: {
        ...prof.gridConfig,
        rows: Math.max(2, Math.min(6, rows)),
        cols: Math.max(2, Math.min(8, cols)),
      },
    }));
  }, [updateActiveProfile]);

  const setCurrentPage = useCallback((page: number) => {
    updateActiveProfile(prof => ({
      ...prof,
      gridConfig: {
        ...prof.gridConfig,
        currentPage: Math.max(1, Math.min(prof.gridConfig.totalPages, page)),
      },
    }));
  }, [updateActiveProfile]);

  const addPage = useCallback(() => {
    updateActiveProfile(prof => ({
      ...prof,
      gridConfig: {
        ...prof.gridConfig,
        totalPages: prof.gridConfig.totalPages + 1,
        currentPage: prof.gridConfig.totalPages + 1,
      },
    }));
  }, [updateActiveProfile]);

  const removePage = useCallback((pageToRemove: number) => {
    updateActiveProfile(prof => {
      if (prof.gridConfig.totalPages <= 1) return prof;
      const nextTotal = prof.gridConfig.totalPages - 1;
      const nextPage = prof.gridConfig.currentPage >= pageToRemove
        ? Math.max(1, prof.gridConfig.currentPage - 1)
        : prof.gridConfig.currentPage;

      return {
        ...prof,
        gridConfig: {
          ...prof.gridConfig,
          totalPages: nextTotal,
          currentPage: nextPage,
        },
        buttons: prof.buttons
          .filter(b => b.page !== pageToRemove)
          .map(b => (b.page > pageToRemove ? { ...b, page: b.page - 1 } : b)),
      };
    });
  }, [updateActiveProfile]);

  const saveButton = useCallback((button: DeckButton) => {
    updateActiveProfile(prof => {
      const idx = prof.buttons.findIndex(b => b.id === button.id);
      if (idx >= 0) {
        const copy = [...prof.buttons];
        copy[idx] = button;
        return { ...prof, buttons: copy };
      } else {
        return { ...prof, buttons: [...prof.buttons, button] };
      }
    });
  }, [updateActiveProfile]);

  const deleteButton = useCallback((id: string) => {
    updateActiveProfile(prof => ({
      ...prof,
      buttons: prof.buttons.filter(b => b.id !== id),
    }));
  }, [updateActiveProfile]);

  const reorderButtons = useCallback((sourceId: string, targetRow: number, targetCol: number) => {
    updateActiveProfile(prof => {
      const page = prof.gridConfig.currentPage;
      const pageButtons = prof.buttons.filter(b => b.page === page);
      const otherButtons = prof.buttons.filter(b => b.page !== page);

      const sourceBtn = pageButtons.find(b => b.id === sourceId);
      if (!sourceBtn) return prof;

      // Clamp target coordinates
      const maxRow = Math.max(0, prof.gridConfig.rows - (sourceBtn.rowSpan || 1));
      const maxCol = Math.max(0, prof.gridConfig.cols - (sourceBtn.colSpan || 1));
      const clampedRow = Math.min(maxRow, Math.max(0, targetRow));
      const clampedCol = Math.min(maxCol, Math.max(0, targetCol));

      if (sourceBtn.row === clampedRow && sourceBtn.col === clampedCol) {
        return prof;
      }

      // Build sorted list of current page buttons by reading order: row * cols + col
      const sortedButtons = [...pageButtons].sort((a, b) => {
        return (a.row * prof.gridConfig.cols + a.col) - (b.row * prof.gridConfig.cols + b.col);
      });

      const oldIndex = sortedButtons.findIndex(b => b.id === sourceId);
      if (oldIndex < 0) return prof;

      // Remove from old position
      const [movedBtn] = sortedButtons.splice(oldIndex, 1);

      // Find target insertion index based on target coordinate
      const targetPos = clampedRow * prof.gridConfig.cols + clampedCol;
      let targetIndex = sortedButtons.findIndex(b => (b.row * prof.gridConfig.cols + b.col) >= targetPos);
      if (targetIndex < 0) {
        targetIndex = sortedButtons.length;
      }

      // Insert at target index
      sortedButtons.splice(targetIndex, 0, {
        ...movedBtn,
        row: clampedRow,
        col: clampedCol,
      });

      // Reflow algorithm with neighbor displacement:
      // We reserve the cells taken by movedBtn at (clampedRow, clampedCol).
      const occupied = new Set<string>();
      const rSpanMoved = movedBtn.rowSpan || 1;
      const cSpanMoved = movedBtn.colSpan || 1;
      for (let r = 0; r < rSpanMoved; r++) {
        for (let c = 0; c < cSpanMoved; c++) {
          occupied.add(`${clampedRow + r},${clampedCol + c}`);
        }
      }

      const reflowedPageButtons: DeckButton[] = [{
        ...movedBtn,
        row: clampedRow,
        col: clampedCol,
      }];

      let curR = 0;
      let curC = 0;

      for (const btn of sortedButtons) {
        if (btn.id === sourceId) continue;
        const rSpan = btn.rowSpan || 1;
        const cSpan = btn.colSpan || 1;

        let placed = false;
        for (let rScan = 0; rScan < prof.gridConfig.rows && !placed; rScan++) {
          for (let cScan = 0; cScan < prof.gridConfig.cols && !placed; cScan++) {
            if (rScan + rSpan > prof.gridConfig.rows || cScan + cSpan > prof.gridConfig.cols) {
              continue;
            }
            let canFit = true;
            for (let r = 0; r < rSpan; r++) {
              for (let c = 0; c < cSpan; c++) {
                if (occupied.has(`${rScan + r},${cScan + c}`)) {
                  canFit = false;
                  break;
                }
              }
              if (!canFit) break;
            }

            if (canFit) {
              for (let r = 0; r < rSpan; r++) {
                for (let c = 0; c < cSpan; c++) {
                  occupied.add(`${rScan + r},${cScan + c}`);
                }
              }
              reflowedPageButtons.push({
                ...btn,
                row: rScan,
                col: cScan,
              });
              placed = true;
            }
          }
        }

        if (!placed) {
          reflowedPageButtons.push(btn);
        }
      }

      return {
        ...prof,
        buttons: [...otherButtons, ...reflowedPageButtons],
      };
    });
  }, [updateActiveProfile]);

  const resetButtonsToDefault = useCallback(() => {
    setProfiles(INITIAL_PROFILES);
    setActiveProfileId(INITIAL_PROFILES[0].id);
    setSoundboardItems(DEFAULT_SOUNDBOARD);
  }, []);

  // Connection methods
  const connectToOBS = useCallback((newConfig: OBSConnectionConfig) => {
    setConnectionConfig(newConfig);
    if (newConfig.isSimulator) {
      obsClient.disconnect();
      obsSimulator.start();
    } else {
      obsSimulator.stop();
      obsClient.connect(newConfig);
    }
  }, []);

  const startSimulator = useCallback(() => {
    const simConfig: OBSConnectionConfig = {
      ...connectionConfig,
      isSimulator: true,
    };
    setConnectionConfig(simConfig);
    obsClient.disconnect();
    obsSimulator.start();
  }, [connectionConfig]);

  const disconnectOBS = useCallback(() => {
    if (connectionConfig.isSimulator) {
      obsSimulator.stop();
      setStreamState(prev => ({ ...prev, connectionState: 'disconnected' }));
    } else {
      obsClient.disconnect();
    }
  }, [connectionConfig.isSimulator]);

  // Plug-and-Play Auto-Discovery & Instant Connect
  const autoScanAndConnect = useCallback(async (customHost?: string): Promise<boolean> => {
    setIsAutoScanning(true);
    setAutoScanStatus('Iniciando varredura rápida USB & Wi-Fi...');
    try {
      const result = await OBSAutoDiscoveryService.autoScanAndFind(customHost, (target, status) => {
        if (status === 'testing') {
          setAutoScanStatus(`Verificando ${target.label}...`);
        } else if (status === 'success') {
          setAutoScanStatus(`OBS detectado com sucesso em ${target.host}:${target.port}!`);
        }
      });

      if (result.success && result.target) {
        setAutoScanStatus(`Conectado ao OBS Studio (${result.target.host}:${result.target.port})`);
        connectToOBS({
          host: result.target.host,
          port: result.target.port,
          password: connectionConfig.password || '',
          autoReconnect: true,
          isSimulator: false,
        });
        setIsAutoScanning(false);
        return true;
      } else {
        setAutoScanStatus(result.error || 'Nenhum servidor OBS detectado nas portas padrões.');
        setIsAutoScanning(false);
        return false;
      }
    } catch (err: any) {
      setAutoScanStatus(`Falha na varredura: ${err?.message || err}`);
      setIsAutoScanning(false);
      return false;
    }
  }, [connectToOBS, connectionConfig.password]);

  // Diagnostics for 3-point visual bridge
  const getDiagnostics = useCallback((): ConnectionDiagnostics => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    const bridgeType: 'usb_cable' | 'wifi_lan' | 'simulator' =
      connectionConfig.isSimulator
        ? 'simulator'
        : connectionConfig.host.includes('localhost') || connectionConfig.host.includes('127.0.0.1')
        ? 'usb_cable'
        : 'wifi_lan';

    return {
      device: {
        name: isAndroid ? 'Android Phone' : isIOS ? 'iPhone / iPad' : 'Computador / Tablet',
        os: isAndroid ? 'android' : isIOS ? 'ios' : 'desktop',
        isPWA: isStandalone,
        orientation: window.innerWidth > window.innerHeight ? 'Paisagem (Horizontal)' : 'Retrato (Vertical)',
        isOnline: navigator.onLine,
      },
      bridge: {
        type: bridgeType,
        host: connectionConfig.host,
        port: connectionConfig.port,
        pingMs: connectionConfig.isSimulator ? 0.8 : streamState.connectionState === 'connected' ? 2.4 : null,
      },
      obs: {
        status: streamState.connectionState === 'connected'
          ? 'connected'
          : streamState.connectionState === 'connecting'
          ? 'connecting'
          : streamState.connectionState === 'error'
          ? 'error'
          : 'disconnected',
        version: connectionConfig.isSimulator ? 'OBS Studio 30.2 (Simulado)' : 'OBS WebSocket v5',
        authenticated: streamState.connectionState === 'connected' || connectionConfig.isSimulator,
      },
    };
  }, [connectionConfig, streamState.connectionState]);

  // Actions
  const changeScene = useCallback(async (sceneName: string) => {
    if (connectionConfig.isSimulator) {
      obsSimulator.setScene(sceneName);
    } else {
      await obsClient.setScene(sceneName);
    }
  }, [connectionConfig.isSimulator]);

  const toggleMute = useCallback(async (inputName: string): Promise<boolean> => {
    if (connectionConfig.isSimulator) {
      return obsSimulator.toggleMute(inputName);
    } else {
      return await obsClient.toggleMute(inputName);
    }
  }, [connectionConfig.isSimulator]);

  const setVolume = useCallback(async (inputName: string, volumeMul: number) => {
    if (connectionConfig.isSimulator) {
      obsSimulator.setInputVolume(inputName, volumeMul);
    } else {
      await obsClient.setInputVolume(inputName, volumeMul);
    }
  }, [connectionConfig.isSimulator]);

  const toggleStream = useCallback(async () => {
    if (connectionConfig.isSimulator) {
      obsSimulator.toggleStream();
    } else {
      await obsClient.toggleStream();
    }
  }, [connectionConfig.isSimulator]);

  const toggleRecord = useCallback(async () => {
    if (connectionConfig.isSimulator) {
      obsSimulator.toggleRecord();
    } else {
      await obsClient.toggleRecord();
    }
  }, [connectionConfig.isSimulator]);

  const triggerHotkey = useCallback(async (hotkeyName: string) => {
    if (!connectionConfig.isSimulator) {
      await obsClient.triggerHotkey(hotkeyName);
    }
  }, [connectionConfig.isSimulator]);

  // Soundboard
  const playSound = useCallback((item: SoundboardItem) => {
    soundEngine.play(item);
  }, []);

  const playSoundById = useCallback((soundId: string) => {
    const item = soundboardItems.find(s => s.id === soundId);
    if (item) {
      soundEngine.play(item);
    }
  }, [soundboardItems]);

  const stopAllSounds = useCallback(() => {
    soundEngine.stopAll();
  }, []);

  const addSoundboardItem = useCallback((item: SoundboardItem) => {
    setSoundboardItems(prev => [...prev, item]);
  }, []);

  const deleteSoundboardItem = useCallback((id: string) => {
    setSoundboardItems(prev => prev.filter(s => s.id !== id));
  }, []);

  const value = useMemo<OBSContextValue>(() => ({
    connectionConfig,
    streamState,
    profiles,
    activeProfileId,
    activeProfile,
    switchProfile,
    createProfile,
    renameProfile,
    duplicateProfile,
    deleteProfile,
    gridConfig,
    buttons,
    setGridDimensions,
    setCurrentPage,
    addPage,
    removePage,
    saveButton,
    deleteButton,
    reorderButtons,
    resetButtonsToDefault,
    soundboardItems,
    currentlyPlayingSoundId,
    soundboardMasterVolume,
    setSoundboardMasterVolume,
    playSound,
    playSoundById,
    stopAllSounds,
    addSoundboardItem,
    deleteSoundboardItem,
    connectToOBS,
    startSimulator,
    disconnectOBS,
    getDiagnostics,
    isAutoScanning,
    autoScanStatus,
    autoScanAndConnect,
    changeScene,
    toggleMute,
    setVolume,
    toggleStream,
    toggleRecord,
    triggerHotkey,
  }), [
    connectionConfig,
    streamState,
    profiles,
    activeProfileId,
    activeProfile,
    switchProfile,
    createProfile,
    renameProfile,
    duplicateProfile,
    deleteProfile,
    gridConfig,
    buttons,
    setGridDimensions,
    setCurrentPage,
    addPage,
    removePage,
    saveButton,
    deleteButton,
    resetButtonsToDefault,
    soundboardItems,
    currentlyPlayingSoundId,
    playSound,
    playSoundById,
    stopAllSounds,
    addSoundboardItem,
    deleteSoundboardItem,
    connectToOBS,
    startSimulator,
    disconnectOBS,
    getDiagnostics,
    isAutoScanning,
    autoScanStatus,
    autoScanAndConnect,
    changeScene,
    toggleMute,
    setVolume,
    toggleStream,
    toggleRecord,
    triggerHotkey,
  ]);

  return <OBSContext.Provider value={value}>{children}</OBSContext.Provider>;
};

export function useOBS(): OBSContextValue {
  const context = useContext(OBSContext);
  if (!context) {
    throw new Error('useOBS must be used within an OBSProvider');
  }
  return context;
}
