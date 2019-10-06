import { Container } from '~/core/graphics';
import {
  DEG,
  COS,
  TAN,
  SIN,
} from '~/core/physics';
import { SCREEN, TILE_SIZE, DRAW_DISTANCE } from '~/constants/config';
import EntityContainer from './containers/EntityContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import { calculateTint } from './helpers';

const CAMERA_DISTANCE = SCREEN.WIDTH / 2 / TAN[DEG[30]];
const CAMERA_CENTER_X = SCREEN.WIDTH / 2;
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

let bodyId;
let sprite;
let dx;
let dy;
let spriteAngle;
let spriteScale;
let spriteWidth;
let spriteX;

const toDegrees = (angle = 0) => Math.round(angle * DEG[180] / Math.PI);

const atan2 = (dyA = 0, dxA = 0) => {
  let angle = toDegrees(Math.atan2(dyA, dxA));

  while (angle < 0) {
    angle += DEG[360];
  }

  while (angle >= DEG[360]) {
    angle -= DEG[360];
  }

  return angle;
};

class WorldContainer extends Container {
  constructor({ level, sprites }) {
    super();

    const { entities, background } = sprites;
    const { walls, objects } = entities;


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

    Object.values(objects).forEach((object) => {
      entityContainer.addChild(object);
    });

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
    const { player, bodies } = this.level;
    const { entities, background } = this.sprites;
    const { walls, objects } = entities;

    const eyeHeight = player.height;

    const bodyIds = [];

    let rayAngle = (player.angle - DEG[30] + DEG[360]) % DEG[360];

    this.children.forEach(child => child.reset && child.reset());

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
      wallSprite.zOrder = distance;

      if (distance < DRAW_DISTANCE) {
        wallSprite.changeTexture(sideId, sectorIntersection);
        wallSprite.tint = calculateTint(this.brightness, distance, isHorizontal);
        wallSprite.visible = true;
      } else {
        wallSprite.visible = false;
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

            pixelX = mapX % TILE_SIZE;
            pixelY = mapY % TILE_SIZE;

            // bottomId = this.level.sector(
            //   Math.floor(mapX / TILE_SIZE),
            //   Math.floor(mapY / TILE_SIZE),
            // ).sideIds[4];

            // if (pixelX < 0) {
            //   pixelX = TILE_SIZE + pixelX;
            // }

            // if (pixelY < 0) {
            //   pixelY = TILE_SIZE + pixelY;
            // }

            backgroundSprite.changeTexture(bottomId, pixelX, pixelY);
            backgroundSprite.alpha = 1;
            // TODO: test with distance
            backgroundSprite.tint = calculateTint(this.brightness, actualDistance);
          } else {
            backgroundSprite.alpha = 0;
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

            // if (pixelX < 0) {
            //   pixelX = TILE_SIZE + pixelX;
            // }

            // if (pixelY < 0) {
            //   pixelY = TILE_SIZE + pixelY;
            // }

            backgroundSprite.changeTexture(topId, pixelX, pixelY);
            backgroundSprite.alpha = 1;
            backgroundSprite.tint = calculateTint(this.brightness, actualDistance);
          } else {
            backgroundSprite.alpha = 0;
          }
        } else {
          backgroundSprite.alpha = 0;
        }
      }

      visibleBodyIds.forEach((id) => {
        if (!bodyIds.includes(id) && player.distanceTo(bodies[id]) < distance) {
          bodyIds.push(id);
        }
      });

      // Update ray angle
      rayAngle = (rayAngle + 1) % DEG[360];
    }

    for (let i = 0; i < bodyIds.length; i += 1) {
      bodyId = bodyIds[i];
      sprite = objects[bodyId];
      dx = bodies[bodyId].x - player.x;
      dy = bodies[bodyId].y - player.y;
      actualDistance = Math.sqrt(dx * dx + dy * dy);
      spriteAngle = (atan2(dy, dx) - player.angle + DEG[360]) % DEG[360];

      if (spriteAngle > DEG[270] || spriteAngle < DEG[90]) {
        correctedDistance = COS[spriteAngle] * actualDistance;

        if (DRAW_DISTANCE === 0 || DRAW_DISTANCE > correctedDistance) {
          spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
          spriteWidth = sprite.getLocalBounds().width * spriteScale;
          spriteHeight = sprite.getLocalBounds().height * spriteScale;
          spriteX = TAN[spriteAngle] * CAMERA_DISTANCE;

          sprite.position.x = CAMERA_CENTER_X + spriteX - spriteWidth / 2;
          sprite.position.y = CAMERA_CENTER_Y
            - (spriteHeight / (TILE_SIZE / (TILE_SIZE - eyeHeight)));
          sprite.width = spriteWidth;
          sprite.height = spriteHeight;
          sprite.zOrder = actualDistance;
          sprite.tint = calculateTint(this.brightness, actualDistance);
          sprite.visible = true;

          if (sprite.updateAnimation) {
            sprite.updateAnimation(bodies[bodyId], player);
          }
        }
      }
    }

    super.animate();
  }
}

export default WorldContainer;
