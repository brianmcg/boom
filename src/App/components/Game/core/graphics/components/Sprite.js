import { Sprite as PixiSprite } from 'pixi.js';

class Sprite extends PixiSprite {
  constructor(texture, { alpha = 1, anchor = 0, width, height, tint } = {}) {
    super({ texture });

    this.alpha = alpha;

    if (anchor) {
      if (Array.isArray(anchor)) {
        this.anchor.set(...anchor);
      } else {
        this.anchor.set(anchor);
      }
    }

    if (width || width === 0) {
      this.width = width;
    }

    if (height || width === 0) {
      this.height = height;
    }

    if (tint || tint === 0) {
      this.tint = tint;
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

  destroy(options) {
    this.removeAllListeners();
    super.destroy(options);
  }
}

export default Sprite;
