import {
  Sprite as PixiSprite,
  type ColorSource,
  type DestroyOptions,
  type Texture,
} from 'pixi.js';
import type { Anchor } from '../types';

export interface SpriteOptions {
  texture?: Texture;
  alpha?: number;
  anchor?: Anchor;
  width?: number;
  height?: number;
  tint?: ColorSource;
}

class Sprite extends PixiSprite {
  /** Subclass-defined label, and only ever set through {@link setState}. */
  state?: string;

  constructor({
    texture,
    alpha = 1,
    anchor = 0,
    width,
    height,
    tint,
  }: SpriteOptions = {}) {
    super({ texture });

    // Everything below is a Pixi accessor. Assigning is what makes the setter
    // run; declaring any of them as a field here would shadow it silently.
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

    if (height || height === 0) {
      this.height = height;
    }

    if (tint || tint === 0) {
      this.tint = tint;
    }

    this.interactiveChildren = false;
    this.eventMode = 'none';
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  setState(state: string): boolean {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  destroy(options?: DestroyOptions) {
    this.removeAllListeners();
    super.destroy(options);
  }
}

export default Sprite;
