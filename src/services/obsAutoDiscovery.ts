/**
 * Plug-and-Play OBS Auto-Discovery & Port Scanner
 * Scans local USB ports (ADB reverse on localhost:4455) and LAN endpoints
 * to instantly detect running OBS WebSocket servers without manual setup.
 */

export interface ScanTarget {
  host: string;
  port: number;
  label: string;
  type: 'usb' | 'wifi' | 'custom';
}

export interface ScanResult {
  success: boolean;
  target?: ScanTarget;
  version?: string;
  error?: string;
  latencyMs?: number;
}

export class OBSAutoDiscoveryService {
  /**
   * Get intelligent candidates based on runtime environment (USB ADB reverse or Wi-Fi LAN host)
   */
  public static getCandidateTargets(customHost?: string): ScanTarget[] {
    const targets: ScanTarget[] = [
      // 1. USB Connection via ADB Reverse (standard OBS v5 port)
      { host: 'localhost', port: 4455, label: 'Cabo USB (localhost:4455)', type: 'usb' },
      { host: '127.0.0.1', port: 4455, label: 'Cabo USB IP Loopback (127.0.0.1:4455)', type: 'usb' },
      // 2. Legacy OBS WebSocket v4 on USB
      { host: 'localhost', port: 4444, label: 'Cabo USB Legado (localhost:4444)', type: 'usb' },
    ];

    // If app is opened from a phone browsing a local IP (e.g., 192.168.1.100:3000),
    // the host computer running OBS is almost certainly the exact same IP!
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const currentHost = window.location.hostname;
      targets.push(
        { host: currentHost, port: 4455, label: `Wi-Fi Automático (${currentHost}:4455)`, type: 'wifi' },
        { host: currentHost, port: 4444, label: `Wi-Fi Legado (${currentHost}:4444)`, type: 'wifi' }
      );
    }

    if (customHost && customHost !== 'localhost' && customHost !== '127.0.0.1') {
      targets.push(
        { host: customHost, port: 4455, label: `Host Personalizado (${customHost}:4455)`, type: 'custom' },
        { host: customHost, port: 4444, label: `Host Personalizado (${customHost}:4444)`, type: 'custom' }
      );
    }

    return targets;
  }

  /**
   * Rapidly probe a single WebSocket endpoint to see if OBS Studio answers
   */
  public static async probeEndpoint(
    target: ScanTarget,
    timeoutMs = 1500
  ): Promise<ScanResult> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let resolved = false;
      let ws: WebSocket | null = null;
      let timer: number | null = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (ws) {
          try {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;
            ws.close();
          } catch {
            // ignore cleanup errors
          }
        }
      };

      const finish = (result: ScanResult) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(result);
        }
      };

      timer = window.setTimeout(() => {
        finish({
          success: false,
          target,
          error: `Tempo limite de resposta excedido (${timeoutMs}ms)`,
        });
      }, timeoutMs);

      try {
        const url = `ws://${target.host}:${target.port}`;
        ws = new WebSocket(url);

        ws.onopen = () => {
          // Socket opened! Now wait for OpCode 0 (Hello) or close if silent
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            // OBS WebSocket v5 starts with OpCode 0 (Hello message)
            if (data.op === 0 || data['obs-websocket-version'] || data.obsWebSocketVersion) {
              const latency = Math.round(performance.now() - startTime);
              const version = data.d?.obsWebSocketVersion || data['obs-websocket-version'] || 'v5';
              finish({
                success: true,
                target,
                version,
                latencyMs: latency,
              });
              return;
            }
          } catch {
            // Non-JSON or handshake failure
          }
          // If we got message but not standard hello, consider it connected
          const latency = Math.round(performance.now() - startTime);
          finish({
            success: true,
            target,
            version: 'OBS Detectado',
            latencyMs: latency,
          });
        };

        ws.onerror = () => {
          finish({
            success: false,
            target,
            error: 'Porta recusou conexão ou fechada',
          });
        };

        ws.onclose = () => {
          finish({
            success: false,
            target,
            error: 'Conexão encerrada',
          });
        };
      } catch (err: any) {
        finish({
          success: false,
          target,
          error: err?.message || 'Falha ao iniciar WebSocket',
        });
      }
    });
  }

  /**
   * Scan candidate endpoints in fast sequence / parallel and return the first active one
   */
  public static async autoScanAndFind(
    customHost?: string,
    onStep?: (target: ScanTarget, status: 'testing' | 'success' | 'failed') => void
  ): Promise<ScanResult> {
    const candidates = this.getCandidateTargets(customHost);

    for (const target of candidates) {
      if (onStep) onStep(target, 'testing');
      const res = await this.probeEndpoint(target, 1400);
      if (res.success) {
        if (onStep) onStep(target, 'success');
        return res;
      }
      if (onStep) onStep(target, 'failed');
    }

    return {
      success: false,
      error: 'Nenhum OBS Studio detectado nas portas padrões (4455/4444). Verifique se o OBS e o WebSocket estão ativos.',
    };
  }
}
