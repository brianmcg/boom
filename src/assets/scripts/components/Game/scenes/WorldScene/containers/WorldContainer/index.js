import { Container } from '~/core/graphics';
import {
  DEG,
  COS,
  TAN,
  SIN,
} from '~/core/physics';
import { SCREEN, TILE_SIZE, DRAW_DISTANCE } from '~/constants/config';
import { BLACK } from '~/constants/colors';
import EntityContainer from './containers/EntityContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import { calculateTint } from './helpers';

const CAMERA_DISTANCE = SCREEN.WIDTH / 2 / TAN[DEG[30]];

const CAMERA_CENTER_Y = SCREEN.HEIGHT / 2;

let wallSprite;
let angleDifference;
let correctedDistance;
let spriteHeight;
let spriteY;
let wallBottomIntersection;
let wallTopIntersection;
let backgroundSprite;
let actualDistance;
let mapX;
let mapY;
let pixelX;
let pixelY;
let topId;
let bottomId;

const toDegrees = (angle = 0) => {
  return Math.round(angle * DEGREES_180 / Math.PI);
};

const atan2 = (dy = 0, dx = 0) => {
  let angle = toDegrees(Math.atan2(dy, dx));

  while (angle < 0) {
    angle += DEGREES_360;
  }

  while (angle >= DEGREES_360) {
    angle -= DEGREES_360;
  }

  return angle;
};

class WorldContainer extends Container {
  constructor({ level, sprites }) {
    super();

    const { entities, background } = sprites;
    const { walls, items } = entities;

    const backgroundContainer = new BackgroundContainer();

    const entityContainer = new EntityContainer();

    walls.forEach((wall, i) => {
      wall.x = i;
      entityContainer.addChild(wall);
    });

    background.forEach((row, i) => {
      row.forEach((pixel, y) => {
        pixel.x = i;
        pixel.y = y;
        backgroundContainer.addChild(pixel);
      });
    });

    // Object.values(items).forEach((item, i) => {
    //   item.x = i * 64;
    //   item.y = 0;
    //   item.height = 64;
    //   item.width = 64;
    //   entityContainer.addChild(item);
    // });

    this.level = level;
    this.sprites = sprites;
    this.brightness = 0;
    this.addChild(backgroundContainer);
    this.addChild(entityContainer);

    bottomId = level.sector(0, 0).sideIds[4];
    topId = level.sector(0, 0).sideIds[5];
  }

  update(...options) {
    this.level.update(...options);
  }

  animate() {
    super.animate();

    const { player, bodies } = this.level;
    const { entities, background } = this.sprites;
    const { walls } = entities;

    const eyeHeight = player.height;

    let rayAngle = (player.angle - DEG[30] + DEG[360]) % DEG[360];

    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      wallSprite = walls[xIndex];

      const {
        visibleBodyIds,
        distance,
        isHorizontal,
        sideId,
        sectorIntersection,
      } = player.castRay({ rayAngle });

      // update wall sprites
      angleDifference = (rayAngle - player.angle + DEG[360]) % DEG[360];

      correctedDistance = distance * COS[angleDifference];
      spriteHeight = TILE_SIZE * CAMERA_DISTANCE / correctedDistance;
      spriteY = CAMERA_CENTER_Y - (spriteHeight / (TILE_SIZE / (TILE_SIZE - eyeHeight)));

      wallSprite.height = spriteHeight;
      wallSprite.y = spriteY;

      if (distance < DRAW_DISTANCE) {
        wallSprite.changeTexture(sideId, sectorIntersection);
        wallSprite.tint = calculateTint(this.brightness, distance, isHorizontal);
      } else {
        wallSprite.tint = BLACK;
      }

      // Update background sprites
      wallBottomIntersection = Math.floor(spriteY + spriteHeight);
      wallTopIntersection = Math.floor(spriteY);

      for (let yIndex = 0; yIndex < SCREEN.HEIGHT; yIndex += 1) {
        backgroundSprite = background[xIndex][yIndex];

        if (yIndex >= wallBottomIntersection) {
          actualDistance = eyeHeight / (yIndex - CAMERA_CENTER_Y) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / COS[angleDifference];

          if (DRAW_DISTANCE === 0 || DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));

            // bottomId = this.level.sector(
            //   Math.floor(mapX / TILE_SIZE),
            //   Math.floor(mapY / TILE_SIZE),
            // ).sideIds[4];

            pixelX = mapX % TILE_SIZE;
            pixelY = mapY % TILE_SIZE;

            if (pixelX < 0) {
              pixelX = TILE_SIZE + pixelX;
            }

            if (pixelY < 0) {
              pixelY = TILE_SIZE + pixelY;
            }

            backgroundSprite.changeTexture(bottomId, pixelX, pixelY);
            backgroundSprite.visible = true;
            // TODO: test with distance
            backgroundSprite.tint = calculateTint(this.brightness, actualDistance);
          } else {
            backgroundSprite.visible = false;
          }
        } else if (yIndex <= wallTopIntersection) {
          actualDistance = (TILE_SIZE - eyeHeight) / (CAMERA_CENTER_Y - yIndex) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / COS[angleDifference];

          if (DRAW_DISTANCE === 0 || DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));

            pixelX = mapX % TILE_SIZE;
            pixelY = mapY % TILE_SIZE;

            // topId = this.level.sector(
            //   Math.floor(mapX / TILE_SIZE),
            //   Math.floor(mapY / TILE_SIZE),
            // ).sideIds[5];

            if (pixelX < 0) {
              pixelX = TILE_SIZE + pixelX;
            }

            if (pixelY < 0) {
              pixelY = TILE_SIZE + pixelY;
            }

            backgroundSprite.changeTexture(topId, pixelX, pixelY);
            backgroundSprite.visible = true;
            backgroundSprite.tint = calculateTint(this.brightness, actualDistance);
          } else {
            backgroundSprite.visible = false;
          }
        } else {
          backgroundSprite.tint = BLACK;
        }
      }

      // Update ray angle
      rayAngle = (rayAngle + 1 + DEG[360]) % DEG[360];
    }
  }
}

export default WorldContainer;
