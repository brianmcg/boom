import { Container, BitmapText } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/font';
import { RED, WHITE } from '~/constants/colors';
import { SCREEN } from '~/constants/config';

const PADDING = 6;

const ICON_PADDING_TOP = 4;

const ICON_PADDING_RIGHT = 5;

/**
 * A class representing a menu container.
 */
export default class MenuContainer extends Container {
  /**
   * Creates a menu container.
   * @param  {Object} options.sprites The sprites.
   */
  constructor({ sprites }) {
    super();
    this.menuIcon = sprites.menu.icon;
  }

  /**
   * Creates a menu container.
   * @param  {Array}  items The menu items.
   */
  add(items = []) {
    this.currentIndex = 0;
    this.items = items;
    this.itemSprites = [];

    if (this.items.length) {
      this.addChild(this.menuIcon);
    }

    this.items.forEach((item, index) => {
      const sprite = new BitmapText({
        font: FONT_SIZES.SMALL,
        text: item.label,
        color: index ? WHITE : RED,
      });

      if (!index) {
        this.menuIcon.y = sprite.y + ICON_PADDING_TOP;
        this.menuIcon.x = sprite.x - ICON_PADDING_RIGHT - this.menuIcon.width;
      }

      const totalHeight = (sprite.height + PADDING) * this.items.length;

      sprite.y = ((SCREEN.HEIGHT / 2) - (totalHeight / 2))
        + (index * sprite.height)
        + (index * PADDING);

      sprite.x = (SCREEN.WIDTH / 2) - (sprite.width / 2);

      this.itemSprites.push(sprite);
      this.addChild(sprite);

      this.on('added', () => {
        this.currentIndex = 0;
      });
    });
  }

  /**
   * Highlight the next menu item.
   */
  highlightNext() {
    if (this.items.length) {
      if (this.currentIndex < this.items.length - 1) {
        this.currentIndex += 1;
      } else {
        this.currentIndex = 0;
      }
    }
  }

  /**
   * Highlight the previous menu item.
   */
  highlightPrevious() {
    if (this.items.length) {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
      } else {
        this.currentIndex = this.items.length - 1;
      }
    }
  }

  /**
   * Select the current menu item.
   */
  select() {
    if (this.items.length) {
      this.items[this.currentIndex].onSelect();
    }
  }

  _render() {
    this.itemSprites.forEach((child, index) => {
      if (index === this.currentIndex) {
        this.menuIcon.y = child.y + ICON_PADDING_TOP;
        this.menuIcon.x = child.x - ICON_PADDING_RIGHT - this.menuIcon.width;
        child.setColor(RED);
      } else {
        child.setColor(WHITE);
      }
    });
  }
}
