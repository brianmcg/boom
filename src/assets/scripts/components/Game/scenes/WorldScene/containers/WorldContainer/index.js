import { Container } from 'game/core/graphics';
import {
  DEG,
  COS,
  TAN,
  SIN,
  atan2,
} from 'game/core/physics';
import { SCREEN, TILE_SIZE, FOV } from 'game/constants/config';
import { GREY, WHITE } from 'game/constants/colors';
import MapContainer from './containers/MapContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import PlayerContainer from './containers/PlayerContainer';

const DEG_90 = DEG[90];
const DEG_360 = DEG[360];
const DEG_270 = DEG[270];
const HALF_FOV = DEG[FOV / 2];
const CAMERA_CENTER_Y = SCREEN.HEIGHT / 2;
const CAMERA_CENTER_X = SCREEN.WIDTH / 2;
const CAMERA_DISTANCE = CAMERA_CENTER_X / TAN[HALF_FOV];

let spriteAngle;
let body;
let centerY;
let dx;
let dy;
let gridX;
let gridY;
let mapX;
let mapY;
let pixelX;
let pixelY;
let rayAngle;
let sliceY;
let sprite;
let spriteHeight;
let spriteScale;
let spriteWidth;
let spriteX;
let spriteY;
let bottomIntersection;
let topIntersection;
let actualDistance;
let correctedDistance;
let stain;

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
    this.playerContainer = new PlayerContainer(world.player, player);

    this.world = world;

    this.addChild(this.backgroundContainer);
    this.addChild(this.mapContainer);
    this.addChild(this.playerContainer);
  }

  /**
   * Animate the container.
   */
  animate() {
    const { player, maxSectorX, maxSectorY } = this.world;
    const { background } = this.backgroundContainer;
    const { walls, entities } = this.mapContainer;
    const totalEncounteredBodies = {};

    // Get initial ray angle 30 deg less than player angle
    rayAngle = (player.viewAngle - HALF_FOV + DEG_360) % DEG_360;

    // Get center of screen
    centerY = CAMERA_CENTER_Y + player.viewPitch;

    // Iterate over screen width
    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      sprite = walls[xIndex];

      // Cast ray
      const {
        distance,
        encounteredBodies,
        isHorizontal,
        sector,
        endPoint,
        side,
      } = player.castRay(rayAngle);

      stain = side.isStained ? side.stain : 0;

      // Update total encountered bodies.
      Object.assign(totalEncounteredBodies, encounteredBodies);

      // Update wall sprites.
      if (isHorizontal) {
        sliceY = sector.offset ? endPoint.x - sector.offset.x : endPoint.x;
      } else {
        sliceY = sector.offset ? endPoint.y - sector.offset.y : endPoint.y;
      }

      sliceY = TILE_SIZE - (Math.floor(sliceY) % TILE_SIZE) - 1;

      spriteAngle = (rayAngle - player.viewAngle + DEG_360) % DEG_360;
      correctedDistance = distance * COS[spriteAngle];
      spriteHeight = TILE_SIZE * CAMERA_DISTANCE / correctedDistance;
      spriteY = centerY
        - (spriteHeight / (TILE_SIZE / (TILE_SIZE - player.viewHeight)));
      sprite.height = spriteHeight;
      sprite.y = spriteY;
      sprite.zOrder = distance;
      sprite.changeTexture(side.texture, sliceY, stain);
      sprite.tint = this.calculateTint(distance, isHorizontal);

      // Update background sprites
      bottomIntersection = Math.floor(spriteY + spriteHeight);
      topIntersection = Math.ceil(spriteY);

      for (let yIndex = 0; yIndex <= topIntersection; yIndex += 1) {
        sprite = background[xIndex][yIndex];

        if (sprite) {
          actualDistance = (TILE_SIZE - player.viewHeight) / (centerY - yIndex) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / COS[spriteAngle];
          mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
          mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));
          pixelX = (mapX + TILE_SIZE) % TILE_SIZE;
          pixelY = (mapY + TILE_SIZE) % TILE_SIZE;
          gridX = Math.floor(mapX / TILE_SIZE);
          gridX = (gridX > maxSectorX) ? maxSectorX : gridX;
          gridX = (gridX < 0) ? 0 : gridX;
          gridY = Math.floor(mapY / TILE_SIZE);
          gridY = (gridY > maxSectorY) ? maxSectorY : gridY;
          gridY = (gridY < 0) ? 0 : gridY;
          sprite.changeTexture(this.world.getSector(gridX, gridY).top.texture, pixelX, pixelY);
          sprite.tint = this.calculateTint(actualDistance);
        }
      }

      for (let yIndex = bottomIntersection; yIndex < SCREEN.HEIGHT; yIndex += 1) {
        sprite = background[xIndex][yIndex];

        if (sprite) {
          actualDistance = player.viewHeight / (yIndex - centerY) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / COS[spriteAngle];
          mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
          mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));
          pixelX = (mapX + TILE_SIZE) % TILE_SIZE;
          pixelY = (mapY + TILE_SIZE) % TILE_SIZE;
          gridX = Math.floor(mapX / TILE_SIZE);
          gridX = (gridX > maxSectorX) ? maxSectorX : gridX;
          gridX = (gridX < 0) ? 0 : gridX;
          gridY = Math.floor(mapY / TILE_SIZE);
          gridY = (gridY > maxSectorY) ? maxSectorY : gridY;
          gridY = (gridY < 0) ? 0 : gridY;
          sprite.changeTexture(this.world.getSector(gridX, gridY).bottom.texture, pixelX, pixelY);
          sprite.tint = this.calculateTint(actualDistance);
        }
      }

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
        spriteAngle = (atan2(dy, dx) - player.viewAngle + DEG_360) % DEG_360;

        if (spriteAngle > DEG_270 || spriteAngle < DEG_90) {
          correctedDistance = COS[spriteAngle] * actualDistance;
          spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
          spriteWidth = TILE_SIZE * spriteScale;
          spriteHeight = TILE_SIZE * spriteScale;
          spriteX = TAN[spriteAngle] * CAMERA_DISTANCE;
          sprite.position.x = CAMERA_CENTER_X + spriteX - spriteWidth / 2;
          sprite.position.y = centerY
            - (spriteHeight / (TILE_SIZE / (TILE_SIZE - player.viewHeight)));
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
    });

    // Sort sprites in map container
    this.mapContainer.sort();

    super.animate();
  }

  /**
   * Calculate the tint.
   * @param  {Number}  distance The distance.
   * @param  {Boolean} darken   Darken the sprite.
   */
  calculateTint(distance, darken) {
    const { brightness, visibility } = this.world;

    let intensity = 1;

    intensity += brightness;
    intensity -= distance / visibility;

    if (darken) {
      intensity -= 0.2;
    }

    if (intensity > 1) {
      return WHITE;
    }

    if (intensity < 0) {
      intensity = 0;
    }

    return Math.round(intensity * 255) * GREY;
  }
}

export default WorldContainer;
