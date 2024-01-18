import {Session} from '../src/services/session';
import {Storage} from '../src/lib/storage';
import {Main} from '../src/pre.main';
import {Config} from '../src/services/config';

const sessionService = new Session(new Storage());

describe('testing getClientKey function', () => {
    test('getClientKey should return number for valid numeric input otherwise 0', () => {
        let main = new Main(sessionService, new Config());
        let undefinedKey = (window as any).TEST_KEY;
        expect(main.getClientKey("123")).toEqual(123);
        expect(main.getClientKey(123)).toEqual(123);
        expect(main.getClientKey("ABC")).toEqual(0);
        expect(main.getClientKey(undefinedKey)).toEqual(0);
    });
});

describe('testing getSpsInfo function', () => {
    test('getSpsInfo should return version value of spsLibVersion', () => {
        let main = new Main(sessionService, new Config());
        expect(main.getSpsInfo()).toEqual(`{version:}`);
    });
});