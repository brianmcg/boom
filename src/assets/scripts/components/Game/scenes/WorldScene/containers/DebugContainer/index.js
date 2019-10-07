import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';
import { DEG, Sector, castRay } from '~/core/physics';
import Player from '~/engine/components/Player';

const SCALE = 0.25;

class DebugContainer extends Container {
  constructor({ level, sprites }) {
    super();
    this.level = level;
    this.bodySprites = sprites.bodySprites;
    this.raySprites = sprites.raySprites;

    Object.values(this.bodySprites).forEach((sprite) => {
      sprite.width *= SCALE;
      sprite.height *= SCALE;
      this.addChild(sprite);
    });

    this.raySprites.forEach((sprite) => {
      sprite.width *= SCALE;
      sprite.height *= SCALE;
      this.addChild(sprite);
    });
  }

  update(...options) {
    this.level.update(...options);
  }

  animate() {
    const { player, bodies } = this.level;
    const playerSprite = this.bodySprites[player.id];

    playerSprite.x = (SCREEN.WIDTH / 2) - (playerSprite.width / 2);
    playerSprite.y = (SCREEN.HEIGHT / 2) - (playerSprite.height / 2);

    Object.values(this.bodySprites).forEach((sprite) => {
      sprite.visible = false;
    });

    let rayAngle = (player.angle - DEG[30] + DEG[360]) % DEG[360];

    const bodyIds = [];

    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      const {
        xIntersection,
        yIntersection,
        visibleBodyIds,
        distance,
      } = castRay({ rayAngle, caster: player });

      this.raySprites[xIndex].updatePoints([
        SCREEN.WIDTH / 2,
        SCREEN.HEIGHT / 2,
        (playerSprite.x + (xIntersection - player.shape.x) * SCALE),
        (playerSprite.y + (yIntersection - player.shape.y) * SCALE),
      ]);

      visibleBodyIds.forEach((id) => {
        if (!bodyIds.includes(id)) {
          bodyIds.push(id);
        }
      });

      rayAngle = (rayAngle + 1 + DEG[360]) % DEG[360];
    }

    Object.values(bodies).forEach((body) => {
      if (this.bodySprites[body.id]) {
        this.bodySprites[body.id].x = (playerSprite.x + (body.shape.x - player.shape.x) * SCALE);
        this.bodySprites[body.id].y = (playerSprite.y + (body.shape.y - player.shape.y) * SCALE);
        this.bodySprites[body.id].visible = true;

        if (bodyIds.includes(body.id) || body instanceof Sector || body instanceof Player) {
          this.bodySprites[body.id].alpha = 1;
        } else {
          this.bodySprites[body.id].alpha = 0.4;
        }
      }
    });
  }
}

export default DebugContainer;
