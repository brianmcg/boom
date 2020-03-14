import { Container } from 'game/core/graphics';

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
  }
}

export default BackgroundContainer;
