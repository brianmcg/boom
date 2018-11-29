import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class BackgroundContainer extends Container {
  constructor({ smoke, sparks, logo }) {
    super();

    const ratio = logo.height / (SCREEN.HEIGHT / 1.75);

    logo.height /= ratio;
    logo.width /= ratio;
    logo.x = (SCREEN.WIDTH / 2) - (logo.width / 2);
    logo.y = (SCREEN.HEIGHT / 2) - (logo.height / 2);

    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;

    sparks.width = SCREEN.WIDTH;
    sparks.height = SCREEN.HEIGHT;


    this.addChild(smoke, { play: true });
    this.addChild(sparks, { play: true });
    this.addChild(logo, { hide: true });
  }
}

export default BackgroundContainer;
