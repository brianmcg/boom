import Mouse from './components/Mouse';
import Keyboard from './components/Keyboard';

export default class InputController {
  constructor(element) {
    this.keyboard = new Keyboard();
    this.mouse = new Mouse(element);
    this.states = {};
  }

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

  set(state) {
    this.removeCallbacks();

    if (this.states[state]) {
      const {
        onKeyDown,
        onKeyUp,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onMouseWheel,
      } = this.states[state];

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

  reset() {
    this.removeCallbacks();
    this.states = {};
  }

  removeCallbacks() {
    this.keyboard.removeCallbacks();
    this.mouse.removeCallbacks();
  }
}
