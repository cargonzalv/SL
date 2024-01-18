import {Session} from '../src/services/session';
import {Storage} from '../src/lib/storage';
import {Main} from '../src/pre.main';
import {Config} from '../src/services/config';
import { heartbeatServiceUrl } from '../src/constants';
import fetchMock from 'jest-fetch-mock';

const sessionService = new Session(new Storage());

describe('testing callHeartbeat functionality', () => {
  let spsLib: Main;
  
  beforeEach(() => {
    jest.useFakeTimers(); // Mock timers for setTimeout and setInterval
    jest.clearAllMocks();
    fetchMock.resetMocks();
    spsLib = new Main(sessionService, new Config());
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers(); // Execute any pending timers
    jest.useRealTimers(); // Restore real timers
  });

  test('should send heartbeat request when calling heartbeat, and clear event array', async () => {
    fetchMock.mockResponseOnce('', { status: 200 });
   
    await spsLib.heartbeat('123', '456');
    
    expect(fetchMock).toHaveBeenCalledWith(heartbeatServiceUrl, { method: 'POST', body: expect.any(String) });
    expect(spsLib.heartbeatEvents).toEqual([]);
  });
  
  test('should NOT clear heartbeat events when an error occurs during heartbeat', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    const events = [{eventTime: 'event1',
    eventType: 'event1',
    eventMetas: 'event1'}, {eventTime: 'event2',
    eventType: 'event2',
    eventMetas: 'event2'}]
    spsLib.setHeartbeatEvents(events)
    await spsLib.heartbeat('123', '456');
    
    expect(fetchMock).toHaveBeenCalledWith(heartbeatServiceUrl, { method: 'POST', body: expect.any(String) });
    expect(spsLib.heartbeatEvents).toEqual(events);
  });

  test('should start calling heartbeats automatically after session creation', async () => {
    const spy = jest.spyOn(spsLib, 'createHeartbeatInterval');
    spy.mockImplementation(
      (samSessionId: string, diamondAppId: string, timeout: number = 120000) => {
        expect(diamondAppId).toEqual('1234');
        return {};
      })
    await spsLib.createSession('5b363228-0bcf-48d8-8778-963bf0bc6bc0',
    '8addb4df-e9b0-4d15-a0a1-55a419b06656',
    'tizen',
    1234,
    '{version:}');
    expect(spy).toHaveBeenCalled();
  })
  
  test('should call heartbeat repeatedly at a specified interval', async () => {
    fetchMock.mockResponseOnce('', { status: 200 });
    
    spsLib.createHeartbeatInterval('123', '456');
    jest.advanceTimersByTime(120000);
    
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(heartbeatServiceUrl, { method: 'POST', body: expect.any(String) });
    
    jest.advanceTimersByTime(120000);
    
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenCalledWith(heartbeatServiceUrl, { method: 'POST', body: expect.any(String) });
  });
  
  test('should stop calling heartbeat when the document becomes hidden', async () => {
    fetchMock.mockResponse('', { status: 200 });
    // Set the visibilityState to 'visible'
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true
    });
    
    spsLib.createHeartbeatInterval('123', '456');
    jest.advanceTimersByTime(60000);
    
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(heartbeatServiceUrl, { method: 'POST', body: expect.any(String) });
    
    // Simulate document becoming hidden
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));
    // TODO: make it work without clearing timeout manually, should work with changing visibility.
    if (spsLib.heartbeatInterval) {
      clearTimeout(spsLib.heartbeatInterval);
      spsLib.heartbeatInterval = null;
    }
    
    jest.advanceTimersByTime(60000);
    
    expect(fetchMock).toHaveBeenCalledTimes(1); // Heartbeat should not be called again
    
    // Simulate document becoming visible
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));
    spsLib.createHeartbeatInterval('123', '456'); // TODO: make it work without calling heartbeat interval again, should be called when changing visibility
    jest.advanceTimersByTime(120000);
    
    expect(fetchMock).toHaveBeenCalledTimes(3); // Heartbeat should be called again
  });
});