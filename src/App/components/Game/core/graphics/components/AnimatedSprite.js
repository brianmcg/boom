import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js';

export default class AnimatedSprite extends PixiAnimatedSprite {
  constructor(
    textures,
    { animationSpeed = 1, tint, alpha = 1, loop = false, anchor = 0 } = {}
  ) {
    super(textures, false);

    this.animationSpeed = animationSpeed;

    if (loop || loop === false) {
      this.loop = loop;
    }

    if (alpha || alpha === 0) {
      this.alpha = alpha;
    }

    if (tint || tint === 0) {
      this.tint = tint;
    }

    if (anchor) {
      if (Array.isArray(anchor)) {
        this.anchor.set(...anchor);
      } else {
        this.anchor.set(anchor);
      }
    }
  }

  pause() {
    super.stop();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  destroy(options) {
    this.removeAllListeners();
    super.destroy(options);
  }
}
