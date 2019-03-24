import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

const TEXT_PADDING = 8;

const SCROLL_SPEED = 0.6;

const EVENTS = {
  SCROLL_COMPLETE: 'SCROLL_COMPLETE',
};

/**
 * Class representing a scroll container.
 */
export default class ScrollContainer extends Container {
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

    message.x = (SCREEN.WIDTH / 2) - (message.width / 2);
    message.y = y + SCREEN.HEIGHT;

    this.scrollY = SCREEN.HEIGHT;

    this.addChild(message);
  }

  /**
   * Updates the scroll container.
   * @param  {Number} delta The delta time.
   */
  update(delta = 1) {
    const lastSprite = this.children[this.children.length - 1];
    const yEnd = SCREEN.HEIGHT - (lastSprite.height * 2) - this.height;

    this.scrollY -= delta * SCROLL_SPEED;

    if (this.scrollY <= yEnd) {
      this.scrollY = yEnd;
      this.emit(EVENTS.SCROLL_COMPLETE);
    }
  }

  play() {
    this.visible = true;
  }

  stop() {
    this.visible = false;
  }

  _render() {
    this.y = this.scrollY;
  }
}
