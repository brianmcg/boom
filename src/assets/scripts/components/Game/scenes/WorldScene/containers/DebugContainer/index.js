import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

const SCALE = 0.25;

export default class DebugContainer extends Container {
  constructor({ level, sprites }) {
    super();
    this.level = level;
    this.sprites = sprites;

    Object.values(sprites).forEach((sprite) => {
      sprite.width *= SCALE;
      sprite.height *= SCALE;
      this.addChild(sprite);
    });
  }

  update(...options) {
    this.level.update(...options);
  }

  _render() {
    const { grid, player, items } = this.level;
    const playerSprite = this.sprites[player.id];

    playerSprite.x = (SCREEN.WIDTH / 2) - (playerSprite.width / 2);
    playerSprite.y = (SCREEN.HEIGHT / 2) - (playerSprite.height / 2);

    grid.forEach((row) => {
      row.forEach((sector) => {
        if (sector.blocking()) {
          this.sprites[sector.id].x = (playerSprite.x + (sector.shape.x - player.shape.x) * SCALE);
          this.sprites[sector.id].y = (playerSprite.y + (sector.shape.y - player.shape.y) * SCALE);
        }
      });
    });

    items.forEach((item) => {
      if (item.blocking()) {
        this.sprites[item.id].x = (playerSprite.x + (item.shape.x - player.shape.x) * SCALE);
        this.sprites[item.id].y = (playerSprite.y + (item.shape.y - player.shape.y) * SCALE);
      }
    });
  }
}
