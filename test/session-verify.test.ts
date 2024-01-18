import {Session} from '../src/services/session';
import {Storage} from '../src/lib/storage';
import {guid} from '../src/lib/guid';
import {sessionErrorId} from '../src/constants';
import {Main} from '../src/pre.main';
import {Config} from '../src/services/config';
import axios from 'axios';
import DoneCallback = jest.DoneCallback;
import ProvidesCallback = jest.ProvidesCallback;

const sessionService = new Session(new Storage());

describe('sps-library create session behavior', () => {
    describe('verify request payload for session service', () => {
        it('should send required values', async () => {
            const formReq = {
                params: {
                    appId: '8addb4df-e9b0-4d15-a0a1-55a419b06656',
                    deviceId: '5b363228-0bcf-48d8-8778-963bf0bc6bc0',
                    platform: 'tizen',
                    timestamp: new Date().toISOString(),
                    clientKey: 1234,
                    spsInfo: '{version:}',
                },
                url: 'https://sps-session.adgear.com/sessionId',
            };
            let main = new Main(sessionService, new Config());
            const spy = jest.spyOn(main, 'makeRequest');
            spy.mockImplementation(
                async (
                    params: {
                        appId: string;
                        deviceId: string;
                        platform: string;
                        timestamp: string;
                        clientKey: number;
                        spsInfo: string;
                    },
                    url: string,
                ) => {
                    expect(params.deviceId).toEqual(
                        '5b363228-0bcf-48d8-8778-963bf0bc6bc0',
                    );
                    expect(params.appId).toEqual('8addb4df-e9b0-4d15-a0a1-55a419b06656');
                    expect(params.platform).toEqual('tizen');
                    expect(params.timestamp).not.toEqual(null);
                    expect(url).toEqual('https://sps-session.adgear.com/sessionId');
                    expect(params.clientKey).toEqual(1234);
                    expect(params.spsInfo).toEqual("{version:}");
                    return {data: {sessionId: ''}};
                },
            );

            const newResult = await main.createSession(
                '5b363228-0bcf-48d8-8778-963bf0bc6bc0',
                '8addb4df-e9b0-4d15-a0a1-55a419b06656',
                'tizen',
                1234,
                '{version:}'
            );
            expect(spy).toHaveBeenCalled();
        });
    });
  describe('describe parseId function', () => {
    it('checks the appId', async () => {
      let main = new Main(sessionService, new Config());
      const getAppIdByTizen = jest.spyOn(main, 'getAppIdByTizen');
      getAppIdByTizen.mockImplementation((window) => {
        return new Promise((resolve) => {
          resolve({ appInfo: { id: 1 } });
        });
      });
      const id = await main.parseAppId(main);
      expect(getAppIdByTizen).toHaveBeenCalled();
    });
  });
});
