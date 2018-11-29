import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class BackgroundContainer extends Container {
  constructor({ smoke }) {
    super();
    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;
    this.addChild(smoke, { update: true });
  }
}

export default BackgroundContainer;
