import {
  AnimatedSprite as PixiAnimatedSprite,
  type ColorSource,
  type DestroyOptions,
  type Texture,
} from 'pixi.js';
import type { Anchor } from '../types';

export interface AnimatedSpriteOptions {
  textures?: Texture[];
  animationSpeed?: number;
  tint?: ColorSource;
  alpha?: number;
  loop?: boolean;
  anchor?: Anchor;
}

export default class AnimatedSprite extends PixiAnimatedSprite {
  constructor({
    textures,
    animationSpeed = 1,
    tint,
    alpha = 1,
    loop = false,
    anchor = 0,
  }: AnimatedSpriteOptions = {}) {
    super(textures!, false);

    // Everything assigned here is a Pixi accessor or field of its own, and has
    // to stay an assignment: a field declaration would shadow the setter.
    this.animationSpeed = animationSpeed;
    this.interactiveChildren = false;
    this.eventMode = 'none';

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

  destroy(options?: DestroyOptions) {
    super.destroy(options);
    this.stop();
    this.removeAllListeners();

    // Pixi's own animation callbacks, and the only ones there are to clear.
    // `undefined` rather than `null` is what its types allow, and every reader
    // is an `if (this.onComplete)` truthiness test, so the two are
    // indistinguishable to it.
    this.onComplete = undefined;
    this.onFrameChange = undefined;
    this.onLoop = undefined;
  }
}
