import { Container } from '~/core/graphics';
import {
  DEG,
  COS,
  TAN,
  SIN,
  atan2,
} from '~/core/physics';
import Camera from '~/engine/components/Camera';
import { SCREEN, TILE_SIZE, DRAW_DISTANCE } from '~/constants/config';
import { calculateTint } from './helpers';
import MapContainer from './containers/MapContainer';
import BackgroundContainer from './containers/BackgroundContainer';

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

class WorldContainer extends Container {
  constructor({ level, sprites }) {
    super();

    const { map, background } = sprites;

    this.backgroundContainer = new BackgroundContainer(background);
    this.mapContainer = new MapContainer(map);

    this.camera = new Camera(level.player);
    this.level = level;
    this.brightness = 0;

    this.addChild(this.backgroundContainer);
    this.addChild(this.mapContainer);

    // bottomId = level.getSector(0, 0).sideIds[4];
    // topId = level.getSector(0, 0).sideIds[5];
  }

  update(...options) {
    this.level.update(...options);
    this.camera.update(...options);
  }

  animate() {
    const { player, bodies } = this.level;
    const { background } = this.backgroundContainer;
    const { walls, objects } = this.mapContainer;

    const totalVisibleBodyIds = [];

    let rayAngle = (player.angle - DEG[30] + DEG[360]) % DEG[360];

    this.mapContainer.reset();

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
      spriteHeight = TILE_SIZE * this.camera.distance / correctedDistance;
      spriteY = this.camera.centerY
        - (spriteHeight / (TILE_SIZE / (TILE_SIZE - this.camera.height)));

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
          actualDistance = this.camera.height / (yIndex - this.camera.centerY)
            * this.camera.distance;
          correctedDistance = actualDistance / COS[angleDifference];

          if (DRAW_DISTANCE === 0 || DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));

            pixelX = mapX % TILE_SIZE;
            pixelY = mapY % TILE_SIZE;

            bottomId = this.level.getSector(
              Math.floor(mapX / TILE_SIZE),
              Math.floor(mapY / TILE_SIZE),
            ).sideIds[4];

            if (pixelX < 0) {
              pixelX = TILE_SIZE + pixelX;
            }

            if (pixelY < 0) {
              pixelY = TILE_SIZE + pixelY;
            }

            backgroundSprite.changeTexture(bottomId, pixelX, pixelY);
            backgroundSprite.alpha = 1;
            // TODO: test with distance
            backgroundSprite.tint = calculateTint(this.brightness, actualDistance);
          } else {
            backgroundSprite.alpha = 0;
          }
        } else if (yIndex <= wallTopIntersection) {
          actualDistance = (TILE_SIZE - this.camera.height) / (this.camera.centerY - yIndex)
            * this.camera.distance;
          correctedDistance = actualDistance / COS[angleDifference];

          if (DRAW_DISTANCE === 0 || DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));

            pixelX = mapX % TILE_SIZE;
            pixelY = mapY % TILE_SIZE;

            topId = this.level.getSector(
              Math.floor(mapX / TILE_SIZE),
              Math.floor(mapY / TILE_SIZE),
            ).sideIds[5];

            if (pixelX < 0) {
              pixelX = TILE_SIZE + pixelX;
            }

            if (pixelY < 0) {
              pixelY = TILE_SIZE + pixelY;
            }

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

      // Add visible body ids to total
      visibleBodyIds.forEach((id) => {
        if (!totalVisibleBodyIds.includes(id)) {
          totalVisibleBodyIds.push(id);
        }
      });

      // Update ray angle
      rayAngle = (rayAngle + 1) % DEG[360];
    }

    // Update the visible bodies
    for (let i = 0; i < totalVisibleBodyIds.length; i += 1) {
      bodyId = totalVisibleBodyIds[i];
      sprite = objects[bodyId];
      dx = bodies[bodyId].x - player.x;
      dy = bodies[bodyId].y - player.y;
      actualDistance = Math.sqrt(dx * dx + dy * dy);
      spriteAngle = (atan2(dy, dx) - player.angle + DEG[360]) % DEG[360];

      if (spriteAngle > DEG[270] || spriteAngle < DEG[90]) {
        correctedDistance = COS[spriteAngle] * actualDistance;

        if (DRAW_DISTANCE === 0 || DRAW_DISTANCE > correctedDistance) {
          spriteScale = Math.abs(this.camera.distance / correctedDistance);
          spriteWidth = sprite.getLocalBounds().width * spriteScale;
          spriteHeight = sprite.getLocalBounds().height * spriteScale;
          spriteX = TAN[spriteAngle] * this.camera.distance;

          sprite.position.x = this.camera.centerX + spriteX - spriteWidth / 2;
          sprite.position.y = this.camera.centerY
            - (spriteHeight / (TILE_SIZE / (TILE_SIZE - this.camera.height)));
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

    this.mapContainer.sort();
  }
}

export default WorldContainer;
