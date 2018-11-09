import { BitmapText, Container } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/font';
import { RED } from '~/constants/colors';
import { SCREEN } from '~/constants/config';

class LoadingContainer extends Container {
  constructor() {
    super();

    this.text = new BitmapText({
      font: FONT_SIZES.LARGE,
      text: 'LOADING',
      color: RED,
    });

    this.text.x = (SCREEN.WIDTH / 2) - (this.text.width / 2);
    this.text.y = (SCREEN.WIDTH / 2) - (this.text.width / 2);

    this.addChild(this.text);
  }
}

export default LoadingContainer;
