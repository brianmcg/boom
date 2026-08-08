import Mouse, {
  type MoveCallback,
  type WheelCallback,
} from './components/Mouse';
import Keyboard from './components/Keyboard';

/**
 * One state's bindings. Every group is optional: a state binds only what it
 * uses, and `Scene`'s menu states bind nothing but keys.
 */
export interface Controls {
  onKeyDown?: Record<string, () => void>;
  onKeyUp?: Record<string, () => void>;
  onMouseDown?: Record<string, () => void>;
  onMouseUp?: Record<string, () => void>;
  onMouseMove?: { callback: MoveCallback };
  onMouseWheel?: { callback: WheelCallback };
}

export default class InputController {
  readonly keyboard: Keyboard;

  readonly mouse: Mouse;

  private states: Record<string, Controls>;

  constructor(element: HTMLElement) {
    this.keyboard = new Keyboard();
    this.mouse = new Mouse(element);
    this.states = {};
  }

  add(state: string, controls: Controls = {}) {
    if (this.states[state]) {
      // Widened to plain objects for the merge. Every group of Controls is one,
      // but indexing the union by a computed key gives a union of six value
      // types that will not assign back to itself — this says once what the
      // loop relies on, rather than casting at each use.
      const target = this.states[state] as Record<string, object>;
      const source = controls as Record<string, object>;

      Object.keys(controls).forEach(key => {
        if (target[key]) {
          Object.assign(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
    } else {
      this.states[state] = controls;
    }
  }

  set(state: string) {
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
