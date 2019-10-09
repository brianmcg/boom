import { Container } from '~/core/graphics';
import {
  DEG,
  COS,
  TAN,
  SIN,
  atan2,
  castRay,
} from '~/core/physics';
import { SCREEN, TILE_SIZE, DRAW_DISTANCE } from '~/constants/config';
import { GREY } from '~/constants/colors';
import Camera from './components/Camera';
import MapContainer from './containers/MapContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import PlayerContainer from './containers/PlayerContainer';

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
let gridX;
let gridY;
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

    const { map, background, player } = sprites;

    this.backgroundContainer = new BackgroundContainer(background);
    this.mapContainer = new MapContainer(map);
    this.playerContainer = new PlayerContainer(player);

    this.camera = new Camera(level.player);
    this.level = level;
    this.brightness = 0;

    this.addChild(this.backgroundContainer);
    this.addChild(this.mapContainer);
    this.addChild(this.playerContainer);

    // bottomId = level.getSector(0, 0).bottom;
    // topId = level.getSector(0, 0).top;
  }

  update(...options) {
    super.update(...options);
    this.level.update(...options);
    this.camera.update(...options);
  }

  animate() {
    const { player, bodies } = this.level;
    const { background } = this.backgroundContainer;
    const { walls, entities } = this.mapContainer;

    const totalVisibleBodyIds = [];

    // Get initial ray angle 30 deg less than player angle
    let rayAngle = (player.angle - DEG[30] + DEG[360]) % DEG[360];

    // Reset map container
    this.mapContainer.reset();

    // Iterate over screen width
    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      wallSprite = walls[xIndex];

      // Cast ray
      const {
        visibleBodyIds,
        distance,
        isHorizontal,
        side,
        sectorIntersection,
      } = castRay({ rayAngle, caster: player });

      // Update wall sprites
      angleDifference = (rayAngle - player.angle + DEG[360]) % DEG[360];
      correctedDistance = distance * COS[angleDifference];
      spriteHeight = TILE_SIZE * this.camera.distance / correctedDistance;
      spriteY = this.camera.centerY
        - (spriteHeight / (TILE_SIZE / (TILE_SIZE - this.camera.height)));

      if (distance < DRAW_DISTANCE) {
        wallSprite.height = spriteHeight;
        wallSprite.y = spriteY;
        wallSprite.zOrder = distance;
        wallSprite.changeTexture(side, sectorIntersection);
        wallSprite.tint = this.calculateTint(distance, isHorizontal);
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

          if (DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));
            pixelX = (mapX + TILE_SIZE) % TILE_SIZE;
            pixelY = (mapY + TILE_SIZE) % TILE_SIZE;
            gridX = Math.max(Math.min(Math.floor(mapX / TILE_SIZE), this.level.width - 1), 0);
            gridY = Math.max(Math.min(Math.floor(mapY / TILE_SIZE), this.level.height - 1), 0);
            bottomId = this.level.getSector(gridX, gridY).bottom;
            backgroundSprite.changeTexture(bottomId, pixelX, pixelY);
            backgroundSprite.alpha = 1;
            backgroundSprite.tint = this.calculateTint(actualDistance);
          } else {
            backgroundSprite.alpha = 0;
          }
        } else if (yIndex <= wallTopIntersection) {
          actualDistance = (TILE_SIZE - this.camera.height) / (this.camera.centerY - yIndex)
            * this.camera.distance;
          correctedDistance = actualDistance / COS[angleDifference];

          if (DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));
            pixelX = (mapX + TILE_SIZE) % TILE_SIZE;
            pixelY = (mapY + TILE_SIZE) % TILE_SIZE;
            gridX = Math.max(Math.min(Math.floor(mapX / TILE_SIZE), this.level.width - 1), 0);
            gridY = Math.max(Math.min(Math.floor(mapY / TILE_SIZE), this.level.height - 1), 0);
            topId = this.level.getSector(gridX, gridY).top;
            backgroundSprite.changeTexture(topId, pixelX, pixelY);
            backgroundSprite.alpha = 1;
            backgroundSprite.tint = this.calculateTint(actualDistance);
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

      // Increment ray angle
      rayAngle = (rayAngle + 1) % DEG[360];
    }

    // Update the visible bodies
    for (let i = 0; i < totalVisibleBodyIds.length; i += 1) {
      bodyId = totalVisibleBodyIds[i];
      sprite = entities[bodyId];
      dx = bodies[bodyId].x - player.x;
      dy = bodies[bodyId].y - player.y;
      actualDistance = Math.sqrt(dx * dx + dy * dy);
      spriteAngle = (atan2(dy, dx) - player.angle + DEG[360]) % DEG[360];

      if (spriteAngle > DEG[270] || spriteAngle < DEG[90]) {
        correctedDistance = COS[spriteAngle] * actualDistance;

        if (DRAW_DISTANCE > correctedDistance) {
          spriteScale = Math.abs(this.camera.distance / correctedDistance);
          spriteWidth = TILE_SIZE * spriteScale;
          spriteHeight = TILE_SIZE * spriteScale;
          spriteX = TAN[spriteAngle] * this.camera.distance;
          sprite.position.x = this.camera.centerX + spriteX - spriteWidth / 2;
          sprite.position.y = this.camera.centerY
            - (spriteHeight / (TILE_SIZE / (TILE_SIZE - this.camera.height)));
          sprite.width = spriteWidth;
          sprite.height = spriteHeight;
          sprite.zOrder = actualDistance;
          sprite.tint = this.calculateTint(actualDistance);
          sprite.visible = true;

          if (sprite.animate) {
            sprite.animate(bodies[bodyId], player);
          }
        }
      }
    }

    // Sort sprites in map container
    this.mapContainer.sort();
  }

  calculateTint(distance = 0, side = 0) {
    let intensity = 1;

    if (distance > DRAW_DISTANCE) {
      distance = DRAW_DISTANCE;
    }

    if (side) {
      intensity -= 0.1;
    }

    intensity += this.brightness;
    intensity -= (distance / DRAW_DISTANCE);

    if (intensity > 1) {
      intensity = 1;
    }

    if (intensity < 0) {
      intensity = 0;
    }

    return Math.round(intensity * 255) * GREY;
  }
}

export default WorldContainer;
