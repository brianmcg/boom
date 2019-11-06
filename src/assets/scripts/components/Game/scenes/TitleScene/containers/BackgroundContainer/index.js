import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends Container {
  /**
   * Creates a background container.
   * @param  {AnimatedSprite} options.smoke  A smoke sprite.
   * @param  {AnimatedSprite} options.sparks A sparks sprite.
   * @param  {Sprite}         options.logo   A logo sprite.
=   */
  constructor({ smoke, sparks, logo }) {
    super();

    const ratio = logo.height / (SCREEN.HEIGHT / 1.5);

    logo.height /= ratio;
    logo.width /= ratio;
    logo.x = (SCREEN.WIDTH / 2) - (logo.width / 2);
    logo.y = (SCREEN.HEIGHT / 2) - (logo.height / 2);

    logo.autoPlay = true;

    logo.play = () => {
      logo.visible = true;
    };

    logo.stop = () => {
      logo.visible = false;
    };

    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;

    sparks.width = SCREEN.WIDTH;
    sparks.height = SCREEN.HEIGHT;

    this.addChild(smoke);
    this.addChild(sparks);
    this.addChild(logo);
  }

  destroy() {
    super.destroy(true);
  }
}

export default BackgroundContainer;
