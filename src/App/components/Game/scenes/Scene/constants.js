export const STATES = {
  LOADING: 'loading',
  FADING_IN: 'fading:in',
  FADING_OUT: 'fading:out',
  PAUSING: 'scene:pausing',
  PAUSED: 'paused',
  UNPAUSING: 'scene:unpausing',
  RUNNING: 'running',
  PROMPTING: 'prompting',
  STOPPED: 'stopped',
};

export const EVENTS = {
  COMPLETE: 'scene:complete',
  RESTART: 'scene:restart',
  QUIT: 'scene:quit',
};

export const PAUSE_INCREMENT = 0.1;

export const FADE_INCREMENT = 0.035;

export const FADE_PIXEL_SIZE = 80;

export const PAUSE_PIXEL_SIZE = 4;
