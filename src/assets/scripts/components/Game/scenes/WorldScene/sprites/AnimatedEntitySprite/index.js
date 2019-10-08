import { AnimatedSprite } from '~/core/graphics';

class AnimatedEntitySprite extends AnimatedSprite {
  constructor(...options) {
    super(...options);

    this.hideOnAnimate = true;
    this.zOrder = Number.MAX_VALUE;
  }
}

export default AnimatedEntitySprite;
