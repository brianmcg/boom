import {
  DynamicBody,
  DEG,
  TAN,
  COS,
  SIN,
} from '~/core/physics';
import DoorSector from '../DoorSector';
import { TILE_SIZE } from '~/constants/config';

/**
 * Creates a character
 * @extends {DynamicBody}
 */
export default class Character extends DynamicBody {
  /* Creates a character.
   * @param  {Number} options.x         The x coordinate of the character.
   * @param  {Number} options.y         The y coordinate of the character
   * @param  {Number} options.width     The width of the character.
   * @param  {Number} options.length    The length of the character.
   * @param  {Number} options.height    The height of the character.
   * @param  {Number} options.angle     The angle of the character.
   * @param  {Number} options.maxHealth The maximum health of the character.
   */
  constructor(options = {}) {
    const { maxHealth = 100, ...other } = options;
    super(other);
    this.health = maxHealth;
    this.maxHealth = maxHealth;
  }

  castRay({ rayAngle }) {
    let horizontalGrid;
    let verticalGrid;
    let distToNextHorizontalGrid;
    let distToNextVerticalGrid;
    let distToHorizontalGridBeingHit;
    let distToVerticalGridBeingHit;
    let distToNextXIntersection;
    let distToNextYIntersection;
    let xIntersection;
    let yIntersection;
    let xGridIndex;
    let yGridIndex;
    let xOffsetDist;
    let yOffsetDist;
    let sector;
    let intersection;
    let isDoor;
    let sideId;

    const {
      x,
      y,
      gridX,
      gridY,
      angle,
      world,
    } = this;

    const visibleBodyIds = [...world.sector(gridX, gridY).childIds]
      .filter(id => this.id !== id);

    if (!rayAngle && rayAngle !== 0) {
      rayAngle = angle;
    }

    if (rayAngle > 0 && rayAngle < DEG[180]) {
      horizontalGrid = TILE_SIZE + gridY * TILE_SIZE;
      distToNextHorizontalGrid = TILE_SIZE;
      xIntersection = (horizontalGrid - y) / TAN[rayAngle] + x;
    } else {
      horizontalGrid = gridY * TILE_SIZE;
      distToNextHorizontalGrid = -TILE_SIZE;
      xIntersection = (horizontalGrid - y) / TAN[rayAngle] + x;
      horizontalGrid -= 1;
    }

    if (rayAngle === 0 || rayAngle === DEG[180]) {
      distToHorizontalGridBeingHit = Infinity;
    } else {
      if (rayAngle >= DEG[90] && rayAngle < DEG[270]) {
        distToNextXIntersection = TILE_SIZE / TAN[rayAngle];
        if (distToNextXIntersection > 0) {
          distToNextXIntersection = -distToNextXIntersection;
        }
      } else {
        distToNextXIntersection = TILE_SIZE / TAN[rayAngle];
        if (distToNextXIntersection < 0) {
          distToNextXIntersection = -distToNextXIntersection;
        }
      }

      while (true) {
        xGridIndex = Math.floor(xIntersection / TILE_SIZE);
        yGridIndex = Math.floor(horizontalGrid / TILE_SIZE);

        if (
          (xGridIndex >= world.width)
            || (yGridIndex >= world.height)
            || xGridIndex < 0 || yGridIndex < 0
        ) {
          distToHorizontalGridBeingHit = Infinity;
          break;
        }

        sector = world.sector(xGridIndex, yGridIndex);

        if (sector.blocking) {
          if (sector instanceof DoorSector) {
            xOffsetDist = distToNextXIntersection / 2;
            yOffsetDist = distToNextHorizontalGrid / 2;

            if ((xIntersection + xOffsetDist) % TILE_SIZE > sector.offset) {
              xIntersection += xOffsetDist;
              horizontalGrid += yOffsetDist;
              distToHorizontalGridBeingHit = (xIntersection - x) / COS[rayAngle];
              break;
            } else {
              xIntersection += distToNextXIntersection;
              horizontalGrid += distToNextHorizontalGrid;
            }
          } else {
            distToHorizontalGridBeingHit = (xIntersection - x) / COS[rayAngle];
            break;
          }
        } else {
          sector.childIds.forEach(id => visibleBodyIds.push(id));
          xIntersection += distToNextXIntersection;
          horizontalGrid += distToNextHorizontalGrid;
        }
      }
    }

    if (rayAngle < DEG[90] || rayAngle > DEG[270]) {
      verticalGrid = TILE_SIZE + gridX * TILE_SIZE;
      distToNextVerticalGrid = TILE_SIZE;
      yIntersection = TAN[rayAngle] * (verticalGrid - x) + y;
    } else {
      verticalGrid = gridX * TILE_SIZE;
      distToNextVerticalGrid = -TILE_SIZE;
      yIntersection = TAN[rayAngle] * (verticalGrid - x) + y;
      verticalGrid -= 1;
    }

    if (rayAngle === DEG[90] || rayAngle === DEG[270]) {
      distToVerticalGridBeingHit = Infinity;
    } else {
      if (rayAngle >= 0 && rayAngle < DEG[180]) {
        distToNextYIntersection = TILE_SIZE * TAN[rayAngle];
        if (distToNextYIntersection < 0) {
          distToNextYIntersection = -distToNextYIntersection;
        }
      } else {
        distToNextYIntersection = TILE_SIZE * TAN[rayAngle];
        if (distToNextYIntersection > 0) {
          distToNextYIntersection = -distToNextYIntersection;
        }
      }

      while (true) {
        xGridIndex = Math.floor(verticalGrid / TILE_SIZE);
        yGridIndex = Math.floor(yIntersection / TILE_SIZE);

        if (
          (xGridIndex >= world.width)
            || (yGridIndex >= world.height)
            || xGridIndex < 0 || yGridIndex < 0
        ) {
          distToVerticalGridBeingHit = Infinity;
          break;
        }

        sector = world.sector(xGridIndex, yGridIndex);

        if (sector.blocking) {
          if (sector instanceof DoorSector) {
            yOffsetDist = distToNextYIntersection / 2;
            xOffsetDist = distToNextVerticalGrid / 2;

            if ((yIntersection + yOffsetDist) % TILE_SIZE > sector.offset) {
              yIntersection += yOffsetDist;
              verticalGrid += xOffsetDist;
              distToVerticalGridBeingHit = (yIntersection - y) / SIN[rayAngle];
              break;
            } else {
              yIntersection += distToNextYIntersection;
              verticalGrid += distToNextVerticalGrid;
            }
          } else {
            distToVerticalGridBeingHit = (yIntersection - y) / SIN[rayAngle];
            break;
          }
        } else {
          sector.childIds.forEach(id => visibleBodyIds.push(id));
          yIntersection += distToNextYIntersection;
          verticalGrid += distToNextVerticalGrid;
        }
      }
    }

    if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
      xGridIndex = Math.floor(xIntersection / TILE_SIZE);
      yGridIndex = Math.floor(horizontalGrid / TILE_SIZE);
      sector = world.sector(xGridIndex, yGridIndex);
      isDoor = sector instanceof DoorSector;

      if (isDoor) {
        xIntersection -= sector.offset;
      }

      xIntersection = Math.floor(xIntersection);

      if (!isDoor && rayAngle < DEG[180]) {
        intersection = TILE_SIZE - (xIntersection % TILE_SIZE) - 1;
      } else {
        intersection = xIntersection % TILE_SIZE;
      }

      if (y < sector.y) {
        sideId = sector.sideIds[1];
      } else {
        sideId = sector.sideIds[3];
      }

      return {
        distance: distToHorizontalGridBeingHit,
        side: 1,
        sideId,
        visibleBodyIds,
        intersection,
        xIntersection: Math.floor(xIntersection),
        yIntersection: horizontalGrid,
      };
    }

    xGridIndex = Math.floor(verticalGrid / TILE_SIZE);
    yGridIndex = Math.floor(yIntersection / TILE_SIZE);
    sector = world.sector(xGridIndex, yGridIndex);
    isDoor = sector instanceof DoorSector;

    if (isDoor) {
      yIntersection -= sector.offset;
    }

    yIntersection = Math.floor(yIntersection);

    if (!isDoor && rayAngle > DEG[90] && rayAngle < DEG[270]) {
      intersection = TILE_SIZE - (yIntersection % TILE_SIZE) - 1;
    } else {
      intersection = yIntersection % TILE_SIZE;
    }

    if (x < sector.x) {
      sideId = sector.sideIds[0];
    } else {
      sideId = sector.sideIds[2];
    }

    return {
      distance: distToVerticalGridBeingHit,
      side: 0,
      sideId: sector.sideIds[0],
      visibleBodyIds,
      intersection,
      xIntersection: verticalGrid,
      yIntersection: Math.floor(yIntersection),
    };
  }
}
