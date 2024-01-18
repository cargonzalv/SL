import { Session } from './services/session';
import { Storage } from './lib/storage';
import { delay } from './lib/delay';
import { Config } from './services/config';
import { heartbeatServiceUrl, tizenWebapiUrl } from './constants';
import { Main } from './pre.main';
// ts
import { systeminfo } from 'tizen-common-web';
const { getCapability } = systeminfo;

getCapability('http://tizen.org/feature/screen');

let app = tizen.application.getCurrentApplication();
console.log("Current application's app id is " + app.appInfo.id);

const spsLib = new Main(new Session(new Storage()), new Config());
const samKey = (window as any).SAM_KEY;

export async function getSession() {
  if (spsLib.isLoading) {
    await delay(50).then(async () => {
      return await getSession();
    });
  }
  return await spsLib.getSession();
}
try {
  fetch(tizenWebapiUrl).then((res) => {
    if (!res.ok) {
      return console.warn('Tizen WebAPI is not available');
    }
    let ele = document.createElement('script');
    ele.src = tizenWebapiUrl;
    document.head.appendChild(ele);
  });
} catch (err) {}

window.addEventListener('load', async () => {
  const deviceId = await spsLib.getDeviceId(window);
  let appId = await spsLib.parseAppId(spsLib);
  const platform = await spsLib.getPlatform(window);
  const clientKey = spsLib.getClientKey(samKey);
  const spsInfo = spsLib.getSpsInfo();
  spsLib.createSession(deviceId, appId, platform, clientKey, spsInfo).then((session) => {
    spsLib.isLoading = false;
  });
});