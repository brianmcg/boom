import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

const TEXT_PADDING = 2;

class ScrollContainer extends Container {
  constructor({ credits, message }) {
    super();

    const ratio = message.height / (SCREEN.HEIGHT / 3);
    let y = 0;

    credits.forEach((credit) => {
      credit.forEach((text, i) => {
        text.x = (SCREEN.WIDTH / 2) - (text.width / 2);
        text.y = y;
        y += text.height + TEXT_PADDING;
        if (!i) {
          y += TEXT_PADDING;
        }
        this.addChild(text);
      });
      y += TEXT_PADDING * 5;
    });

    message.height /= ratio;
    message.width /= ratio;
    message.x = (SCREEN.WIDTH / 2) - (message.width / 2);
    message.y = y + SCREEN.HEIGHT;

    this.y = SCREEN.HEIGHT;

    this.addChild(message);
  }
}

export default ScrollContainer;
