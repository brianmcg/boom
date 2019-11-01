import { Container, ColorMatrixFilter } from '~/core/graphics';
import {
  DEG,
  COS,
  TAN,
  SIN,
  atan2,
  castRay,
} from '~/core/physics';
import {
  SCREEN,
  TILE_SIZE,
  DRAW_DISTANCE,
  FOV,
} from '~/constants/config';
import { GREY, BLACK } from '~/constants/colors';
import MapContainer from './containers/MapContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import PlayerContainer from './containers/PlayerContainer';

const DEG_360 = DEG[360];

const DEG_270 = DEG[270];

const DEG_90 = DEG[90];

const HALF_FOV = DEG[FOV / 2];

const CAMERA_CENTER_Y = SCREEN.HEIGHT / 2;

const CAMERA_CENTER_X = SCREEN.WIDTH / 2;

const CAMERA_DISTANCE = CAMERA_CENTER_X / TAN[HALF_FOV];


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
let sprite;
let dx;
let dy;
let spriteAngle;
let spriteScale;
let spriteWidth;
let spriteX;
let centerY;
let rayAngle;
let body;

/**
 * Class representing a WorldContainer.
 */
class WorldContainer extends Container {
  /**
   * Creates a WorldContainer.
   * @param  {World}  options.world   The world.
   * @param  {Object} options.sprites The sprites object.
   */
  constructor({ world, sprites }) {
    super();

    const { map, background, player } = sprites;

    this.backgroundContainer = new BackgroundContainer(background);
    this.mapContainer = new MapContainer(map);
    this.playerContainer = new PlayerContainer(player);

    this.world = world;

    this.addChild(this.backgroundContainer);
    this.addChild(this.mapContainer);
    this.addChild(this.playerContainer);

    this.colorMatrixFilter = new ColorMatrixFilter();
    this.colorMatrixFilter.enabled = false;
    this.filters = [this.colorMatrixFilter];
  }

  /**
   * Animate the container.
   */
  animate() {
    const { player } = this.world;
    const { background } = this.backgroundContainer;
    const { walls, entities } = this.mapContainer;
    const totalEncounteredBodies = {};

    // Get initial ray angle 30 deg less than player angle
    rayAngle = (player.angle - HALF_FOV + DEG_360) % DEG_360;

    // Get center of screen
    centerY = CAMERA_CENTER_Y + player.cameraRotation;

    // Iterate over screen width
    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      wallSprite = walls[xIndex];

      // Cast ray
      const {
        encounteredBodies,
        distance,
        isHorizontal,
        side,
        sectorIntersection,
      } = castRay({ rayAngle, caster: player });

      // Update wall sprites
      angleDifference = (rayAngle - player.angle + DEG_360) % DEG_360;
      correctedDistance = distance * COS[angleDifference];
      spriteHeight = TILE_SIZE * CAMERA_DISTANCE / correctedDistance;
      spriteY = centerY
        - (spriteHeight / (TILE_SIZE / (TILE_SIZE - player.cameraHeight)));

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
          actualDistance = player.cameraHeight / (yIndex - centerY) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / COS[angleDifference];

          if (DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));
            pixelX = (mapX + TILE_SIZE) % TILE_SIZE;
            pixelY = (mapY + TILE_SIZE) % TILE_SIZE;
            gridX = Math.max(Math.min(Math.floor(mapX / TILE_SIZE), this.world.width - 1), 0);
            gridY = Math.max(Math.min(Math.floor(mapY / TILE_SIZE), this.world.height - 1), 0);
            bottomId = this.world.getSector(gridX, gridY).bottom;
            backgroundSprite.changeTexture(bottomId, pixelX, pixelY);
            backgroundSprite.tint = this.calculateTint(actualDistance);
          } else {
            backgroundSprite.tint = BLACK;
          }
        } else if (yIndex <= wallTopIntersection) {
          actualDistance = (TILE_SIZE - player.cameraHeight) / (centerY - yIndex) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / COS[angleDifference];

          if (DRAW_DISTANCE > correctedDistance) {
            mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
            mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));
            pixelX = (mapX + TILE_SIZE) % TILE_SIZE;
            pixelY = (mapY + TILE_SIZE) % TILE_SIZE;
            gridX = Math.max(Math.min(Math.floor(mapX / TILE_SIZE), this.world.width - 1), 0);
            gridY = Math.max(Math.min(Math.floor(mapY / TILE_SIZE), this.world.height - 1), 0);
            topId = this.world.getSector(gridX, gridY).top;
            backgroundSprite.changeTexture(topId, pixelX, pixelY);
            backgroundSprite.tint = this.calculateTint(actualDistance);
          } else {
            backgroundSprite.tint = BLACK;
          }
        } else {
          backgroundSprite.tint = BLACK;
        }
      }

      // Add to total bodies encountered
      Object.assign(totalEncounteredBodies, encounteredBodies);

      // Increment ray angle
      rayAngle = (rayAngle + 1) % DEG_360;
    }

    // Update entity sprites
    Object.keys(entities).forEach((id) => {
      sprite = entities[id];
      body = totalEncounteredBodies[id];

      if (body) {
        dx = body.x - player.x;
        dy = body.y - player.y;
        actualDistance = Math.sqrt(dx * dx + dy * dy);
        spriteAngle = (atan2(dy, dx) - player.angle + DEG_360) % DEG_360;

        if (spriteAngle > DEG_270 || spriteAngle < DEG_90) {
          correctedDistance = COS[spriteAngle] * actualDistance;

          if (DRAW_DISTANCE > correctedDistance) {
            spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
            spriteWidth = TILE_SIZE * spriteScale;
            spriteHeight = TILE_SIZE * spriteScale;
            spriteX = TAN[spriteAngle] * CAMERA_DISTANCE;
            sprite.position.x = CAMERA_CENTER_X + spriteX - spriteWidth / 2;
            sprite.position.y = centerY
              - (spriteHeight / (TILE_SIZE / (TILE_SIZE - player.cameraHeight)));
            sprite.width = spriteWidth;
            sprite.height = spriteHeight;
            sprite.zOrder = actualDistance;
            sprite.tint = this.calculateTint(actualDistance);
            this.mapContainer.addChild(sprite);
          } else {
            this.mapContainer.removeChild(sprite);
          }
        } else {
          this.mapContainer.removeChild(sprite);
        }
      } else {
        this.mapContainer.removeChild(sprite);
      }
    });

    // Sort sprites in map container
    this.mapContainer.sort();

    super.animate();
  }

  /**
   * Calculate the tint.
   * @param  {Number} distance The distance.
   * @param  {Number} side     The side.
   */
  calculateTint(distance = 0, side = 0) {
    let intensity = 1;

    if (distance > DRAW_DISTANCE) {
      distance = DRAW_DISTANCE;
    }

    if (side) {
      intensity -= 0.1;
    }

    intensity += this.world.brightness;
    intensity -= (distance / DRAW_DISTANCE);

    if (intensity > 1) {
      intensity = 1;
    }

    if (intensity < 0) {
      return 0;
    }

    return Math.round(intensity * 255) * GREY;
  }
}

export default WorldContainer;
