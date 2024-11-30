import { Sprite as PixiSprite } from 'pixi.js';

class Sprite extends PixiSprite {
  constructor(texture, { anchor = 0 } = {}) {
    super({ texture });

    if (Array.isArray(anchor)) {
      this.anchor.set(...anchor);
    } else {
      this.anchor.set(anchor);
    }
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }
}

export default Sprite;
