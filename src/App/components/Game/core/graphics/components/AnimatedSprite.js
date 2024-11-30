import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js';

export default class AnimatedSprite extends PixiAnimatedSprite {
  constructor(textures, { animationSpeed = 1, loop = false, anchor = 0 } = {}) {
    super(textures, false);

    this.animationSpeed = animationSpeed;
    this.loop = loop;

    if (Array.isArray(anchor)) {
      this.anchor.set(...anchor);
    } else {
      this.anchor.set(anchor);
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
}
