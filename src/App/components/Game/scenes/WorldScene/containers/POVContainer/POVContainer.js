import { Container } from '@game/core/graphics';
import { degrees, castRay } from '@game/core/physics';
import { SCREEN, CELL_SIZE, FOV, WALL_LAYERS } from '@constants/config';
import { LIGHT_GREY, WHITE, BLACK } from '@constants/colors';
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
const RAY_ANGLES = [...Array(SCREEN.WIDTH).keys()].map(i =>
  Math.atan((i - CAMERA_CENTER_X) / CAMERA_DISTANCE)
);

export default class POVContainer extends Container {
  constructor({ world, sprites }) {
    super();

    this.world = world;
    this.sprites = sprites;
    this.displayedEntities = [];

    if (sprites.sky.length) {
      this.outerContainer = new OuterContainer(sprites.sky);
      this.addChild(this.outerContainer);
    }

    this.backgroundContainer = new InnerContainer();
    this.addChild(this.backgroundContainer);

    this.mapContainer = new MapContainer(world, sprites.map);
    this.addChild(this.mapContainer);

    this.playerContainer = new PlayerContainer(world.player, sprites.player);
    this.addChild(this.playerContainer);
  }

  update(ticker) {
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
    let spriteY;
    let bottomIntersection;
    let topIntersection;
    let actualDistance;
    let correctedDistance;
    let backgroundCell;
    let sideHeight;
    let stainColor;
    let correctedDistanceTmp;
    let mapXTmp;
    let mapYTmp;
    let backgroundCellTmp;

    const { world } = this;

    const { player, maxMapX, maxMapY, effects, floorOffset } = world;

    // Remove sprites from previous run.
    this.displayedEntities.forEach(entity =>
      this.mapContainer.removeChild(entity)
    );

    this.displayedEntities = [];

    const {
      map: mapSprites,
      background: backgroundSprites,
      sky: outerSprites,
    } = this.sprites;
    const {
      entities: entititySprites,
      effects: effectSprites,
      walls: wallSprites,
    } = mapSprites;

    const totalEncounteredBodies = world.alwaysRender.reduce(
      (memo, entity) =>
        player.isFacing(entity) ? { ...memo, [entity.id]: entity } : memo,
      {}
    );

    const floorHeight = CELL_SIZE * floorOffset;
    const doubleFloorHeight = floorHeight * 2;

    const { x, y, viewAngle, viewPitch, radius } = player;

    const updatedBackgroundSprites = [];

    // Get center of screen
    centerY = CAMERA_CENTER_Y + viewPitch;

    // Iterate over screen width
    for (let xIndex = 0, l = SCREEN.WIDTH; xIndex < l; xIndex++) {
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
        checkInitialCell: true,
      });

      for (let i = 0, m = raySections.length; i < m; i++) {
        const { side, cell } = raySections[i];

        const { overlay, closed, isDoor, transparency } = cell;

        sideHeight = side?.height || world.height;

        rays.push(raySections[i]);

        // Cast another ray if the side height is lower than the world height.
        if (!closed && !transparency && sideHeight < world.height) {
          const elavatedRays = castRay({
            x,
            y,
            angle,
            world,
            radius,
            elavation: sideHeight,
            checkInitialCell: true,
            ignoreOverlay: player.cell.isElevator || !(isDoor && !overlay),
          });

          for (let j = 0, n = elavatedRays.length; j < n; j++) {
            rays.push(elavatedRays[j]);
          }
        }

        // Cast another ray if the side hit is an overlay.
        if (overlay) {
          const ignoreOverlayRays = castRay({
            x,
            y,
            angle,
            world,
            radius,
            checkInitialCell: true,
            ignoreOverlay: true,
          });

          for (let j = 0, n = ignoreOverlayRays.length; j < n; j++) {
            const ignoreOverlayRay = ignoreOverlayRays[j];

            if (ignoreOverlayRay.cell.overlay) {
              rays.push(ignoreOverlayRay);
              break;
            }
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
                    sliceY = endPoint.x - (CELL_SIZE - cell.offset.x / 2);
                  } else {
                    sliceY = endPoint.x + (CELL_SIZE - cell.offset.x / 2);
                  }
                } else if (endPoint.y % CELL_SIZE < HALF_CELL) {
                  sliceY = endPoint.y - (CELL_SIZE - cell.offset.y / 2);
                } else {
                  sliceY = endPoint.y + (CELL_SIZE - cell.offset.y / 2);
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
              spriteHeight = Math.abs(
                (cell.overlay.height * CAMERA_DISTANCE) / correctedDistance
              );
              spriteY =
                centerY -
                spriteHeight /
                  (cell.overlay.height /
                    (cell.overlay.height - player.viewHeight));
            } else {
              spriteHeight = Math.abs(
                (sideHeight * CAMERA_DISTANCE) / correctedDistance
              );
              spriteY =
                centerY -
                spriteHeight / (sideHeight / (sideHeight - player.viewHeight));
            }

            if (floorHeight) {
              spriteHeight = Math.abs(
                ((sideHeight - floorHeight) * CAMERA_DISTANCE) /
                  correctedDistance
              );
            }

            sprite.height = spriteHeight;

            if (floorHeight) {
              spriteHeight = Math.abs(
                ((sideHeight - doubleFloorHeight) * CAMERA_DISTANCE) /
                  correctedDistance
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
          actualDistance =
            ((world.height - player.viewHeight) / (centerY - yIndex)) *
            CAMERA_DISTANCE;

          correctedDistance = actualDistance / Math.cos(spriteAngle);

          mapX = Math.floor(player.x + Math.cos(angle) * correctedDistance);
          mapX = mapX > maxMapX ? maxMapX : mapX;
          mapX = mapX < 0 ? 0 : mapX;

          mapY = Math.floor(player.y + Math.sin(angle) * correctedDistance);
          mapY = mapY > maxMapY ? maxMapY : mapY;
          mapY = mapY < 0 ? 0 : mapY;

          gridX = Math.floor(mapX / CELL_SIZE);
          gridY = Math.floor(mapY / CELL_SIZE);

          backgroundCell = world.getCell(gridX, gridY);

          if (world.height !== sideHeight) {
            actualDistance =
              ((sideHeight - player.viewHeight) / (centerY - yIndex)) *
              CAMERA_DISTANCE;

            correctedDistanceTmp = actualDistance / Math.cos(spriteAngle);

            mapXTmp = Math.floor(
              player.x + Math.cos(angle) * correctedDistanceTmp
            );
            mapXTmp = mapXTmp > maxMapX ? maxMapX : mapXTmp;
            mapXTmp = mapXTmp < 0 ? 0 : mapXTmp;

            mapYTmp = Math.floor(
              player.y + Math.sin(angle) * correctedDistanceTmp
            );
            mapYTmp = mapYTmp > maxMapY ? maxMapY : mapYTmp;
            mapYTmp = mapYTmp < 0 ? 0 : mapYTmp;

            gridX = Math.floor(mapXTmp / CELL_SIZE);
            gridY = Math.floor(mapYTmp / CELL_SIZE);

            backgroundCellTmp = world.getCell(gridX, gridY);

            if (backgroundCellTmp.isElevator) {
              mapX = mapXTmp;
              mapY = mapYTmp;
              backgroundCell = backgroundCellTmp;
              correctedDistance = correctedDistanceTmp;
            }
          }

          backgroundName = backgroundCell.top?.name;

          pixelX = mapX % CELL_SIZE;
          pixelY = mapY % CELL_SIZE;

          if (backgroundName) {
            sprite.changeTexture(backgroundName, pixelX, pixelY);
            sprite.tint = this.calculateTint(correctedDistance);
            updatedBackgroundSprites.push(sprite);
          }
        }
      }

      for (
        let yIndex = bottomIntersection, m = SCREEN.HEIGHT;
        yIndex < m;
        yIndex++
      ) {
        sprite = backgroundSprites[xIndex][yIndex];

        if (sprite) {
          actualDistance =
            ((player.viewHeight - floorHeight) / (yIndex - centerY + 1)) *
            CAMERA_DISTANCE;

          correctedDistance = actualDistance / Math.cos(spriteAngle);

          mapX = Math.floor(player.x + Math.cos(angle) * correctedDistance);
          mapX = mapX > maxMapX ? maxMapX : mapX;
          mapX = mapX < 0 ? 0 : mapX;

          mapY = Math.floor(player.y + Math.sin(angle) * correctedDistance);
          mapY = mapY > maxMapY ? maxMapY : mapY;
          mapY = mapY < 0 ? 0 : mapY;

          pixelX = mapX % CELL_SIZE;
          pixelY = mapY % CELL_SIZE;

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
            updatedBackgroundSprites.push(sprite);
          }
        }
      }
    }

    // Update sky sprites;
    for (let i = 0, l = outerSprites.length; i < l; i++) {
      sprite = outerSprites[i];
      spriteHeight = sprite.width * (SCREEN.HEIGHT / sprite.height);
      sprite.x = (viewAngle / DEG_360) * -spriteHeight + i * spriteHeight;
      sprite.y = centerY - CAMERA_CENTER_Y;
    }

    // Update entity sprites
    Object.values(totalEncounteredBodies).forEach(body => {
      sprite = entititySprites[body.id];

      if (sprite) {
        spriteAngle = (player.getAngleTo(body) - viewAngle + DEG_360) % DEG_360;
        actualDistance = player.getDistanceTo(body);
        correctedDistance = Math.cos(spriteAngle) * actualDistance;
        spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
        spriteHeight = CELL_SIZE * spriteScale;
        sprite.x = CAMERA_CENTER_X + Math.tan(spriteAngle) * CAMERA_DISTANCE;

        sprite.y =
          centerY -
          spriteHeight /
            (CELL_SIZE /
              (CELL_SIZE * body.anchor + body.elavation - player.viewHeight)) +
          spriteHeight;

        sprite.width = spriteHeight * body.scale;
        sprite.height = spriteHeight * body.scale;
        sprite.zOrder = actualDistance;

        sprite.tint = this.calculateTint(actualDistance);

        this.mapContainer.addChild(sprite);

        this.displayedEntities.push(sprite);

        if (sprite.mask) {
          sprite.mask.x = sprite.x;

          sprite.mask.y =
            centerY -
            spriteHeight / (CELL_SIZE / (CELL_SIZE - player.viewHeight)) +
            (spriteHeight - spriteHeight * floorOffset);

          sprite.mask.width = sprite.width;
          sprite.mask.height = sprite.height;

          sprite.mask.zOrder = actualDistance + 0.01;

          this.mapContainer.addChild(sprite.mask);
          this.displayedEntities.push(sprite.mask);
        }
      }
    });

    // Update effect sprites.
    effects.forEach(effect => {
      sprite = effectSprites[effect.sourceId];

      if (player.isFacing(effect)) {
        spriteAngle =
          (player.getAngleTo(effect) - viewAngle + DEG_360) % DEG_360;
        actualDistance = player.getDistanceTo(effect);
        correctedDistance = Math.cos(spriteAngle) * actualDistance;
        spriteScale = Math.abs(CAMERA_DISTANCE / correctedDistance);
        spriteHeight = CELL_SIZE * spriteScale;
        sprite.x = CAMERA_CENTER_X + Math.tan(spriteAngle) * CAMERA_DISTANCE;
        sprite.y =
          centerY -
          spriteHeight /
            (CELL_SIZE / (CELL_SIZE + effect.z - player.viewHeight)) +
          spriteHeight / 2;

        sprite.width = spriteHeight * effect.scale;
        sprite.height = spriteHeight * effect.scale;
        sprite.zOrder = actualDistance;
        sprite.tint = this.calculateTint(actualDistance);
        sprite.visible = true;
      } else {
        sprite.visible = false;
      }
    });

    this.backgroundContainer.update(updatedBackgroundSprites);

    super.update(ticker);
  }

  removeHud() {
    this.playerContainer.removeHud();
  }

  calculateTint(distance, darken) {
    const { light, brightness, visibility } = this.world;

    let intensity = brightness - distance / visibility;

    if (intensity < 0) {
      intensity = 0;
    }

    intensity += light;

    if (darken) {
      intensity -= 0.1;
    }

    if (intensity > 1) {
      return WHITE;
    }

    if (intensity < 0) {
      return BLACK;
    }

    return Math.round(intensity * 255) * LIGHT_GREY;
  }

  destroy(options) {
    this.removeChild(this.backgroundContainer);
    this.removeChild(this.mapContainer);
    this.removeChild(this.playerContainer);

    this.backgroundContainer.destroy(options);
    this.mapContainer.destroy(options);
    this.playerContainer.destroy(options);

    this.sprites = null;
    this.displayedEntities = [];

    super.destroy(options);
  }
}
