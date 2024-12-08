import { Container } from '@game/core/graphics';
import { RED, WHITE, DARK_GREY } from '@constants/colors';
import { SCREEN, SCREEN_PADDING } from '@constants/config';
import { PixelateFilter } from '@game/core/graphics';

const MAX_ALPHA = 0.7;

export default class MenuContainer extends Container {
  constructor({ menu, sprites }) {
    super();

    this.sprites = sprites;
    this.menu = menu;
    this.iconHeight = sprites.icon.height;
    this.scaleFactor = 0;
    this.optionContainer = new Container();
    this.pixelateFilter = new PixelateFilter();
    this.pixelateFilter.enabled = false;
    this.filters = [this.pixelateFilter];

    this.addChild(this.sprites.background);
    this.addChild(this.optionContainer);

    this.updateMenu();
  }

  update(ticker) {
    super.update(ticker);

    if (this.scaleFactor < 1) {
      this.optionContainer.scale.set(this.scaleFactor);
      this.sprites.background.alpha = this.scaleFactor * MAX_ALPHA;
    }

    this.updateMenu();
  }

  updateMenu() {
    this.optionContainer.removeChildren();

    const { icon, labels } = this.sprites;
    const currentOptions = this.menu.getCurrentOptions();

    currentOptions.forEach((option, i) => {
      const label = labels[option.id];

      label.y =
        (SCREEN_PADDING / 2) * i + label.height * (i + 1) - label.height / 2;

      if (option.highlighted) {
        icon.y = label.y;
        label.tint = RED;
        icon.x = label.x - icon.width - SCREEN_PADDING / 2;
      } else {
        label.tint = WHITE;
      }

      if (option.disabled) {
        label.tint = DARK_GREY;
      }

      this.optionContainer.addChild(label);
    });

    this.optionContainer.x = SCREEN.WIDTH / 2 - this.optionContainer.width / 2;

    this.optionContainer.y =
      SCREEN.HEIGHT / 2 - this.optionContainer.height / 2;

    this.optionContainer.addChild(icon);
  }

  fade(value, { pixelSize = 1 }) {
    this.pixelateFilter.enabled = value !== 1 && value !== 0;
    this.scaleFactor = value;

    let size = (1 - value) * pixelSize;

    if (this.parent) {
      size *= this.parent.getStageScale();
    }

    if (size < 1) {
      size = 1;
    }

    this.pixelateFilter.size = size;
  }

  play() {
    super.stop();
  }

  stop() {
    super.play();
  }

  pause() {
    super.play();
  }

  destroy(options) {
    const { icon, labels, background } = this.sprites;

    icon.destroy(options);
    background.destroy(options);
    Object.values(labels).forEach(sprite => sprite.destroy(options));

    super.destroy(options);
  }
}
