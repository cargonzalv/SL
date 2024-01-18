import { Config } from '../src/services/config';
import { AdInfoManager, Webapis } from 'tizen-tv-webapis';

let windowMockGood = {
  webapis: {
    adinfo: {
      getTIFA: () => {
        return 'SOMEMADEUPTIFA';
      },
    } as AdInfoManager,
  } as Webapis,
} as Window;

let windowMockBad = {
  webapis: {
    adinfo: {} as unknown as AdInfoManager,
  } as Webapis,
} as Window;

describe('sps-library device config behavior', () => {
  it('should return unknown if method throws error because getTIFA is undefined', async () => {
    const config = new Config();

    const result = await config.getConfigValue(() =>
      windowMockBad.webapis.adinfo.getTIFA(),
    );

    expect(result).toBe('unknown');
  });

  it('should return TIFA', async () => {
    const config = new Config();

    const method = () => {
      return windowMockGood.webapis.adinfo.getTIFA();
    };

    const result = await config.getConfigValue(method);
    expect(result).toBe('SOMEMADEUPTIFA');
  });
});
