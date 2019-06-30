/**
 * @module engine/components/door/constants
 */

/**
 * The door states.
 * @type {Object}
 */
export const STATES = {
  OPENING: 'door:opening',
  OPENED: 'door:opened',
  CLOSING: 'door:closing',
  CLOSED: 'door:closed',
};

/**
 * The door events.
 * @type {Object}
 */
export const EVENTS = {
  LOCKED: 'door:locked',
};

/**
 * The door default values.
 * @type {Object}
 */
export const DEFAULTS = {
  AXIS: 'x',
  SPEED: 1,
  WAIT_TIME: 2000,
};
