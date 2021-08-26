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
import InnerContainer from './containers/InnerContainer';
import OuterContainer from './containers/OuterContainer';
import PlayerContainer from './containers/PlayerContainer';

const DEG_360 = degrees(360);
const HALF_FOV = degrees(FOV) / 2;
const HALF_CELL = CELL_SIZE / 2;
const CAMERA_CENTER_Y = SCREEN.HEIGHT / 2;
const CAMERA_CENTER_X = SCREEN.WIDTH / 2;
const CAMERA_DISTANCE = CAMERA_CENTER_X / Math.tan(HALF_FOV);
const RAY_ANGLES = [...Array(SCREEN.WIDTH).keys()]
  .map(i => Math.atan((i - CAMERA_CENTER_X) / CAMERA_DISTANCE));

let spriteAngle;
let centerY;
let gridX;
let gridY;
let mapX;
let mapY;
let pixelX;
let pixelY;
let backgroundName;
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
let backgroundCell;
let sideHeight;
let stainColor;

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
    this.sprites = sprites;
    this.displayedEntities = [];

    if (sprites.sky.length) {
      this.outerContainer = new OuterContainer(sprites.sky);
      this.addChild(this.outerContainer);
    }

    this.backgroundContainer = new InnerContainer(sprites.background);
    this.addChild(this.backgroundContainer);

    this.mapContainer = new MapContainer(world, sprites.map);
    this.addChild(this.mapContainer);

    this.playerContainer = new PlayerContainer(world.player, sprites.player);
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
      floorOffset,
    } = world;

    // Remove sprites from previous run.
    this.displayedEntities.forEach(entity => this.mapContainer.removeChild(entity));

    this.displayedEntities = [];

    const { map: mapSprites, background: backgroundSprites, sky: outerSprites } = this.sprites;
    const { entities: entititySprites, effects: effectSprites, walls: wallSprites } = mapSprites;

    const totalEncounteredBodies = {};

    const floorHeight = CELL_SIZE * floorOffset;
    const doubleFloorHeight = floorHeight * 2;

    const {
      x,
      y,
      viewAngle,
      viewPitch,
      radius,
    } = player;

    // Get center of screen
    centerY = CAMERA_CENTER_Y + viewPitch;

    // Iterate over screen width
    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex++) {
      angle = (viewAngle + RAY_ANGLES[xIndex] + DEG_360) % DEG_360;

      const rays = [];

      // Cast ray
      const raySections = castRay({
        x,
        y,
        angle,
        world,
        radius,
        ignoreOverlay: false,
      });

      for (let i = 0; i < raySections.length; i++) {
        const { side, cell } = raySections[i];
        const { overlay, closed, transparency } = cell;

        sideHeight = side?.height || world.height;

        rays.push(raySections[i]);

        if (!closed && !transparency && sideHeight < world.height) {
          castRay({
            x,
            y,
            angle,
            world,
            radius,
            elavation: sideHeight,
          }).forEach(r => rays.push(r));
        }

        if (overlay) {
          const overlayRay = castRay({
            x,
            y,
            angle,
            world,
            radius,
            ignoreOverlay: true,
          }).find(r => r.cell.overlay);

          if (overlayRay) {
            rays.push(overlayRay);
          }
        }
      }

      // Update wall sprites.
      for (let i = 0; i < WALL_LAYERS; i++) {
        const ray = rays[i];

        if (ray) {
          const {
            distance,
            encounteredBodies,
            isHorizontal,
            cell,
            endPoint,
            side,
            isOverlay,
          } = ray;

          // Update total encountered bodies.
          Object.assign(totalEncounteredBodies, encounteredBodies);

          if (side) {
            const { name, spatter } = side;

            sprite = wallSprites[i][xIndex];
            sprite.visible = true;

            sideHeight = side.height;

            // Determine the slice to render.
            if (!isOverlay && cell.isDoor) {
              if (cell.double) {
                if (isHorizontal) {
                  if (endPoint.x % CELL_SIZE < HALF_CELL) {
                    sliceY = endPoint.x - (CELL_SIZE - (cell.offset.x / 2));
                  } else {
                    sliceY = endPoint.x + (CELL_SIZE - (cell.offset.x / 2));
                  }
                } else if (endPoint.y % CELL_SIZE < HALF_CELL) {
                  sliceY = endPoint.y - (CELL_SIZE - (cell.offset.y / 2));
                } else {
                  sliceY = endPoint.y + (CELL_SIZE - (cell.offset.y / 2));
                }
              } else if (isHorizontal) {
                sliceY = endPoint.x - cell.offset.x;
              } else {
                sliceY = endPoint.y - cell.offset.y;
              }
            } else if (isHorizontal) {
              sliceY = endPoint.x;
            } else {
              sliceY = endPoint.y;
            }

            sliceY = Math.floor(sliceY) % CELL_SIZE;

            if (cell.reverse) {
              sliceY = CELL_SIZE - sliceY - 1;
            }

            spriteAngle = (angle - viewAngle + DEG_360) % DEG_360;
            correctedDistance = distance * Math.cos(spriteAngle);

            if (isOverlay) {
              spriteHeight = Math.abs((cell.overlay.height) * CAMERA_DISTANCE / correctedDistance);
              spriteY = centerY
                - (spriteHeight / (cell.overlay.height
                / (cell.overlay.height - player.viewHeight)));
            } else {
              spriteHeight = Math.abs((sideHeight) * CAMERA_DISTANCE / correctedDistance);
              spriteY = centerY
                - (spriteHeight / (sideHeight / (sideHeight - player.viewHeight)));
            }

            if (floorHeight) {
              spriteHeight = Math.abs(
                (sideHeight - floorHeight) * CAMERA_DISTANCE / correctedDistance,
              );
            }

            sprite.height = spriteHeight;

            if (floorHeight) {
              spriteHeight = Math.abs(
                (sideHeight - doubleFloorHeight) * CAMERA_DISTANCE / correctedDistance,
              );
            }

            sprite.y = spriteY;
            sprite.zOrder = distance;
            sprite.changeTexture(name, sliceY, spatter);
            sprite.tint = this.calculateTint(distance, isHorizontal);
          } else {
            wallSprites[i][xIndex].visible = false;
            spriteY = centerY;
            spriteHeight = 0;
            spriteAngle = (angle - viewAngle + DEG_360) % DEG_360;
          }
        } else {
          wallSprites[i][xIndex].visible = false;
        }
      }

      // Update background sprites
      bottomIntersection = Math.floor(spriteY + spriteHeight);
      topIntersection = Math.ceil(spriteY);

      sideHeight = Math.max(CELL_SIZE, sideHeight);

      for (let yIndex = 0; yIndex <= topIntersection; yIndex++) {
        sprite = backgroundSprites[xIndex][yIndex];

        if (sprite) {
          actualDistance = (sideHeight - player.viewHeight)
            / (centerY - yIndex) * CAMERA_DISTANCE;

          correctedDistance = actualDistance / Math.cos(spriteAngle);

          mapX = Math.floor(player.x + (Math.cos(angle) * correctedDistance));
          mapX = (mapX > maxMapX) ? maxMapX : mapX;
          mapX = (mapX < 0) ? 0 : mapX;

          mapY = Math.floor(player.y + (Math.sin(angle) * correctedDistance));
          mapY = (mapY > maxMapY) ? maxMapY : mapY;
          mapY = (mapY < 0) ? 0 : mapY;

          gridX = Math.floor(mapX / CELL_SIZE);
          gridY = Math.floor(mapY / CELL_SIZE);

          backgroundCell = world.getCell(gridX, gridY);

          if (backgroundCell.height !== sideHeight) {
            actualDistance = (world.height - player.viewHeight)
              / (centerY - yIndex) * CAMERA_DISTANCE;

            correctedDistance = actualDistance / Math.cos(spriteAngle);

            mapX = Math.floor(player.x + (Math.cos(angle) * correctedDistance));
            mapX = (mapX > maxMapX) ? maxMapX : mapX;
            mapX = (mapX < 0) ? 0 : mapX;

            mapY = Math.floor(player.y + (Math.sin(angle) * correctedDistance));
            mapY = (mapY > maxMapY) ? maxMapY : mapY;
            mapY = (mapY < 0) ? 0 : mapY;
          }

          backgroundName = backgroundCell.top?.name;

          pixelX = (mapX + CELL_SIZE) % CELL_SIZE;
          pixelY = (mapY + CELL_SIZE) % CELL_SIZE;

          if (backgroundName) {
            sprite.changeTexture(backgroundName, pixelX, pixelY);
            sprite.tint = this.calculateTint(correctedDistance);
            sprite.alpha = 1;
          } else {
            sprite.alpha = 0;
          }
        }
      }

      for (let yIndex = topIntersection + 1; yIndex < bottomIntersection - 1; yIndex++) {
        sprite = backgroundSprites[xIndex][yIndex];

        if (sprite) {
          sprite.alpha = 0;
        }
      }

      for (let yIndex = bottomIntersection; yIndex < SCREEN.HEIGHT; yIndex++) {
        sprite = backgroundSprites[xIndex][yIndex];

        if (sprite) {
          actualDistance = (player.viewHeight - floorHeight)
            / (yIndex - centerY + 1) * CAMERA_DISTANCE;

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

          backgroundCell = world.getCell(gridX, gridY);
          backgroundName = backgroundCell.bottom?.name;

          if (backgroundName) {
            stainColor = world.stains[mapX][mapY];

            if (stainColor) {
              backgroundName = `${stainColor}_${backgroundName}`;
            }

            sprite.changeTexture(backgroundName, pixelX, pixelY);
            sprite.tint = this.calculateTint(correctedDistance);
            sprite.alpha = 1;
          } else {
            sprite.alpha = 0;
          }
        }
      }
    }

    // Update sky sprites;
    for (let i = 0; i < outerSprites.length; i++) {
      sprite = outerSprites[i];
      spriteHeight = sprite.width * (SCREEN.HEIGHT / sprite.height);
      sprite.x = ((viewAngle / DEG_360) * -spriteHeight) + (i * spriteHeight);
      sprite.y = centerY - CAMERA_CENTER_Y;
    }

    // Update entity sprites
    Object.values(totalEncounteredBodies).forEach((body) => {
      sprite = entititySprites[body.id];

      if (sprite) {
        spriteAngle = (player.getAngleTo(body) - viewAngle + DEG_360) % DEG_360;
        actualDistance = player.getDistanceTo(body);
        correctedDistance = Math.cos(spriteAngle) * actualDistance;
        spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
        spriteHeight = CELL_SIZE * spriteScale;
        spriteX = Math.tan(spriteAngle) * CAMERA_DISTANCE;
        sprite.x = CAMERA_CENTER_X + spriteX;

        sprite.y = centerY - (
          spriteHeight / (
            CELL_SIZE / ((CELL_SIZE * body.anchor) + body.elavation - player.viewHeight)
          )
        ) + spriteHeight;

        sprite.width = spriteHeight * body.scale;
        sprite.height = spriteHeight * body.scale;
        sprite.zOrder = actualDistance;

        sprite.tint = this.calculateTint(actualDistance);

        this.mapContainer.addChild(sprite);
        this.displayedEntities.push(sprite);

        if (sprite.mask) {
          sprite.mask.x = sprite.x;

          sprite.mask.y = centerY
            - (spriteHeight / (CELL_SIZE / (CELL_SIZE - player.viewHeight)))
            + (spriteHeight - (spriteHeight * floorOffset));

          sprite.mask.width = sprite.width;
          sprite.mask.height = sprite.height;

          sprite.mask.zOrder = actualDistance + 0.01;

          this.mapContainer.addChild(sprite.mask);
          this.displayedEntities.push(sprite.mask);
        }
      }
    });

    // Update effect sprites.
    effects.forEach((effect) => {
      sprite = effectSprites[effect.sourceId];

      if (player.isFacing(effect)) {
        spriteAngle = (player.getAngleTo(effect) - viewAngle + DEG_360) % DEG_360;
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
   * Expand the edge wall slices.
   */
  expandEdge() {
    const margin = 20;

    this.sprites.map.walls.forEach((layer) => {
      layer[0].x = -margin;
      layer[0].width = margin + 1;

      layer[layer.length - 1].x = layer.length - 1;
      layer[layer.length - 1].width = margin + 1;
    });
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
