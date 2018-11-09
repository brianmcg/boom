import { Container, BitmapText } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/font';
import { RED, WHITE } from '~/constants/colors';
import { SCREEN } from '~/constants/config';

const PADDING = 4;

/**
 * A class representing a menu container.
 */
class MenuContainer extends Container {
  /**
   * Creates a menu container.
   * @param  {Array}  items [description]
   */
  add(items = []) {
    this.currentIndex = 0;
    this.items = items;

    this.items.forEach((item, index) => {
      const sprite = new BitmapText({
        font: FONT_SIZES.MEDIUM,
        text: item.label,
        color: index ? WHITE : RED,
      });

      const totalHeight = (sprite.height + PADDING) * this.items.length;

      sprite.y = ((SCREEN.HEIGHT / 2) - (totalHeight / 2))
        + (index * sprite.height)
        + (index * PADDING);

      sprite.x = (SCREEN.WIDTH / 2) - (sprite.width / 2);

      this.addChild(sprite);

      this.on('added', () => {
        this.currentIndex = 0;
      });
    });
  }

  highlightNext() {
    if (this.items.length) {
      if (this.currentIndex < this.items.length - 1) {
        this.currentIndex += 1;
      } else {
        this.currentIndex = 0;
      }
    }
  }

  highlightPrevious() {
    if (this.items.length) {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
      } else {
        this.currentIndex = this.items.length - 1;
      }
    }
  }

  select() {
    if (this.items.length) {
      this.items[this.currentIndex].onSelect();
    }
  }

  render() {
    this.children.forEach((child, index) => {
      child.setColor(index === this.currentIndex ? RED : WHITE);
    });
  }
}

export default MenuContainer;
