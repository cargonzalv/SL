import { Session } from './services/session';
import { Config } from './services/config';
import { heartbeatServiceUrl, sessionServiceUrl, spsLibVersion } from './constants';
import axios from 'axios';


export class Main {
  public isLoading: boolean = true;
  heartbeatEvents: IHeartbeatEvent[] = [];
  public heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly session: Session, readonly device: Config) {}

  async getDeviceId(window: Window & typeof globalThis): Promise<string> {
    return await this.device.getConfigValue(() =>
      window.webapis.adinfo.getTIFA(),
    );
  }

  async parseAppId(spsLib: Main) {
    const appObj = await spsLib.getAppIdByTizen(window);
    let appId = '';
    const appJson = JSON.stringify(appObj);
    if (appJson) {
      appId = JSON.parse(appJson).appInfo.id;
    }
    return appId;
  }

  async getAppIdByTizen(window: Window & typeof globalThis): Promise<any> {
    return window.tizen.application.getCurrentApplication();
  }

  async getPlatform(window: Window & typeof globalThis): Promise<string> {
    return await this.device.getConfigValue(() =>
      window.webapis.adinfo.getTIFA() ? 'tizen' : 'web',
    );
  }

  getClientKey(value: string | number): number {
    if (value != null && value !== '' && !isNaN(Number(value.toString()))) {
      return Number(value);
    }
    return 0;
  }

  getSpsInfo(): string {
    return `{version:${spsLibVersion}}`;
  }

  getHeartbeatEvents(): IHeartbeatEvent[] {
    return this.heartbeatEvents;
  }

  setHeartbeatEvents(events: IHeartbeatEvent[]) {
    this.heartbeatEvents = events;
  }

  async heartbeat(samSessionId: string, diamondAppId: string) {
    const body = {
      diamondAppId,
      samSessionId,
      type: "heartbeat",
      timestamp: new Date().toISOString(),
      events: this.getHeartbeatEvents()
    };
    try {
      await fetch(heartbeatServiceUrl, { method: 'POST', body: JSON.stringify(body) });
      this.setHeartbeatEvents([]);
    } catch(err) {
    }
  }

  createHeartbeatInterval(samSessionId: string, diamondAppId: string, timeout: number = 120000) {
    if (!this.heartbeatInterval) {
      this.heartbeat(samSessionId, diamondAppId);
      this.heartbeatInterval = setInterval(() => this.heartbeat(samSessionId, diamondAppId), timeout);
    } else {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.heartbeat(samSessionId, diamondAppId);
        } else if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
      });
    }
  }

  async createSession(
    deviceId: string,
    appId: string,
    platform: string,
    clientKey: number,
    spsInfo: string,
  ): Promise<ISession> {
    const currentSession = await this.session.get();

    if (currentSession?.sessionId) {
      return currentSession;
    }

    const params = {
      appId,
      deviceId,
      platform,
      timestamp: new Date().toISOString(),
      clientKey,
      spsInfo,
    };

    let request = await this.makeRequest(params, sessionServiceUrl);
    const session = await this.session.create(request, params);
    // Start heartbeats after session is created
    this.createHeartbeatInterval(session.sessionId, clientKey.toString());
    return session;
  }

  async makeRequest(
    params: {
      appId: string;
      deviceId: string;
      platform: string;
      timestamp: string;
      clientKey: number;
      spsInfo: string;
    },
    url: string,
  ) {
    let requests = await axios
      .post(url, params, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 3000,
      })
      .catch((err) => {
        console.warn('Session service is not available');
        return { data: { sessionId: '' } };
      });
    return requests;
  }

  async getSession(): Promise<ISession> {
    return await this.session.get();
  }
}
