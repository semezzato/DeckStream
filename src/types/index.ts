/**
 * DeckStream OBS - TypeScript Type Definitions
 */

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'simulator' | 'error';

export type ThemeMode = 'dark' | 'light' | 'system';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

export interface OBSConnectionConfig {
  host: string;
  port: number;
  password?: string;
  autoReconnect: boolean;
  isSimulator: boolean;
}

export interface AudioInputItem {
  name: string;
  volumeDb: number;
  volumeMul: number; // 0.0 to 1.0
  muted: boolean;
}

export interface OBSStreamState {
  currentProgramScene: string;
  currentPreviewScene?: string;
  scenes: string[];
  audioInputs: AudioInputItem[];
  isStreaming: boolean;
  isRecording: boolean;
  streamTimecode: string;
  recordTimecode: string;
  cpuUsage: number;
  memoryUsage: number;
  outputFps: number;
  connectionState: ConnectionState;
  connectionError?: string;
}

export type ActionType = 
  | 'CHANGE_SCENE'
  | 'TOGGLE_MUTE'
  | 'SET_VOLUME'
  | 'SOUNDBOARD_PLAY'
  | 'TOGGLE_STREAM'
  | 'TOGGLE_RECORD'
  | 'HOTKEY'
  | 'NAVIGATE_PAGE'
  | 'GADGET';

export type GadgetType = 'volume_fader';

export type ButtonColor = 'slate' | 'blue' | 'emerald' | 'rose' | 'amber' | 'purple' | 'cyan' | 'indigo' | 'custom';

export interface ButtonCustomStyle {
  customBg?: string; // hex or rgba
  customTextColor?: string;
  customBorderColor?: string;
  borderWidth?: number; // 0, 1, 2, 3, 4 px
  iconSize?: IconSize;
}

export interface DeckButton {
  id: string;
  row: number; // 0-indexed
  col: number; // 0-indexed
  page: number; // 1-indexed
  colSpan?: 1 | 2; // Default 1
  rowSpan?: 1 | 2; // Default 1
  title: string;
  icon: string;
  color: ButtonColor;
  customStyle?: ButtonCustomStyle;
  actionType: ActionType;
  actionPayload?: {
    sceneName?: string;
    inputName?: string;
    volumeStep?: number;
    soundId?: string;
    hotkeyName?: string;
    targetPage?: number;
  };
  gadgetConfig?: {
    type: GadgetType;
    targetInput?: string;
  };
}

export interface GridConfig {
  rows: number; // default 3
  cols: number; // default 4
  currentPage: number;
  totalPages: number;
}

export interface DeckProfile {
  id: string;
  name: string;
  icon: string;
  gridConfig: GridConfig;
  buttons: DeckButton[];
}

export interface SoundboardItem {
  id: string;
  name: string;
  category: 'memes' | 'gameplay' | 'reactions' | 'custom';
  color: ButtonColor;
  icon: string;
  volume: number; // 0 to 1
  builtInType?: 'airhorn' | 'applause' | 'rimshot' | 'laugh' | 'gameover' | 'victory' | 'tension' | 'bell' | 'buzzer';
  customAudioUrl?: string; // base64 or blob URL
}

export interface ConnectionDiagnostics {
  device: {
    name: string;
    os: 'android' | 'ios' | 'desktop' | 'unknown';
    isPWA: boolean;
    orientation: string;
    isOnline: boolean;
  };
  bridge: {
    type: 'usb_cable' | 'wifi_lan' | 'simulator';
    host: string;
    port: number;
    pingMs: number | null;
  };
  obs: {
    status: 'connected' | 'connecting' | 'disconnected' | 'error';
    version?: string;
    authenticated: boolean;
  };
}
