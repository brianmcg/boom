import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class EndContainer extends Container {
  constructor(sprite) {
    const ratio = sprite.height / (SCREEN.HEIGHT / 3);

    super();

    sprite.height /= ratio;
    sprite.width /= ratio;
    sprite.x = (SCREEN.WIDTH / 2) - (sprite.width / 2);

    this.y = SCREEN.HEIGHT;

    this.addChild(sprite);
  }
}

export default EndContainer;
