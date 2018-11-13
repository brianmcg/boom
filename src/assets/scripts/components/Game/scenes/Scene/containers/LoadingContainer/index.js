import { RectangleSprite, Container } from '~/core/graphics';
import { RED } from '~/constants/colors';
import { SCREEN } from '~/constants/config';

const SIZE = 32;

const INCREMENT = 0.1;

class LoadingContainer extends Container {
  constructor() {
    super();

    this.counter = 0;

    this.spinner = new RectangleSprite({
      color: RED,
      w: SIZE,
      h: SIZE,
    });

    this.spinner.x = (SCREEN.WIDTH / 2);
    this.spinner.y = (SCREEN.HEIGHT / 2);
    this.spinner.anchor.set(0.5);

    this.addChild(this.spinner);
  }

  update(delta) {
    this.counter += INCREMENT * delta;
  }

  render() {
    this.spinner.rotation = this.counter;
  }
}

export default LoadingContainer;
