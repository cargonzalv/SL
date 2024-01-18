import { Session } from '../src/services/session';
import { Storage } from '../src/lib/storage';
import axios from 'axios';
import { guid } from '../src/lib/guid';

jest.mock('axios');

jest.spyOn(axios, 'post').mockImplementation(() => {
  return Promise.resolve({
    data: {
      id: guid(),
    },
  });
});

const sessionService = new Session(new Storage());

const createSession = async (sessionService: Session) => {
  const params = {
    appId: '8addb4df-e9b0-4d15-a0a1-55a419b06656',
    deviceId: '5b363228-0bcf-48d8-8778-963bf0bc6bc0',
    platform: 'tizen',
    timestamp: Date.now(),
    clientKey: 1234,
    spsInfo: "{version:}"  
  };
  const request = await axios.post('', params);

  return await sessionService.create(request, params);
};

describe('sps-library session behavior', () => {
  describe('working session service', () => {
    it('should return new 2nd session', async () => {
      await createSession(sessionService);
      const firstSession = await sessionService.get();
      await createSession(sessionService);
      const secondSession = await sessionService.get();
      expect(firstSession).toEqual(secondSession);
    });

    it('should return new 2nd session', async () => {
      await createSession(sessionService);
      const firstSession = await sessionService.get();
      //this would be like closing the app and opening it again
      window.sessionStorage.clear();
      await createSession(sessionService);
      const secondSession = await sessionService.get();
      expect(firstSession).not.toEqual(secondSession);
    });
  });
});
