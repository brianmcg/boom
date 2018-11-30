import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

const TEXT_PADDING = 2;

const SCROLL_SPEED = 0.4;

const EVENTS = {
  SCROLL_COMPLETE: 'SCROLL_COMPLETE',
};

/**
 * Class representing a scroll container.
 */
class ScrollContainer extends Container {
  /**
   * The container events.
   */
  static get EVENTS() { return EVENTS; }

  /**
   * Creates a scroll container.
   * @param  {[type]} options.credits [description]
   * @param  {[type]} options.message [description]
   * @return {[type]}                 [description]
   */
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

    this.yPosition = SCREEN.HEIGHT;

    this.addChild(message);
  }

  /**
   * Updates the scroll container.
   * @param  {Number} delta [description]
   */
  update(delta = 1) {
    this.yPosition -= (delta * SCROLL_SPEED);

    const last = this.lastChild();

    if (this.yPosition < -this.height + ((SCREEN.HEIGHT) - (last.height))) {
      this.emit(EVENTS.SCROLL_COMPLETE);
    }
  }

  /**
   * Renders the scroll container.
   */
  render() {
    this.y = this.yPosition;
  }
}

export default ScrollContainer;
