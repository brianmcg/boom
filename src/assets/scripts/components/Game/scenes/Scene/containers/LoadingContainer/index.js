import { RectangleSprite, Container } from '~/core/graphics';
import { RED } from '~/constants/colors';
import { SCREEN } from '~/constants/config';

const SIZE = SCREEN.HEIGHT / 5;

const INCREMENT = 0.1;

/**
 * A class representing a LoadingContainer.
 */
export default class LoadingContainer extends Container {
  /**
   * Creates a LoadingContainer.
   */
  constructor() {
    super();

    // this.spinner = new RectangleSprite({
    //   color: RED,
    //   w: SIZE,
    //   h: SIZE,
    // });

    // this.spinner.x = (SCREEN.WIDTH / 2);
    // this.spinner.y = (SCREEN.HEIGHT / 2);
    // this.spinner.anchor.set(0.5);

    // this.addChild(this.spinner);
  }

  /**
   * Update the LoadingContainer
   * @param  {Number} delta The delta time.
   */
  update(delta = 1) {
    // this.spinner.rotation += INCREMENT * delta;
  }
}
