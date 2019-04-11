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
    const { player, bodies } = this.level;
    const playerSprite = this.sprites[player.id];

    playerSprite.x = (SCREEN.WIDTH / 2) - (playerSprite.width / 2);
    playerSprite.y = (SCREEN.HEIGHT / 2) - (playerSprite.height / 2);

    Object.values(this.sprites).forEach((sprite) => {
      sprite.visible = false;
    });

    Object.values(bodies).forEach((body) => {
      if (this.sprites[body.id]) {
        this.sprites[body.id].x = (playerSprite.x + (body.shape.x - player.shape.x) * SCALE);
        this.sprites[body.id].y = (playerSprite.y + (body.shape.y - player.shape.y) * SCALE);
        this.sprites[body.id].visible = true;
      }
    });
  }
}
