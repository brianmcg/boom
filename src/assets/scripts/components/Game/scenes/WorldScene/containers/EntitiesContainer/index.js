import { Container } from '~/core/graphics';
import { DEG, COS, TAN } from '~/core/physics';
import { SCREEN, TILE_SIZE } from '~/constants/config';
import { calculateTint } from './helpers';

const CAMERA_DISTANCE = SCREEN.WIDTH / 2 / TAN[DEG[30]];

const CAMERA_CENTER_Y = SCREEN.HEIGHT / 2;

export default class EntitiesContainer extends Container {
  constructor({ level, sprites }) {
    super();

    this.sprites = sprites;
    this.level = level;

    this.sprites.walls.forEach((wall, i) => {
      wall.x = i;
      wall.y = (SCREEN.HEIGHT / 2) - (TILE_SIZE / 2);
      this.addChild(wall);
    });

    this.brightness = 0;
  }

  animate() {
    const { player, bodies } = this.level;
    const { walls } = this.sprites;

    let wallSprite;
    let angleDifference;
    let correctedDistance;
    let spriteHeight;
    let spriteY;
    const eyeHeight = player.height;

    let rayAngle = player.angle - DEG[30];

    if (rayAngle < 0) {
      rayAngle += DEG[360];
    }

    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      wallSprite = walls[xIndex];

      const {
        visibleBodyIds,
        distance,
        side,
        sideId,
        intersection,
      } = player.castRay({ rayAngle });

      // update wall sprites
      angleDifference = rayAngle - player.angle;

      if (angleDifference < 0) {
        angleDifference += DEG[360];
      }

      correctedDistance = distance * COS[angleDifference];
      spriteHeight = TILE_SIZE * CAMERA_DISTANCE / correctedDistance;
      spriteY = CAMERA_CENTER_Y - (spriteHeight / (TILE_SIZE / (TILE_SIZE - eyeHeight)));

      wallSprite.changeTexture(sideId, intersection);
      wallSprite.height = spriteHeight;
      wallSprite.y = spriteY;
      wallSprite.tint = calculateTint(this.brightness, distance, side);

      rayAngle += 1;

      rayAngle %= DEG[360];
    }
  }
}
