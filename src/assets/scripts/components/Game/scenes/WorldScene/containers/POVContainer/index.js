import { Container } from 'game/core/graphics';
import { degrees, castRay } from 'game/core/physics';
import {
  SCREEN,
  CELL_SIZE,
  FOV,
  WALL_LAYERS,
} from 'game/constants/config';
import { GREY, WHITE } from 'game/constants/colors';
import MapContainer from './containers/MapContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import PlayerContainer from './containers/PlayerContainer';

const DEG_360 = degrees(360);
const DEG_270 = degrees(270);
const DEG_90 = degrees(90);
const HALF_FOV = degrees(FOV) / 2;
const CAMERA_CENTER_Y = SCREEN.HEIGHT / 2;
const CAMERA_CENTER_X = SCREEN.WIDTH / 2;
const CAMERA_DISTANCE = CAMERA_CENTER_X / Math.tan(HALF_FOV);
const ANGLE_INCREMENT = degrees(FOV) / SCREEN.WIDTH;

let spriteAngle;
let centerY;
let gridX;
let gridY;
let mapX;
let mapY;
let pixelX;
let pixelY;
let pixelSource;
let angle;
let sliceY;
let sprite;
let spriteHeight;
let spriteScale;
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

    this.world = world;
    this.backgroundContainer = new BackgroundContainer(sprites.background);
    this.mapContainer = new MapContainer(world, sprites.map);
    this.playerContainer = new PlayerContainer(world.player, sprites.player);

    this.displayedEntities = [];
    this.sprites = sprites;

    this.addChild(this.backgroundContainer);
    this.addChild(this.mapContainer);
    this.addChild(this.playerContainer);
  }

  /**
   * Update the container.
   * @param  {Number} delta     The time delta.
   * @param  {Number} elapsedMS The elapsed time since the last frame.
   */
  update(delta, elapsedMS) {
    const { world } = this;

    const {
      player,
      maxMapX,
      maxMapY,
      effects,
      sky,
    } = world;

    // Remove sprites from previous run.
    this.displayedEntities.forEach(entity => this.mapContainer.removeChild(entity));
    this.displayedEntities = [];

    const { map: mapSprites, background: backgroundSprites } = this.sprites;
    const { inner: innerSprites, outer: outerSprites } = backgroundSprites;
    const { entities: entititySprites, effects: effectSprites, walls: wallSprites } = mapSprites;

    const totalEncounteredBodies = {};

    // Get initial ray angle 30 deg less than player angle
    angle = (player.viewAngle - HALF_FOV + DEG_360) % DEG_360;

    // Get center of screen
    centerY = CAMERA_CENTER_Y + player.viewPitch;

    // Iterate over screen width
    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      // Cast ray
      const rays = castRay({
        x: player.x,
        y: player.y,
        angle,
        world,
      });

      // Update wall sprites.
      for (let i = 0; i < WALL_LAYERS; i += 1) {
        const ray = rays[i];

        if (ray) {
          const {
            distance,
            encounteredBodies,
            isHorizontal,
            cell,
            endPoint,
            side,
          } = ray;

          // Update total encountered bodies.
          Object.assign(totalEncounteredBodies, encounteredBodies);

          const { name, spatter } = side;

          sprite = wallSprites[i][xIndex];
          sprite.visible = true;

          if (isHorizontal) {
            sliceY = false && cell.offset ? endPoint.x - cell.offset.x : endPoint.x;
          } else {
            sliceY = false && cell.offset ? endPoint.y - cell.offset.y : endPoint.y;
          }

          sliceY = Math.floor(sliceY) % CELL_SIZE;

          if (cell.reverse) {
            sliceY = CELL_SIZE - sliceY - 1;
          }

          spriteAngle = (angle - player.viewAngle + DEG_360) % DEG_360;
          correctedDistance = distance * Math.cos(spriteAngle);
          spriteHeight = cell.height * CAMERA_DISTANCE / correctedDistance;
          spriteY = centerY
            - (spriteHeight / (cell.height / (cell.height - player.viewHeight)));
          sprite.height = spriteHeight;
          sprite.y = spriteY;
          sprite.zOrder = distance;
          sprite.changeTexture(name, sliceY, spatter);
          sprite.tint = this.calculateTint(distance, isHorizontal);
        } else {
          wallSprites[i][xIndex].visible = false;
        }
      }

      // Update background sprites
      bottomIntersection = Math.floor(spriteY + spriteHeight);
      topIntersection = Math.ceil(spriteY);

      for (let yIndex = 0; yIndex <= topIntersection; yIndex += 1) {
        sprite = innerSprites[xIndex][yIndex];

        if (sprite) {
          actualDistance = (CELL_SIZE - player.viewHeight) / (centerY - yIndex) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / Math.cos(spriteAngle);
          mapX = Math.floor(player.x + (Math.cos(angle) * correctedDistance));
          mapX = (mapX > maxMapX) ? maxMapX : mapX;
          mapX = (mapX < 0) ? 0 : mapX;

          mapY = Math.floor(player.y + (Math.sin(angle) * correctedDistance));
          mapY = (mapY > maxMapY) ? maxMapY : mapY;
          mapY = (mapY < 0) ? 0 : mapY;

          pixelX = (mapX + CELL_SIZE) % CELL_SIZE;
          pixelY = (mapY + CELL_SIZE) % CELL_SIZE;

          gridX = Math.floor(mapX / CELL_SIZE);
          gridY = Math.floor(mapY / CELL_SIZE);

          pixelSource = world.getCell(gridX, gridY).top;

          if (pixelSource) {
            sprite.changeTexture(pixelSource.name, pixelX, pixelY);
            sprite.tint = this.calculateTint(actualDistance);
            sprite.alpha = 1;
          } else {
            sprite.alpha = 0;
          }
        }
      }

      for (let yIndex = topIntersection + 1; yIndex < bottomIntersection - 1; yIndex += 1) {
        sprite = innerSprites[xIndex][yIndex];

        if (sprite) {
          sprite.alpha = 0;
        }
      }

      for (let yIndex = bottomIntersection; yIndex < SCREEN.HEIGHT; yIndex += 1) {
        sprite = innerSprites[xIndex][yIndex];

        if (sprite) {
          actualDistance = player.viewHeight / (yIndex - centerY) * CAMERA_DISTANCE;
          correctedDistance = actualDistance / Math.cos(spriteAngle);
          mapX = Math.floor(player.x + (Math.cos(angle) * correctedDistance));
          mapX = (mapX > maxMapX) ? maxMapX : mapX;
          mapX = (mapX < 0) ? 0 : mapX;

          mapY = Math.floor(player.y + (Math.sin(angle) * correctedDistance));
          mapY = (mapY > maxMapY) ? maxMapY : mapY;
          mapY = (mapY < 0) ? 0 : mapY;

          pixelX = (mapX + CELL_SIZE) % CELL_SIZE;
          pixelY = (mapY + CELL_SIZE) % CELL_SIZE;

          gridX = Math.floor(mapX / CELL_SIZE);
          gridY = Math.floor(mapY / CELL_SIZE);

          pixelSource = world.getCell(gridX, gridY).bottom;

          if (pixelSource) {
            sprite.changeTexture(pixelSource.name, pixelX, pixelY);
            sprite.tint = this.calculateTint(actualDistance);
            sprite.alpha = 1;
          } else {
            sprite.alpha = 0;
          }
        }
      }

      // Increment ray angle
      angle = (angle + ANGLE_INCREMENT) % DEG_360;
    }

    // Update sky
    sky.forEach((skyObject) => {
      sprite = outerSprites[skyObject.name];

      spriteAngle = (player.getAngleTo({
        x: skyObject.x,
        y: skyObject.y,
      }) - player.viewAngle + DEG_360) % DEG_360;

      spriteScale = Math.abs(CAMERA_DISTANCE / skyObject.distance);
      spriteHeight = CELL_SIZE * spriteScale;
      sprite.y = centerY
        - (spriteHeight / (CELL_SIZE / (CELL_SIZE + (skyObject.elavation) - player.viewHeight)));

      if (sprite.updateX) {
        if (spriteAngle > DEG_90 && spriteAngle < DEG_270) {
          sprite.x = CAMERA_CENTER_X + (Math.tan(spriteAngle) * CAMERA_DISTANCE);
          sprite.alpha = 1;
        } else {
          sprite.alpha = 0;
        }
      }
    });

    // Update entity sprites
    Object.values(totalEncounteredBodies).forEach((body) => {
      sprite = entititySprites[body.id];

      if (sprite) {
        spriteAngle = (player.getAngleTo(body) - player.viewAngle + DEG_360) % DEG_360;
        actualDistance = player.getDistanceTo(body);
        correctedDistance = Math.cos(spriteAngle) * actualDistance;
        spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
        spriteHeight = CELL_SIZE * spriteScale;
        spriteX = Math.tan(spriteAngle) * CAMERA_DISTANCE;
        sprite.x = CAMERA_CENTER_X + spriteX;
        sprite.y = centerY
          - (spriteHeight / (CELL_SIZE / (CELL_SIZE + body.elavation - player.viewHeight)))
          + (spriteHeight / 2);
        sprite.width = spriteHeight;
        sprite.height = spriteHeight;
        sprite.zOrder = actualDistance;
        sprite.tint = this.calculateTint(actualDistance);
        this.mapContainer.addChild(sprite);
        this.displayedEntities.push(sprite);
      }
    });

    // Update effect sprites.
    effects.forEach((effect) => {
      sprite = effectSprites[effect.sourceId];

      if (player.isFacing(effect)) {
        spriteAngle = (player.getAngleTo(effect) - player.viewAngle + DEG_360) % DEG_360;
        actualDistance = player.getDistanceTo(effect);
        correctedDistance = Math.cos(spriteAngle) * actualDistance;
        spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
        spriteHeight = CELL_SIZE * spriteScale;
        spriteX = Math.tan(spriteAngle) * CAMERA_DISTANCE;
        sprite.x = CAMERA_CENTER_X + spriteX;
        sprite.y = centerY
          - (spriteHeight / (CELL_SIZE / (CELL_SIZE + effect.z - player.viewHeight)))
          + (spriteHeight / 2);
        sprite.width = spriteHeight;
        sprite.height = spriteHeight;
        sprite.zOrder = actualDistance;
        sprite.tint = this.calculateTint(actualDistance);
        sprite.visible = true;
      } else {
        sprite.visible = false;
      }
    });

    super.update(delta, elapsedMS);
  }

  /**
   * Remove the HUD diplay.
   */
  removeHud() {
    this.playerContainer.removeHud();
  }

  /**
   * Calculate the tint.
   * @param  {Number}  distance The distance.
   * @param  {Boolean} darken   Darken the sprite.
   */
  calculateTint(distance, darken) {
    const { flash, brightness, visibility } = this.world;

    let intensity = brightness - (distance / visibility);

    if (intensity < 0) {
      intensity = 0;
    }

    intensity += flash;

    if (darken) {
      intensity -= 0.1;
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
