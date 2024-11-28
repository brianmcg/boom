import { AnimatedSprite, GraphicsCreator } from '@game/core/graphics';

export default class AnimatedEntitySprite extends AnimatedSprite {
  constructor(
    textures,
    {
      animationSpeed = 0.2,
      loop = true,
      autoPlay = true,
      floorOffset = 0,
      anchor = [0.5, 1],
      ...other
    } = {}
  ) {
    super(textures, {
      ...other,
      animationSpeed,
      loop,
      anchor,
    });

    this.zOrder = Number.MAX_VALUE;

    if (floorOffset) {
      this.mask = GraphicsCreator.createRectangleSprite({ anchor });
      this.mask.zOrder = Number.MAX_VALUE;
    }

    if (autoPlay) {
      this.play();
    }
  }
}
