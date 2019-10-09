import { AnimatedSprite } from '~/core/graphics';

class AnimatedEntitySprite extends AnimatedSprite {
  constructor(...options) {
    super(...options);

    this.autoPlay = true;
    this.hideOnAnimate = true;
    this.zOrder = Number.MAX_VALUE;
  }
}

export default AnimatedEntitySprite;
