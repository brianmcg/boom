import { Container, RectangleSprite } from '~/core/graphics';
import { RED, WHITE, BLACK } from '~/constants/colors';
import { SCREEN } from '~/constants/config';

const SCREEN_PADDING = 6;

const ICON_PADDING_TOP = 1;

const ICON_PADDING_RIGHT = 5;

/**
 * A class representing a menu container.
 */
class MenuContainer extends Container {
  /**
   * Creates a menu container.
   * @param  {Object} options.sprites The sprites.
   */
  constructor({ sprites, items }) {
    super();

    this.sprites = sprites;

    const { icon, labels } = this.sprites;

    this.currentIndex = 0;
    this.items = items;

    this.addChild(new RectangleSprite({
      width: SCREEN.WIDTH,
      height: SCREEN.HEIGHT,
      color: BLACK,
      alpha: 0.8,
    }));

    if (this.items.length) {
      this.addChild(icon);
    }

    this.items.forEach((item, index) => {
      const sprite = labels[item.label];

      if (!index) {
        icon.y = sprite.y + ICON_PADDING_TOP;
        icon.x = sprite.x - ICON_PADDING_RIGHT - icon.width;
      }

      const totalHeight = (sprite.height + SCREEN_PADDING) * this.items.length;

      sprite.y = ((SCREEN.HEIGHT / 2) - (totalHeight / 2))
        + (index * sprite.height)
        + (index * SCREEN_PADDING);

      sprite.x = (SCREEN.WIDTH / 2) - (sprite.width / 2);

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

  animate() {
    const { icon, labels } = this.sprites;

    Object.values(labels).forEach((child, index) => {
      if (index === this.currentIndex) {
        icon.y = child.y + ICON_PADDING_TOP;
        icon.x = child.x - ICON_PADDING_RIGHT - icon.width;
        child.setColor(RED);
      } else {
        child.setColor(WHITE);
      }
    });
  }
}

export default MenuContainer;
