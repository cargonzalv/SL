import { Storage } from '../lib/storage';
import { AxiosResponse } from 'axios';
import { sessionErrorId } from '../constants';

export class Session {
  constructor(private readonly storage: Storage<string>) {}

  async create(
    request: AxiosResponse<any, any> | { data: { sessionId: string } },
    params: object,
  ): Promise<ISession> {
    const currentSession = await this.get();
    if (currentSession?.sessionId) {
      return currentSession;
    }
    //if we didn't get a good response from session web service then we'll just create a session with a hardcoded id
    if (!request?.data?.sessionId) {
      request.data = { sessionId: sessionErrorId };
    }

    return await this.set({ ...request.data, ...params });
  }

  async set(session: ISession): Promise<ISession> {
    await this.storage.set('session', JSON.stringify(session));
    return session;
  }

  async get(): Promise<ISession> {
    let session: string = await this.storage.get('session');
    if (!session) {
      session = JSON.stringify({ sessionId: '' });
    }
    return JSON.parse(session);
  }
}
