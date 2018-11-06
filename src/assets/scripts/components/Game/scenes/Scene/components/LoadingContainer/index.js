import { BitmapText, Container } from 'game/core/graphics';
import { FONT_SIZES } from 'game/constants/font';
import { RED } from 'game/constants/colors';
import { SCREEN } from 'game/constants/config';

class LoadingContainer extends Container {
  constructor() {
    super();

    this.text = new BitmapText({
      font: FONT_SIZES.LARGE,
      text: 'LOADING',
      center: true,
      color: RED,
    });

    this.text.x = (SCREEN.WIDTH / 2) - (this.text.width / 2);
    this.text.y = (SCREEN.WIDTH / 2) - (this.text.width / 2);

    this.addChild(this.text);
  }
}

export default LoadingContainer;
