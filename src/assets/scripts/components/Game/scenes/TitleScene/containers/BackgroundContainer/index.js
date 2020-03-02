import { Container, PixelateFilter } from 'game/core/graphics';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends Container {
  /**
   * Creates a background container.
   * @param  {SmokeSprite}     options.smoke         A smoke sprite.
   * @param  {RectangleSprite} options.background A sparks sprite.
   */
  constructor({ smoke, background }) {
    super();

    this.addChild(background);
    // this.addChild(smoke);

    // this.filters = [new PixelateFilter()];
    // this.filters[0].enabled = false;

    // this.on('added', () => {
    //   this.filters[0].size = 20 * this.parent.scale.x;
    // });
  }
}

export default BackgroundContainer;
