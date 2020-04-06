import { Container } from 'game/core/graphics';
import {
  DEG,
  COS,
  TAN,
  SIN,
} from 'game/core/physics';
import { SCREEN, CELL_SIZE, FOV } from 'game/constants/config';
import { GREY, WHITE } from 'game/constants/colors';
import MapContainer from './containers/MapContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import PlayerContainer from './containers/PlayerContainer';

const DEG_360 = DEG[360];
const HALF_FOV = DEG[FOV / 2];
const CAMERA_CENTER_Y = SCREEN.HEIGHT / 2;
const CAMERA_CENTER_X = SCREEN.WIDTH / 2;
const CAMERA_DISTANCE = CAMERA_CENTER_X / TAN[HALF_FOV];

let spriteAngle;
let body;
let centerY;
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

/**
 * Class representing a POVContainer.
 */
class POVContainer extends Container {
  /**
   * Creates a POVContainer.
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
    const {
      player,
      maxCellX,
      maxCellY,
      explosions,
    } = this.world;

    // this.mapContainer.reset();

    const { background } = this.backgroundContainer;
    const { walls, entities, effects } = this.mapContainer;
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
        cell,
        endPoint,
        side,
      } = player.castRay(rayAngle);

      const { name, spatter } = side;

      // Update total encountered bodies.
      Object.assign(totalEncounteredBodies, encounteredBodies);

      // Update wall sprites.
      if (isHorizontal) {
        sliceY = cell.offset ? endPoint.x - cell.offset.x : endPoint.x;
      } else {
        sliceY = cell.offset ? endPoint.y - cell.offset.y : endPoint.y;
      }

      sliceY = CELL_SIZE - (Math.floor(sliceY) % CELL_SIZE) - 1;

      spriteAngle = (rayAngle - player.viewAngle + DEG_360) % DEG_360;
      correctedDistance = distance * COS[spriteAngle];
      spriteHeight = CELL_SIZE * CAMERA_DISTANCE / correctedDistance;
      spriteY = centerY
        - (spriteHeight / (CELL_SIZE / (CELL_SIZE - player.viewHeight)));
      sprite.height = spriteHeight;
      sprite.y = spriteY;
      sprite.zOrder = distance;
      sprite.changeTexture(name, sliceY, spatter);
      sprite.tint = this.calculateTint(distance, isHorizontal);

      // Update background sprites
      bottomIntersection = Math.floor(spriteY + spriteHeight);
      topIntersection = Math.ceil(spriteY);

      for (let yIndex = 0; yIndex <= topIntersection; yIndex += 1) {
        sprite = background[xIndex][yIndex];

        if (sprite) {
          actualDistance = (CELL_SIZE - player.viewHeight) / (centerY - yIndex) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / COS[spriteAngle];
          mapX = Math.floor(player.x + (COS[rayAngle] * correctedDistance));
          mapY = Math.floor(player.y + (SIN[rayAngle] * correctedDistance));
          pixelX = (mapX + CELL_SIZE) % CELL_SIZE;
          pixelY = (mapY + CELL_SIZE) % CELL_SIZE;
          gridX = Math.floor(mapX / CELL_SIZE);
          gridX = (gridX > maxCellX) ? maxCellX : gridX;
          gridX = (gridX < 0) ? 0 : gridX;
          gridY = Math.floor(mapY / CELL_SIZE);
          gridY = (gridY > maxCellY) ? maxCellY : gridY;
          gridY = (gridY < 0) ? 0 : gridY;
          sprite.changeTexture(this.world.getCell(gridX, gridY).top.name, pixelX, pixelY);
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
          pixelX = (mapX + CELL_SIZE) % CELL_SIZE;
          pixelY = (mapY + CELL_SIZE) % CELL_SIZE;
          gridX = Math.floor(mapX / CELL_SIZE);
          gridX = (gridX > maxCellX) ? maxCellX : gridX;
          gridX = (gridX < 0) ? 0 : gridX;
          gridY = Math.floor(mapY / CELL_SIZE);
          gridY = (gridY > maxCellY) ? maxCellY : gridY;
          gridY = (gridY < 0) ? 0 : gridY;
          sprite.changeTexture(this.world.getCell(gridX, gridY).bottom.name, pixelX, pixelY);
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
        spriteAngle = (player.getAngleTo(body) - player.viewAngle + DEG_360) % DEG_360;
        actualDistance = player.getDistanceTo(body);
        correctedDistance = COS[spriteAngle] * actualDistance;
        spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
        spriteWidth = CELL_SIZE * spriteScale;
        spriteHeight = CELL_SIZE * spriteScale;
        spriteX = TAN[spriteAngle] * CAMERA_DISTANCE;
        sprite.x = CAMERA_CENTER_X + spriteX - spriteWidth / 2;
        sprite.y = centerY
          - (spriteHeight / (CELL_SIZE / (CELL_SIZE - player.viewHeight)));
        sprite.width = spriteWidth;
        sprite.height = spriteHeight;
        sprite.zOrder = actualDistance;
        sprite.tint = this.calculateTint(actualDistance);
        this.mapContainer.addChild(sprite);
      } else {
        this.mapContainer.removeChild(sprite);
      }
    });

    // Update effects.
    explosions.forEach((explosion) => {
      sprite = effects.explosions[explosion.sourceId];

      if (explosion.isTriggered) {
        this.mapContainer.addChild(sprite);
      }

      if (player.isFacing(explosion)) {
        spriteAngle = (player.getAngleTo(explosion) - player.viewAngle + DEG_360) % DEG_360;
        actualDistance = player.getDistanceTo(explosion);
        correctedDistance = COS[spriteAngle] * actualDistance;
        spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
        spriteWidth = CELL_SIZE * spriteScale;
        spriteHeight = CELL_SIZE * spriteScale;
        spriteX = TAN[spriteAngle] * CAMERA_DISTANCE;
        sprite.x = CAMERA_CENTER_X + spriteX - spriteWidth / 2;
        sprite.y = centerY
          - (spriteHeight / (CELL_SIZE / (CELL_SIZE - player.viewHeight)));
        sprite.width = spriteWidth;
        sprite.height = spriteHeight;
        sprite.zOrder = actualDistance;
        sprite.tint = this.calculateTint(actualDistance);
        sprite.visible = true;
      } else {
        sprite.visible = false;
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

export default POVContainer;