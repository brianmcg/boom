/**
 * @module game-manual/constants
 */

/**
 * The key controls map.
 * @type {Object}
 */
export const KEYS = {
  cols: [
    'action',
    'key',
  ],
  rows: [{
    action: 'forward',
    key: 'up arrow',
  }, {
    action: 'backward',
    key: 'down arrow',
  }, {
    action: 'left',
    key: 'left arrow',
  }, {
    action: 'right',
    key: 'right arrow',
  }, {
    action: 'open',
    key: 'space',
  }, {
    action: 'fire',
    key: 'ctrl',
  }, {
    action: 'crouch',
    key: 'shift',
  }, {
    action: 'menu',
    key: 'escape',
  }],
};

/**
 * The title.
 * @type {String}
 */
export const TITLE = 'Goon Controls';

/**
 * The button text.
 * @type {String}
 */
export const BUTTON_TEXT = 'Click to play';
