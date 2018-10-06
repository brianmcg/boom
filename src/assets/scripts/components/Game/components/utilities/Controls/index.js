/**
 * Controls module.
 * @module Controls
 */

const keyCodeHash = {
  37: 'LEFT', // Arrows
  39: 'RIGHT',
  38: 'UP',
  40: 'DOWN',
  32: 'SPACE', // Actions
  17: 'CTRL',
  16: 'SHIFT',
  27: 'ESCAPE',
  13: 'ENTER',
  49: 'ONE', // Weapons
  50: 'TWO',
  51: 'THREE',
  52: 'FOUR',
  87: 'PAGE_UP', // Perspective
  83: 'PAGE_DOWN',
  97: 'END',
};

const Controls = Object.keys(keyCodeHash)
  .reduce((memo, key) => (
    Object.assign({}, memo, {
      [keyCodeHash[key]]: false,
    })
  ), {});

const onKey = (pressed, event) => {
  const state = keyCodeHash[event.keyCode];

  if (!state) {
    return;
  }

  Controls[state] = pressed;

  if (event.preventDefault) {
    event.preventDefault();
  }

  if (event.stopPropagation) {
    event.stopPropagation();
  }
};

document.addEventListener('keydown', onKey.bind(null, true), false);
document.addEventListener('keyup', onKey.bind(null, false), false);

export default Controls;
