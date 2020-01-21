import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';
import { DEG, Sector, castRay } from 'game/core/physics';
import Player from '../../entities/Player';

const SCALE = 0.25;

/**
 * Class representing a debug container.
 */
class DebugContainer extends Container {
  /**
   * Creates a debug container.
   * @param  {World}  options.world    The world to render.
   * @param  {Object} options.sprites  The container sprites.
   */
  constructor({ world, sprites }) {
    super();
    this.world = world;
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

  /**
   * Animate the container.
   */
  animate() {
    const { player, bodies } = this.world;
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
