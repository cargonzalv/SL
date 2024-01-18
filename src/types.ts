interface TizenWebAppType extends Window {
  tizen: any | undefined;
}

type ISessionId = string;

interface ConfigType {
  deviceId: string;
  platform: string;
  appid: string;
}

interface ISessionType {
  id: ISessionId;
}

interface ISession {
  sessionId: ISessionId;
  deviceId: string;
  appId: string;
  timestamp: string;
}

interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface ISessionServiceResponse {
  id: string;
}

interface IHeartbeatEvent {
  eventTime: string;
  eventType: string;
  eventMetas: string;
}

interface IHeartbeat {
  events: IHeartbeatEvent[];
  diamondAppId?: string;
  samSessionId?: string;
  timestamp: string;
  type: 'heartbeat';
}