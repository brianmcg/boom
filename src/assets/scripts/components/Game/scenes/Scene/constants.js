/**
 * The scene states.
 * @type {Object}
 */
export const STATES = {
  LOADING: 'loading',
  FADING_IN: 'fading:in',
  FADING_OUT: 'fading:out',
  PAUSED: 'paused',
  RUNNING: 'running',
  PROMPTING: 'prompting',
  STOPPED: 'stopped',
};

/**
 * The scene events.
 * @type {Object}
 */
export const EVENTS = {
  COMPLETE: 'scene:complete',
  RESTART: 'scene:restart',
  QUIT: 'scene:quit',
};

/**
 * The scene types.
 * @type {Object}
 */
export const TYPES = {
  TITLE: 'title',
  WORLD: 'world',
  CREDITS: 'credits',
};
