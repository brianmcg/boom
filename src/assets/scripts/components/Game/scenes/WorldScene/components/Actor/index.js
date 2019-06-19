import {
  DynamicBody,
  DEG,
  TAN,
  COS,
  SIN,
} from '~/core/physics';
import DoorSector from '../DoorSector';
import { TILE_SIZE } from '~/constants/config';

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
let sectorIntersection;
let sideId;
let isVerticalDoor;
let isHorizontalDoor;
let horizontalSector;
let verticalSector;

/**
 * Creates a character
 * @extends {DynamicBody}
 */
export default class Actor extends DynamicBody {
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

    if (this.constructor === Actor) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  castRay({ rayAngle }) {
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
          xGridIndex >= world.width
            || yGridIndex >= world.height
            || xGridIndex < 0
            || yGridIndex < 0
        ) {
          distToHorizontalGridBeingHit = Infinity;
          break;
        }

        horizontalSector = world.sector(xGridIndex, yGridIndex);

        if (horizontalSector.blocking) {
          isHorizontalDoor = horizontalSector instanceof DoorSector;
          if (isHorizontalDoor) {
            xOffsetDist = distToNextXIntersection / 2;
            yOffsetDist = distToNextHorizontalGrid / 2;

            if ((xIntersection + xOffsetDist) % TILE_SIZE > horizontalSector.offset) {
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
          horizontalSector.childIds.forEach(id => visibleBodyIds.push(id));
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
          xGridIndex >= world.width
            || yGridIndex >= world.height
            || xGridIndex < 0
            || yGridIndex < 0
        ) {
          distToVerticalGridBeingHit = Infinity;
          break;
        }

        verticalSector = world.sector(xGridIndex, yGridIndex);

        if (verticalSector.blocking) {
          isVerticalDoor = verticalSector instanceof DoorSector;

          if (isVerticalDoor) {
            yOffsetDist = distToNextYIntersection / 2;
            xOffsetDist = distToNextVerticalGrid / 2;

            if ((yIntersection + yOffsetDist) % TILE_SIZE > verticalSector.offset) {
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
          verticalSector.childIds.forEach(id => visibleBodyIds.push(id));
          yIntersection += distToNextYIntersection;
          verticalGrid += distToNextVerticalGrid;
        }
      }
    }

    if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
      if (isHorizontalDoor) {
        xIntersection -= horizontalSector.offset;
      }

      xIntersection = Math.floor(xIntersection);

      if (!isHorizontalDoor && rayAngle < DEG[180]) {
        sectorIntersection = TILE_SIZE - (xIntersection % TILE_SIZE) - 1;
      } else {
        sectorIntersection = xIntersection % TILE_SIZE;
      }

      if (y < horizontalSector.y) {
        sideId = horizontalSector.sideIds[1];
      } else {
        sideId = horizontalSector.sideIds[3];
      }

      return {
        distance: distToHorizontalGridBeingHit,
        isHorizontal: true,
        sideId,
        visibleBodyIds,
        sectorIntersection,
        xIntersection,
        yIntersection: horizontalGrid,
      };
    }

    if (isVerticalDoor) {
      yIntersection -= verticalSector.offset;
    }

    yIntersection = Math.floor(yIntersection);

    if (!isVerticalDoor && rayAngle > DEG[90] && rayAngle < DEG[270]) {
      sectorIntersection = TILE_SIZE - (yIntersection % TILE_SIZE) - 1;
    } else {
      sectorIntersection = yIntersection % TILE_SIZE;
    }

    if (x < verticalSector.x) {
      sideId = verticalSector.sideIds[0];
    } else {
      sideId = verticalSector.sideIds[2];
    }

    return {
      distance: distToVerticalGridBeingHit,
      sideId: verticalSector.sideIds[0],
      visibleBodyIds,
      sectorIntersection,
      xIntersection: verticalGrid,
      yIntersection,
    };
  }
}
