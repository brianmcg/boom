class Controls {
  constructor({ keyboard, mouse }) {
    this.keyboard = keyboard;
    this.mouse = mouse;
    this.states = {};
  }

  add(state, controls = {}) {
    if (this.states[state]) {
      Object.keys(controls).forEach((key) => {
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
    this.reset();

    if (this.states[state]) {
      const { onKeyDown, onKeyUp } = this.states[state];

      if (onKeyDown) {
        Object.keys(onKeyDown).forEach((name) => {
          this.keyboard.get(name).onDown(onKeyDown[name]);
        });
      }

      if (onKeyUp) {
        Object.keys(onKeyUp).forEach((name) => {
          this.keyboard.get(name).onUp(onKeyUp[name]);
        });
      }
    }
  }

  /**
   * Destroy the input controller.
   */
  reset() {
    this.keyboard.removeKeys();
    this.mouse.removeButtons();
  }
}

export default Controls;
