import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';
import { DEG } from '~/core/physics';

const SCALE = 0.25;

export default class DebugContainer extends Container {
  constructor({ level, sprites }) {
    super();
    this.level = level;
    this.bodySprites = sprites.bodySprites;
    this.dotSprites = sprites.dotSprites;

    Object.values(this.bodySprites).forEach((sprite) => {
      sprite.width *= SCALE;
      sprite.height *= SCALE;
      this.addChild(sprite);
    });

    this.dotSprites.forEach((sprite) => {
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
    const playerSprite = this.bodySprites[player.id];

    playerSprite.x = (SCREEN.WIDTH / 2) - (playerSprite.width / 2);
    playerSprite.y = (SCREEN.HEIGHT / 2) - (playerSprite.height / 2);

    Object.values(this.bodySprites).forEach((sprite) => {
      sprite.visible = false;
    });

    Object.values(bodies).forEach((body) => {
      if (this.bodySprites[body.id]) {
        this.bodySprites[body.id].x = (playerSprite.x + (body.shape.x - player.shape.x) * SCALE);
        this.bodySprites[body.id].y = (playerSprite.y + (body.shape.y - player.shape.y) * SCALE);
        this.bodySprites[body.id].visible = true;
      }
    });

    let rayAngle = player.angle - DEG[30];

    if (rayAngle < 0) {
      rayAngle += DEG[360];
    }

    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      const ray = player.castRay({ angle: rayAngle });
      this.dotSprites[xIndex].x = (playerSprite.x + ((ray.xIntersection - 2) - player.shape.x) * SCALE);
      this.dotSprites[xIndex].y = (playerSprite.y + ((ray.yIntersection - 2) - player.shape.y) * SCALE);

      rayAngle += 1;

      if (rayAngle >= DEG[360]) {
        rayAngle -= DEG[360];
      }
    }
  }
}
