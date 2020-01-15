import { Container, PixelateFilter } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends Container {
  /**
   * Creates a background container.
   * @param  {AnimatedSprite} options.smoke  A smoke sprite.
   * @param  {AnimatedSprite} options.sparks A sparks sprite.
=   */
  constructor({ smoke, sparks }) {
    super();

    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;

    sparks.width = SCREEN.WIDTH;
    sparks.height = SCREEN.HEIGHT;

    this.addChild(smoke);
    this.addChild(sparks);

    this.filters = [new PixelateFilter()];
    this.filters[0].enabled = false;
    this.filters[0].size = 10;
  }
}

export default BackgroundContainer;
