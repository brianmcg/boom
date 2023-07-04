import Mouse, { BUTTONS } from './components/Mouse';
import Keyboard, { KEYS } from './components/Keyboard';

/**
 * Class representing an input controller.
 */
class InputController {
  /**
   * The HTML element to lock the mouse to.
   * @param  {Element} element The element to lock the mouse to.
   */
  constructor(element) {
    this.keyboard = new Keyboard();
    this.mouse = new Mouse(element);
    this.states = {};
  }

  /**
   * Add controls.
   * @param {String} state    The game state the controls are for.
   * @param {Object} controls The controls.
   */
  add(state, controls = {}) {
    if (this.states[state]) {
      Object.keys(controls).forEach(key => {
        if (this.states[state][key]) {
          Object.assign(this.states[state][key], controls[key]);
        } else {
          this.states[state][key] = controls[key];
        }
      });
    } else {
      this.states[state] = controls;
    }
  }

  /**
   * Set the controls for a game state.
   */
  set(state) {
    this.removeCallbacks();

    if (this.states[state]) {
      const { onKeyDown, onKeyUp, onMouseDown, onMouseUp, onMouseMove, onMouseWheel } =
        this.states[state];

      if (onKeyDown) {
        Object.keys(onKeyDown).forEach(name => {
          this.keyboard.get(name).onDown(onKeyDown[name]);
        });
      }

      if (onKeyUp) {
        Object.keys(onKeyUp).forEach(name => {
          this.keyboard.get(name).onUp(onKeyUp[name]);
        });
      }

      if (onMouseDown) {
        Object.keys(onMouseDown).forEach(name => {
          this.mouse.get(name).onDown(onMouseDown[name]);
        });
      }

      if (onMouseUp) {
        Object.keys(onMouseUp).forEach(name => {
          this.mouse.get(name).onUp(onMouseUp[name]);
        });
      }

      if (onMouseMove) {
        this.mouse.onMove(onMouseMove.callback);
      }

      if (onMouseWheel) {
        this.mouse.onWheel(onMouseWheel.callback);
      }
    }
  }

  /**
   * Reset the input controller.
   */
  reset() {
    this.removeCallbacks();
    this.states = {};
  }

  /**
   * Remove all added callbacks.
   */
  removeCallbacks() {
    this.keyboard.removeCallbacks();
    this.mouse.removeCallbacks();
  }
}

export { BUTTONS, KEYS };

export default InputController;
