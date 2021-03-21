import { Container, PixelateFilter } from 'game/core/graphics';

const PIXEL_SIZE = 1.75;

/**
 * Class representing a background container.
 */
class BackgroundContainer extends Container {
  /**
   * Creates a background container.
   * @param  {SmokeSprite}     options.smoke         A smoke sprite.
   * @param  {RectangleSprite} options.background A sparks sprite.
   */
  constructor({ sparks, background }) {
    super();

    this.addChild(background);
    this.addChild(sparks);

    this.pixelateFilter = new PixelateFilter();

    this.filters = [this.pixelateFilter];
  }

  update(delta) {
    super.update(delta);

    const { parent } = this.parent;

    this.pixelateFilter.size = PIXEL_SIZE * parent.getScale();
  }
}

export default BackgroundContainer;
