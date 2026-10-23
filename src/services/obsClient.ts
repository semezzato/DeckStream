/**
 * Native OBS WebSocket v5 Client
 * Implements OBS WebSocket Protocol v5 (OpCodes 0, 1, 2, 5, 6, 7)
 * Uses browser Web Crypto API (crypto.subtle) for SHA-256 challenge-response authentication.
 */

import { OBSConnectionConfig, OBSStreamState } from '../types';

export type OBSStateListener = (state: OBSStreamState) => void;

class OBSClient {
  private ws: WebSocket | null = null;
  private config: OBSConnectionConfig = {
    host: 'localhost',
    port: 4455,
    password: '',
    autoReconnect: true,
    isSimulator: false,
  };
  private listeners: Set<OBSStateListener> = new Set();
  private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();
  private reconnectTimer: number | null = null;
  private statsInterval: number | null = null;

  public state: OBSStreamState = {
    currentProgramScene: '',
    currentPreviewScene: '',
    scenes: [],
    audioInputs: [],
    isStreaming: false,
    isRecording: false,
    streamTimecode: '00:00:00',
    recordTimecode: '00:00:00',
    cpuUsage: 0,
    memoryUsage: 0,
    outputFps: 60,
    connectionState: 'disconnected',
  };

  public subscribe(listener: OBSStateListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(partial: Partial<OBSStreamState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(fn => fn(this.state));
  }

  /**
   * Compute Base64 SHA-256 hash using Web Crypto API
   */
  private async sha256Base64(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const binary = String.fromCharCode(...new Uint8Array(hashBuffer));
    return btoa(binary);
  }

  /**
   * Connect to OBS WebSocket Server
   */
  public connect(config: OBSConnectionConfig) {
    this.config = config;
    this.disconnect();

    this.updateState({
      connectionState: 'connecting',
      connectionError: undefined,
    });

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Allow ws over lan or user specified host
    const url = `${this.config.host.startsWith('ws://') || this.config.host.startsWith('wss://') ? '' : 'ws://'}${this.config.host}:${this.config.port}`;

    try {
      this.ws = new WebSocket(url);
    } catch (err: any) {
      this.updateState({
        connectionState: 'error',
        connectionError: `Falha ao iniciar WebSocket: ${err.message || err}`,
      });
      return;
    }

    this.ws.onopen = () => {
      // Waiting for Hello (OpCode 0) from OBS
    };

    this.ws.onmessage = async (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        await this.handleMessage(payload);
      } catch (err) {
        console.error('OBS message error:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.warn('OBS WebSocket error:', err);
    };

    this.ws.onclose = (evt) => {
      this.clearTimers();
      this.rejectAllPending(new Error('Conexão encerrada pelo OBS'));
      
      const wasConnected = this.state.connectionState === 'connected';
      this.updateState({
        connectionState: 'disconnected',
        connectionError: evt.wasClean ? undefined : 'Conexão perdida com o OBS Studio.',
      });

      if (this.config.autoReconnect && wasConnected) {
        this.reconnectTimer = window.setTimeout(() => {
          this.connect(this.config);
        }, 3000);
      }
    };
  }

  public disconnect() {
    this.clearTimers();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    this.updateState({ connectionState: 'disconnected' });
  }

  private clearTimers() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  private rejectAllPending(err: Error) {
    this.pendingRequests.forEach(p => p.reject(err));
    this.pendingRequests.clear();
  }

  /**
   * Handle incoming OBS v5 protocol messages
   */
  private async handleMessage(msg: { op: number; d: any }) {
    switch (msg.op) {
      case 0: // Hello
        await this.handleHello(msg.d);
        break;
      case 2: // Identified
        this.handleIdentified(msg.d);
        break;
      case 5: // Event
        this.handleEvent(msg.d);
        break;
      case 7: // RequestResponse
        this.handleRequestResponse(msg.d);
        break;
      default:
        break;
    }
  }

  /**
   * Handshake Hello (OpCode 0)
   */
  private async handleHello(data: { obsWebSocketVersion: string; rpcVersion: number; authentication?: { challenge: string; salt: string } }) {
    let authResponse: string | undefined = undefined;

    if (data.authentication) {
      if (!this.config.password) {
        this.updateState({
          connectionState: 'error',
          connectionError: 'O OBS requer senha de autenticação. Configure-a no painel.',
        });
        this.disconnect();
        return;
      }

      // Step 1: secret = base64(sha256(password + salt))
      const secret = await this.sha256Base64(this.config.password + data.authentication.salt);
      // Step 2: authResponse = base64(sha256(secret + challenge))
      authResponse = await this.sha256Base64(secret + data.authentication.challenge);
    }

    // Send Identify (OpCode 1)
    const identifyPayload: any = {
      op: 1,
      d: {
        rpcVersion: 1,
        eventSubscriptions: 1023, // All general, config, scenes, inputs, transitions, filters, outputs
      },
    };

    if (authResponse) {
      identifyPayload.d.authentication = authResponse;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(identifyPayload));
    }
  }

  /**
   * Identified (OpCode 2) - Connected & Authenticated
   */
  private async handleIdentified(_data: any) {
    this.updateState({
      connectionState: 'connected',
      connectionError: undefined,
    });

    // Fetch initial data: scenes, inputs, stream status
    await this.fetchInitialData();
    this.startPeriodicStats();
  }

  private async fetchInitialData() {
    try {
      // 1. Get Scene List
      const sceneListRes = await this.sendRequest('GetSceneList');
      const scenes = (sceneListRes.scenes || []).map((s: any) => s.sceneName).reverse();
      const currentProgramScene = sceneListRes.currentProgramSceneName || scenes[0] || '';
      const currentPreviewScene = sceneListRes.currentPreviewSceneName || '';

      // 2. Get Input List (Audio sources)
      const inputListRes = await this.sendRequest('GetInputList');
      const allInputs = inputListRes.inputs || [];
      const audioInputs: any[] = [];

      for (const input of allInputs) {
        try {
          const muteRes = await this.sendRequest('GetInputMute', { inputName: input.inputName });
          const volRes = await this.sendRequest('GetInputVolume', { inputName: input.inputName });
          audioInputs.push({
            name: input.inputName,
            muted: muteRes.inputMuted,
            volumeDb: volRes.inputVolumeDb,
            volumeMul: volRes.inputVolumeMul,
          });
        } catch {
          // not an audio input
        }
      }

      // 3. Stream & Record Status
      let isStreaming = false;
      let isRecording = false;
      let streamTimecode = '00:00:00';
      let recordTimecode = '00:00:00';

      try {
        const streamStatus = await this.sendRequest('GetStreamStatus');
        isStreaming = streamStatus.outputActive;
        streamTimecode = streamStatus.outputTimecode || '00:00:00';
      } catch {}

      try {
        const recordStatus = await this.sendRequest('GetRecordStatus');
        isRecording = recordStatus.outputActive;
        recordTimecode = recordStatus.outputTimecode || '00:00:00';
      } catch {}

      this.updateState({
        scenes,
        currentProgramScene,
        currentPreviewScene,
        audioInputs,
        isStreaming,
        isRecording,
        streamTimecode,
        recordTimecode,
      });
    } catch (err) {
      console.warn('Failed to fetch OBS initial data:', err);
    }
  }

  private startPeriodicStats() {
    this.clearTimers();
    this.statsInterval = window.setInterval(async () => {
      if (this.state.connectionState !== 'connected') return;
      try {
        const stats = await this.sendRequest('GetStats');
        this.updateState({
          cpuUsage: Math.round(stats.cpuUsage || 0),
          memoryUsage: Math.round(stats.memoryUsage || 0),
          outputFps: Math.round(stats.activeFps || 60),
        });

        if (this.state.isStreaming) {
          const streamStatus = await this.sendRequest('GetStreamStatus');
          this.updateState({ streamTimecode: streamStatus.outputTimecode || this.state.streamTimecode });
        }
        if (this.state.isRecording) {
          const recordStatus = await this.sendRequest('GetRecordStatus');
          this.updateState({ recordTimecode: recordStatus.outputTimecode || this.state.recordTimecode });
        }
      } catch {}
    }, 2000);
  }

  /**
   * Handle OBS Real-time Events (OpCode 5)
   */
  private handleEvent(event: { eventType: string; eventData: any }) {
    const { eventType, eventData } = event;

    switch (eventType) {
      case 'CurrentProgramSceneChanged':
        this.updateState({ currentProgramScene: eventData.sceneName });
        break;
      case 'CurrentPreviewSceneChanged':
        this.updateState({ currentPreviewScene: eventData.sceneName });
        break;
      case 'SceneListChanged':
        this.fetchInitialData();
        break;
      case 'InputMuteStateChanged':
        this.updateState({
          audioInputs: this.state.audioInputs.map(input =>
            input.name === eventData.inputName ? { ...input, muted: eventData.inputMuted } : input
          ),
        });
        break;
      case 'InputVolumeChanged':
        this.updateState({
          audioInputs: this.state.audioInputs.map(input =>
            input.name === eventData.inputName
              ? { ...input, volumeDb: eventData.inputVolumeDb, volumeMul: eventData.inputVolumeMul }
              : input
          ),
        });
        break;
      case 'StreamStateChanged':
        this.updateState({
          isStreaming: eventData.outputActive,
          streamTimecode: eventData.outputActive ? this.state.streamTimecode : '00:00:00',
        });
        break;
      case 'RecordStateChanged':
        this.updateState({
          isRecording: eventData.outputActive,
          recordTimecode: eventData.outputActive ? this.state.recordTimecode : '00:00:00',
        });
        break;
      default:
        break;
    }
  }

  /**
   * Handle Request Response (OpCode 7)
   */
  private handleRequestResponse(data: { requestId: string; requestType: string; requestStatus: { result: boolean; code: number; comment?: string }; responseData?: any }) {
    const pending = this.pendingRequests.get(data.requestId);
    if (!pending) return;

    this.pendingRequests.delete(data.requestId);

    if (data.requestStatus.result) {
      pending.resolve(data.responseData || {});
    } else {
      pending.reject(new Error(data.requestStatus.comment || `OBS Error (${data.requestStatus.code})`));
    }
  }

  /**
   * Send Request to OBS (OpCode 6)
   */
  public sendRequest(requestType: string, requestData: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket não conectado'));
      }

      const requestId = 'req_' + Math.random().toString(36).substring(2, 9) + Date.now();
      this.pendingRequests.set(requestId, { resolve, reject });

      const payload = {
        op: 6,
        d: {
          requestType,
          requestId,
          requestData,
        },
      };

      this.ws.send(JSON.stringify(payload));

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Timeout na requisição ${requestType}`));
        }
      }, 5000);
    });
  }

  // --- High-level Public OBS Controls ---

  public async setScene(sceneName: string) {
    await this.sendRequest('SetCurrentProgramScene', { sceneName });
    this.updateState({ currentProgramScene: sceneName });
  }

  public async toggleMute(inputName: string) {
    const res = await this.sendRequest('ToggleInputMute', { inputName });
    const isMuted = res.inputMuted;
    this.updateState({
      audioInputs: this.state.audioInputs.map(input =>
        input.name === inputName ? { ...input, muted: isMuted } : input
      ),
    });
    return isMuted;
  }

  public async setInputVolume(inputName: string, volumeMul: number) {
    const clamped = Math.max(0, Math.min(1, volumeMul));
    await this.sendRequest('SetInputVolume', { inputName, inputVolumeMul: clamped });
    this.updateState({
      audioInputs: this.state.audioInputs.map(input =>
        input.name === inputName ? { ...input, volumeMul: clamped } : input
      ),
    });
  }

  public async toggleStream() {
    const res = await this.sendRequest('ToggleStream');
    this.updateState({ isStreaming: res.outputActive });
  }

  public async toggleRecord() {
    const res = await this.sendRequest('ToggleRecord');
    this.updateState({ isRecording: res.outputActive });
  }

  public async triggerHotkey(hotkeyName: string) {
    await this.sendRequest('TriggerHotkeyByName', { hotkeyName });
  }
}

export const obsClient = new OBSClient();
