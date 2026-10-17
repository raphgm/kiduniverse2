import { AuthArchitectureMode, DecodedToken, NetworkLogEntry, ChildProfile, ParentUser } from '../types';

export interface ArchitectureState {
  mode: AuthArchitectureMode;
  canaryPercent: number; // 0 to 100% traffic routed to AKS Auth Microservice
  monolithHealthy: boolean;
  aksAuthHealthy: boolean;
  csiSecretMounted: boolean;
  activeKeyVaultSecretVersion: string;
  totalRequestsHandled: {
    monolith: number;
    aks: number;
  };
}

function safeBase64UrlEncode(obj: unknown): string {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return 'token_payload';
  }
}

class AuthSimulatorService {
  private state: ArchitectureState = {
    mode: 'monolith',
    canaryPercent: 0,
    monolithHealthy: true,
    aksAuthHealthy: true,
    csiSecretMounted: true,
    activeKeyVaultSecretVersion: '7f91a82d-azure-kv-2026',
    totalRequestsHandled: {
      monolith: 14,
      aks: 0,
    },
  };

  private networkLogs: NetworkLogEntry[] = [];
  private logListeners: ((logs: NetworkLogEntry[]) => void)[] = [];
  private stateListeners: ((state: ArchitectureState) => void)[] = [];

  constructor() {
    // Seed initial realistic baseline request log
    this.addLog({
      id: 'init-01',
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
      method: 'GET',
      endpoint: '/api/v1/healthz',
      status: 200,
      latencyMs: 142,
      handledBy: 'monolith',
      authType: 'Anonymous',
      requestHeaders: {
        'Host': 'kiddopia.monolith.internal',
        'User-Agent': 'KiddopiaApp/2.4 (KidsTablet; OS 18.2)',
      },
      responseSnippet: '{"status":"healthy","uptime_seconds":89230,"database_pool":"active"}',
    });
  }

  public getState(): ArchitectureState {
    return { ...this.state };
  }

  public setMode(mode: AuthArchitectureMode) {
    this.state.mode = mode;
    if (mode === 'extracted' && this.state.canaryPercent === 0) {
      this.state.canaryPercent = 25; // default initial canary
    }
    this.notifyState();
  }

  public setCanaryPercent(percent: number) {
    this.state.canaryPercent = Math.min(100, Math.max(0, percent));
    if (this.state.canaryPercent > 0) {
      this.state.mode = 'extracted';
    }
    this.notifyState();
  }

  public toggleMonolithHealth(healthy?: boolean) {
    this.state.monolithHealthy = healthy !== undefined ? healthy : !this.state.monolithHealthy;
    this.notifyState();
  }

  public toggleAksHealth(healthy?: boolean) {
    this.state.aksAuthHealthy = healthy !== undefined ? healthy : !this.state.aksAuthHealthy;
    this.notifyState();
  }

  public getNetworkLogs(): NetworkLogEntry[] {
    return [...this.networkLogs];
  }

  public clearLogs() {
    this.networkLogs = [];
    this.notifyLogs();
  }

  public subscribeLogs(cb: (logs: NetworkLogEntry[]) => void) {
    this.logListeners.push(cb);
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== cb);
    };
  }

  public subscribeState(cb: (state: ArchitectureState) => void) {
    this.stateListeners.push(cb);
    return () => {
      this.stateListeners = this.stateListeners.filter((s) => s !== cb);
    };
  }

  private notifyLogs() {
    this.logListeners.forEach((cb) => cb([...this.networkLogs]));
  }

  private notifyState() {
    this.stateListeners.forEach((cb) => cb({ ...this.state }));
  }

  private addLog(log: NetworkLogEntry) {
    this.networkLogs.unshift(log);
    if (this.networkLogs.length > 50) {
      this.networkLogs.pop();
    }
    this.notifyLogs();
  }

  /**
   * Simulates the APIM router decision based on canary percent and active architecture
   */
  private determineRouterTarget(endpoint: string): 'monolith' | 'aks-auth-service' {
    const isAuthEndpoint = endpoint.includes('/auth') || endpoint.includes('/parent/verify');

    // If it's pure content (stories, math assets), monolith handles it
    if (!isAuthEndpoint) {
      return 'monolith';
    }

    if (this.state.mode === 'monolith') {
      return 'monolith';
    }

    // Roll dice against canary percentage in APIM
    const roll = Math.random() * 100;
    if (roll < this.state.canaryPercent) {
      return 'aks-auth-service';
    }
    return 'monolith';
  }

  /**
   * Generates a realistic decoded JWT token according to Azure Entra ID / OIDC conventions
   */
  public createTokenForChild(child: ChildProfile): { tokenString: string; decoded: DecodedToken } {
    const isExtracted = this.state.mode === 'extracted';
    const nowSec = Math.floor(Date.now() / 1000);

    const decoded: DecodedToken = {
      header: {
        alg: isExtracted ? 'RS256' : 'HS256',
        typ: 'JWT',
        kid: isExtracted ? 'azure-keyvault-kiddopia-2026' : undefined,
      },
      payload: {
        sub: child.id,
        iss: isExtracted ? 'https://aks-auth.skill-sch.azure/v2' : 'https://monolith.kiddopia.internal/auth',
        aud: 'https://api.kiddopia.io/kids',
        exp: nowSec + 3600 * 4, // 4 hours
        iat: nowSec,
        tenant_id: 'azure-sub-skill-sch-kiddopia',
        role: 'child',
        user_id: child.id,
        user_name: child.name,
        avatar: child.avatar,
        age: child.age,
        family_id: 'fam-sarah-jenkins',
        scope: 'read:stories read:math write:doodles write:stars',
        auth_provider: isExtracted ? 'azure_aks_auth_v2' : 'monolith_legacy',
        vault_key_version: isExtracted ? this.state.activeKeyVaultSecretVersion : undefined,
      },
    };

    const headerB64 = safeBase64UrlEncode(decoded.header);
    const payloadB64 = safeBase64UrlEncode(decoded.payload);
    const sigMock = isExtracted ? 'cZ9_azureAkSSignatureHashMock' : 'm7X_monolithCookieHash';
    const tokenString = `${headerB64}.${payloadB64}.${sigMock}`;

    return { tokenString, decoded };
  }

  public createTokenForParent(parent: ParentUser): { tokenString: string; decoded: DecodedToken } {
    const isExtracted = this.state.mode === 'extracted';
    const nowSec = Math.floor(Date.now() / 1000);

    const decoded: DecodedToken = {
      header: {
        alg: isExtracted ? 'RS256' : 'HS256',
        typ: 'JWT',
        kid: isExtracted ? 'azure-keyvault-kiddopia-2026' : undefined,
      },
      payload: {
        sub: parent.id,
        iss: isExtracted ? 'https://aks-auth.skill-sch.azure/v2' : 'https://monolith.kiddopia.internal/auth',
        aud: 'https://api.kiddopia.io/parent-portal',
        exp: nowSec + 1800, // 30 minutes
        iat: nowSec,
        tenant_id: 'azure-sub-skill-sch-kiddopia',
        role: 'parent',
        user_id: parent.id,
        user_name: parent.parentName,
        family_id: 'fam-sarah-jenkins',
        scope: 'admin:screentime admin:profiles write:settings read:audit-logs',
        auth_provider: isExtracted ? 'azure_aks_auth_v2' : 'monolith_legacy',
        vault_key_version: isExtracted ? this.state.activeKeyVaultSecretVersion : undefined,
      },
    };

    const headerB64 = safeBase64UrlEncode(decoded.header);
    const payloadB64 = safeBase64UrlEncode(decoded.payload);
    const sigMock = isExtracted ? 'vP4_azureOidcParentSigRS256' : 'l1K_monolithAdminCookie';
    const tokenString = `${headerB64}.${payloadB64}.${sigMock}`;

    return { tokenString, decoded };
  }

  /**
   * Simulates child login through APIM and either Monolith or AKS Microservice
   */
  public async loginChild(child: ChildProfile): Promise<{ success: boolean; token: string; decoded: DecodedToken; handledBy: string; latency: number }> {
    const endpoint = '/api/v1/auth/login/child';
    const target = this.determineRouterTarget(endpoint);

    const isAks = target === 'aks-auth-service';
    const latency = isAks ? Math.floor(22 + Math.random() * 20) : Math.floor(115 + Math.random() * 65);

    // Check upstream health
    if (!isAks && !this.state.monolithHealthy) {
      this.addLog({
        id: `req-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        endpoint,
        status: 503,
        latencyMs: latency,
        handledBy: 'monolith',
        authType: 'Anonymous',
        requestHeaders: {
          'Host': 'apim-kiddopia.azure-api.net',
          'X-APIM-Canary-Percent': `${this.state.canaryPercent}%`,
          'Content-Type': 'application/json',
        },
        responseSnippet: '{"error":"ServiceUnavailable","message":"Monolith backend container is crashing under load (Deadlock on UserSession table)"}',
      });
      throw new Error('Monolith container is unreachable (Simulated Outage). In Monolith mode, Auth is tightly coupled to core database!');
    }

    if (isAks && !this.state.aksAuthHealthy) {
      this.addLog({
        id: `req-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        endpoint,
        status: 502,
        latencyMs: latency,
        handledBy: 'aks-auth-service',
        authType: 'Anonymous',
        requestHeaders: {
          'Host': 'apim-kiddopia.azure-api.net',
          'X-APIM-Canary-Target': 'aks-auth-service.kiddopia-core.svc.cluster.local',
        },
        responseSnippet: '{"error":"BadGateway","message":"AKS auth-pod replica pool unavailable"}',
      });
      throw new Error('AKS Auth Pod is temporarily unhealthy.');
    }

    // Success login
    const { tokenString, decoded } = this.createTokenForChild(child);

    if (isAks) {
      this.state.totalRequestsHandled.aks += 1;
    } else {
      this.state.totalRequestsHandled.monolith += 1;
    }
    this.notifyState();

    this.addLog({
      id: `req-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      endpoint,
      status: 200,
      latencyMs: latency,
      handledBy: target,
      authType: isAks ? 'Bearer-JWT' : 'Session-Cookie',
      requestHeaders: {
        'Host': 'apim-kiddopia.azure-api.net',
        'X-APIM-Route-Policy': isAks ? `Canary -> AKS (${this.state.canaryPercent}%)` : 'Default -> Monolith',
        'X-Forwarded-For': '192.168.1.104',
        'Content-Type': 'application/json',
      },
      responseSnippet: JSON.stringify({
        status: 'authenticated',
        user: child.name,
        avatar: child.avatar,
        token_type: isAks ? 'Bearer' : 'Cookie',
        expires_in: 14400,
        provider: decoded.payload.auth_provider,
        vault_key_version: decoded.payload.vault_key_version || 'n/a',
      }),
      decodedToken: decoded.payload,
    });

    return {
      success: true,
      token: tokenString,
      decoded,
      handledBy: target,
      latency,
    };
  }

  /**
   * Simulates parent PIN validation
   */
  public async verifyParentPin(pin: string, parent: ParentUser): Promise<{ success: boolean; token?: string; decoded?: DecodedToken; handledBy: string; latency: number }> {
    const endpoint = '/api/v1/parent/verify-pin';
    const target = this.determineRouterTarget(endpoint);
    const isAks = target === 'aks-auth-service';
    const latency = isAks ? Math.floor(25 + Math.random() * 18) : Math.floor(130 + Math.random() * 50);

    if (!isAks && !this.state.monolithHealthy) {
      this.addLog({
        id: `req-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        endpoint,
        status: 503,
        latencyMs: latency,
        handledBy: 'monolith',
        authType: 'Session-Cookie',
        requestHeaders: {
          'Host': 'apim-kiddopia.azure-api.net',
        },
        responseSnippet: '{"error":"MonolithDown"}',
      });
      throw new Error('Monolith backend unavailable during parent verification.');
    }

    const isValid = pin === parent.pin;

    if (!isValid) {
      this.addLog({
        id: `req-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        endpoint,
        status: 401,
        latencyMs: latency,
        handledBy: target,
        authType: isAks ? 'Bearer-JWT' : 'Session-Cookie',
        requestHeaders: {
          'Host': 'apim-kiddopia.azure-api.net',
          'X-Security-Policy': 'Strict-Parent-Challenge',
        },
        responseSnippet: '{"error":"Unauthorized","message":"Invalid Parent PIN provided"}',
      });
      return { success: false, handledBy: target, latency };
    }

    const { tokenString, decoded } = this.createTokenForParent(parent);

    if (isAks) {
      this.state.totalRequestsHandled.aks += 1;
    } else {
      this.state.totalRequestsHandled.monolith += 1;
    }
    this.notifyState();

    this.addLog({
      id: `req-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      endpoint,
      status: 200,
      latencyMs: latency,
      handledBy: target,
      authType: isAks ? 'Bearer-JWT' : 'Session-Cookie',
      requestHeaders: {
        'Host': 'apim-kiddopia.azure-api.net',
        'X-APIM-Route-Policy': isAks ? 'AKS-Auth-Microservice-v2' : 'Monolith-Core',
        'Authorization': isAks ? `Bearer ${tokenString.slice(0, 18)}...` : 'Cookie: session_id=sid_91823',
      },
      responseSnippet: JSON.stringify({
        verified: true,
        role: 'parent',
        scope: decoded.payload.scope,
        azure_keyvault_bound: isAks,
      }),
      decodedToken: decoded.payload,
    });

    return {
      success: true,
      token: tokenString,
      decoded,
      handledBy: target,
      latency,
    };
  }

  /**
   * Simulates non-auth kid action (e.g., fetching a story or recording stars)
   */
  public logAppAction(actionName: string, endpoint: string, tokenSnippet?: string) {
    const isExtracted = this.state.mode === 'extracted';
    const latency = Math.floor(40 + Math.random() * 45);

    this.addLog({
      id: `req-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      method: 'GET',
      endpoint,
      status: 200,
      latencyMs: latency,
      handledBy: 'monolith',
      authType: isExtracted ? 'Bearer-JWT' : 'Session-Cookie',
      requestHeaders: {
        'Host': 'apim-kiddopia.azure-api.net',
        'Authorization': isExtracted && tokenSnippet ? `Bearer ${tokenSnippet.slice(0, 15)}...` : 'Cookie: monolith_kid_sid=7a8b9c',
        'X-App-Action': actionName,
      },
      responseSnippet: `{"status":"ok","action":"${actionName}","persisted":true}`,
    });
  }
}

export const authSimulator = new AuthSimulatorService();
