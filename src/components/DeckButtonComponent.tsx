import React, { useRef, useState } from 'react';
import { useOBS } from '../context/OBSContext';
import { useTheme } from '../context/ThemeContext';
import { DeckButton, IconSize } from '../types';
import { IconRenderer } from './IconRenderer';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Edit2,
  GripVertical,
} from 'lucide-react';

interface DeckButtonComponentProps {
  button: DeckButton;
  isEditMode: boolean;
  onEditClick: () => void;
  onTriggerHaptic: (pattern?: number) => void;
  isDragging?: boolean;
  onStartDrag?: (button: DeckButton, e: React.PointerEvent) => void;
  onOpenVolumeModal?: (inputName: string) => void;
}

export const DeckButtonComponent: React.FC<DeckButtonComponentProps> = ({
  button,
  isEditMode,
  onEditClick,
  onTriggerHaptic,
  isDragging = false,
  onStartDrag,
  onOpenVolumeModal,
}) => {
  const {
    streamState,
    changeScene,
    toggleMute,
    toggleStream,
    toggleRecord,
    playSoundById,
    setCurrentPage,
    currentlyPlayingSoundId,
  } = useOBS();

  const { actualTheme } = useTheme();

  // Long-press detection state
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Audio input target determination
  const audioInputName =
    button.actionPayload?.inputName ||
    button.gadgetConfig?.targetInput ||
    (button.actionType === 'TOGGLE_MUTE' ? button.actionPayload?.inputName : undefined);

  const isAudioInput = Boolean(audioInputName);
  const audioInput = audioInputName
    ? streamState.audioInputs.find(i => i.name === audioInputName)
    : null;

  const isAudioMuted = audioInput ? audioInput.muted : false;

  // Dynamic States
  const isCurrentScene =
    button.actionType === 'CHANGE_SCENE' &&
    button.actionPayload?.sceneName === streamState.currentProgramScene;

  const isSoundPlaying =
    button.actionType === 'SOUNDBOARD_PLAY' &&
    button.actionPayload?.soundId === currentlyPlayingSoundId;

  const isLiveStreaming =
    button.actionType === 'TOGGLE_STREAM' && streamState.isStreaming;

  const isRecordingActive =
    button.actionType === 'TOGGLE_RECORD' && streamState.isRecording;

  // Whether this button is currently in an "ACTIVE" state
  const isButtonActive =
    isCurrentScene ||
    isLiveStreaming ||
    isRecordingActive ||
    isSoundPlaying ||
    (isAudioInput && !isAudioMuted);

  // Icon Sizing - Increased for superior legibility
  const getIconPixelSize = (size?: IconSize): number => {
    switch (size) {
      case 'sm': return 22;
      case 'lg': return 38;
      case 'xl': return 48;
      case 'md':
      default: return 32;
    }
  };

  // Base Colors with Light/Dark compensation
  const getThemeBaseStyle = () => {
    if (button.customStyle?.customBg) {
      return {
        backgroundColor: button.customStyle.customBg,
        color: button.customStyle.customTextColor || '#ffffff',
        borderColor: button.customStyle.customBorderColor || 'transparent',
      };
    }

    const isDark = actualTheme === 'dark';

    // Active state styles
    if (isAudioMuted) {
      return {
        backgroundColor: isDark ? 'rgba(136, 19, 55, 0.35)' : '#ffe4e6',
        borderColor: '#f43f5e',
        color: isDark ? '#fecdd3' : '#9f1239',
      };
    }
    if (isCurrentScene || (isAudioInput && !isAudioMuted)) {
      return {
        backgroundColor: isDark ? 'rgba(6, 78, 59, 0.45)' : '#d1fae5',
        borderColor: '#10b981',
        color: isDark ? '#d1fae5' : '#065f46',
      };
    }
    if (isLiveStreaming) {
      return {
        backgroundColor: isDark ? 'rgba(159, 18, 57, 0.5)' : '#ffe4e6',
        borderColor: '#f43f5e',
        color: isDark ? '#ffe4e6' : '#9f1239',
      };
    }
    if (isRecordingActive) {
      return {
        backgroundColor: isDark ? 'rgba(88, 28, 135, 0.45)' : '#f3e8ff',
        borderColor: '#a855f7',
        color: isDark ? '#f3e8ff' : '#6b21a8',
      };
    }
    if (isSoundPlaying) {
      return {
        backgroundColor: isDark ? 'rgba(120, 53, 15, 0.45)' : '#fef3c7',
        borderColor: '#f59e0b',
        color: isDark ? '#fef3c7' : '#92400e',
      };
    }

    switch (button.color) {
      case 'blue':
        return {
          backgroundColor: isDark ? '#121624' : '#eff6ff',
          borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : '#bfdbfe',
          color: isDark ? '#dbeafe' : '#1e40af',
        };
      case 'emerald':
        return {
          backgroundColor: isDark ? '#101b17' : '#ecfdf5',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#a7f3d0',
          color: isDark ? '#d1fae5' : '#065f46',
        };
      case 'rose':
        return {
          backgroundColor: isDark ? '#1c1216' : '#fff1f2',
          borderColor: isDark ? 'rgba(244, 63, 94, 0.25)' : '#fecdd3',
          color: isDark ? '#ffe4e6' : '#9f1239',
        };
      case 'amber':
        return {
          backgroundColor: isDark ? '#1c1710' : '#fffbeb',
          borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#fde68a',
          color: isDark ? '#fef3c7' : '#92400e',
        };
      case 'purple':
        return {
          backgroundColor: isDark ? '#181324' : '#faf5ff',
          borderColor: isDark ? 'rgba(168, 85, 247, 0.25)' : '#e9d5ff',
          color: isDark ? '#f3e8ff' : '#6b21a8',
        };
      case 'cyan':
        return {
          backgroundColor: isDark ? '#0f1b22' : '#ecfeff',
          borderColor: isDark ? 'rgba(6, 182, 212, 0.25)' : '#a5f3fc',
          color: isDark ? '#cffafe' : '#155e75',
        };
      case 'indigo':
        return {
          backgroundColor: isDark ? '#131524' : '#eef2ff',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : '#c7d2fe',
          color: isDark ? '#e0e7ff' : '#3730a3',
        };
      default:
        return {
          backgroundColor: isDark ? '#11131a' : '#ffffff',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          color: isDark ? '#e2e8f0' : '#1e293b',
        };
    }
  };

  const handleStandardClick = async () => {
    // If long-press just triggered, ignore regular click
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    onTriggerHaptic(20);
    if (isEditMode) {
      onEditClick();
      return;
    }

    switch (button.actionType) {
      case 'CHANGE_SCENE':
        if (button.actionPayload?.sceneName) {
          await changeScene(button.actionPayload.sceneName);
        }
        break;
      case 'TOGGLE_MUTE':
        if (button.actionPayload?.inputName) {
          await toggleMute(button.actionPayload.inputName);
        }
        break;
      case 'SOUNDBOARD_PLAY':
        if (button.actionPayload?.soundId) {
          playSoundById(button.actionPayload.soundId);
        }
        break;
      case 'TOGGLE_STREAM':
        await toggleStream();
        break;
      case 'TOGGLE_RECORD':
        await toggleRecord();
        break;
      case 'NAVIGATE_PAGE':
        if (button.actionPayload?.targetPage) {
          setCurrentPage(button.actionPayload.targetPage);
        }
        break;
      case 'GADGET':
        if (button.gadgetConfig?.targetInput) {
          await toggleMute(button.gadgetConfig.targetInput);
        }
        break;
      default:
        break;
    }
  };

  // Pointer Handlers for Long-Press (Quick Volume Modal)
  const handlePointerDown = (e: React.PointerEvent) => {
    onStartDrag?.(button, e);

    if (isEditMode) return;

    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    isLongPressTriggeredRef.current = false;

    if (isAudioInput && audioInputName && onOpenVolumeModal) {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        onTriggerHaptic(40);
        onOpenVolumeModal(audioInputName);
      }, 450);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartPosRef.current || !longPressTimerRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartPosRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartPosRef.current.y);
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pointerStartPosRef.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isAudioInput && audioInputName && onOpenVolumeModal) {
      e.preventDefault();
      onTriggerHaptic(30);
      onOpenVolumeModal(audioInputName);
    }
  };

  const baseStyle = getThemeBaseStyle();
  const iconPixel = getIconPixelSize(button.customStyle?.iconSize);

  // Active Border Classes (Borda de 3px com brilho solicitada)
  const getActiveBorderClasses = () => {
    if (isLiveStreaming) {
      return 'border-[3px] border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.45)] ring-1 ring-rose-400/50';
    }
    if (isRecordingActive) {
      return 'border-[3px] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/50';
    }
    if (isSoundPlaying) {
      return 'border-[3px] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50';
    }
    if (isAudioMuted) {
      return 'border-[3px] border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.3)] ring-1 ring-rose-400/40';
    }
    if (isCurrentScene || (isAudioInput && !isAudioMuted)) {
      return 'border-[3px] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.38)] ring-1 ring-emerald-400/50';
    }
    return 'border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20';
  };

  return (
    <button
      type="button"
      style={baseStyle}
      onClick={handleStandardClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={handleContextMenu}
      className={`relative group rounded-xl md:rounded-2xl p-2 flex flex-col items-center justify-center gap-2 text-center select-none cursor-pointer transition-all duration-100 active:scale-[0.95] overflow-hidden w-full h-full ${getActiveBorderClasses()} ${
        isDragging ? 'opacity-30 scale-95 ring-2 ring-blue-500' : ''
      }`}
      title={isAudioInput ? `${button.title} (Toque longo para volume)` : button.title}
    >
      {/* Pulsing Green Dot for Active Multimedia / Audio Buttons */}
      {isAudioInput && !isAudioMuted && (
        <span
          className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 ring-2 ring-emerald-500/40 animate-pulse z-10"
          title="Canal Ativo / Desmutado"
        />
      )}

      {/* Muted Indicator Badge */}
      {isAudioMuted && (
        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-rose-500 text-white shadow-sm z-10 tracking-wider">
          MUDO
        </span>
      )}

      {/* Current Scene Green Dot */}
      {isCurrentScene && !isAudioInput && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 ring-2 ring-emerald-500/40 animate-pulse z-10" />
      )}

      {/* Live Streaming Indicator */}
      {isLiveStreaming && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400/50 animate-ping z-10" />
      )}

      {/* Recording Indicator */}
      {isRecordingActive && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-purple-300/50 animate-pulse z-10" />
      )}

      {/* Sound Playing Indicator */}
      {isSoundPlaying && (
        <span className="absolute top-1.5 right-1.5 text-amber-300 animate-bounce z-10">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
      )}

      {/* Drag Indicator in Edit Mode */}
      {isEditMode && (
        <span className="absolute top-1.5 left-1.5 text-zinc-400 opacity-60">
          <GripVertical className="w-3.5 h-3.5" />
        </span>
      )}

      {/* Main Icon with Generous Size */}
      <IconRenderer
        name={button.icon}
        size={iconPixel}
        className="shrink-0 opacity-95 group-hover:opacity-100 transition-transform group-hover:scale-105"
      />

      {/* Title with Larger Legible Font */}
      <span className="text-xs md:text-sm font-semibold tracking-tight truncate w-full px-1 leading-tight">
        {button.title}
      </span>

      {/* Optional Volume Percentage hint for Audio Buttons */}
      {isAudioInput && audioInput && (
        <span className="text-[10px] font-mono tabular-nums opacity-60 font-medium -mt-1">
          {Math.round(audioInput.volumeMul * 100)}%
        </span>
      )}

      {/* Edit Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-white">
          <Edit2 className="w-4 h-4" />
        </div>
      )}
    </button>
  );
};

