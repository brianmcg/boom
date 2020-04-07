import { Container, RectangleSprite } from 'game/core/graphics';
import { RED, WHITE } from 'game/constants/colors';
import { SCREEN } from 'game/constants/config';

const INCREMENT = 2;

const INTERVAL = 10;

const PADDING = 2;

const createSprites = (size, number = 0) => (
  [...Array(number)].map(() => new RectangleSprite({
    width: size,
    height: size,
  }))
);

/**
 * A class representing a LoadingContainer.
 */
class LoadingContainer extends Container {
  /**
   * Creates a LoadingContainer.
   */
  constructor() {
    super();

    const size = SCREEN.HEIGHT / 32;

    const number = 5;

    this.counter = 0;
    this.index = 0;
    this.sprites = createSprites(size, number);

    this.sprites.forEach((sprite, i) => {
      sprite.x = (size * i) + (PADDING * i) + ((SCREEN.WIDTH / 2)
        - (((size * number) + (PADDING * number - 1)) / 2));
      sprite.y = (SCREEN.HEIGHT / 2) - (size / 2);
      this.addChild(sprite);
    });
  }

  /**
   * Update the LoadingContainer
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.counter += INCREMENT * delta;

    if (this.counter > INTERVAL) {
      this.counter = 0;
      this.index += 1;

      if (this.index > this.sprites.length - 1) {
        this.index = 0;
      }
    }

    this.sprites.forEach((sprite, i) => {
      sprite.tint = this.index === i ? WHITE : RED;
    });
  }
}

export default LoadingContainer;
