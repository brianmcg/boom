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

  castRay(options = {}) {
    let horizontalGrid;
    let distToNextHorizontalGrid;
    let xIntersection;
    let yIntersection;
    let distToHorizontalGridBeingHit;
    let verticalGrid;
    let distToNextXIntersection;
    let xGridIndex;
    let yGridIndex;
    let sector;
    let distToNextVerticalGrid;
    let distToVerticalGridBeingHit;
    let distToNextYIntersection;

    const casterX = this.x;
    const casterY = this.y;
    const { gridX, gridY } = this;

    const rayAngle = options.angle || this.angle;
    // let visibleItemIds = this.world.sector(gridX, gridY).itemIds;
    // let visibleEnemyIds = this.world.sector(gridX, gridY).enemyIds;

    if (rayAngle > 0 && rayAngle < DEG[180]) {
      horizontalGrid = TILE_SIZE + gridY * TILE_SIZE;
      distToNextHorizontalGrid = TILE_SIZE;
      xIntersection = (horizontalGrid - casterY) / TAN[rayAngle] + casterX;
    } else {
      horizontalGrid = gridY * TILE_SIZE;
      distToNextHorizontalGrid = -TILE_SIZE;
      xIntersection = (horizontalGrid - casterY) / TAN[rayAngle] + casterX;
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
          (xGridIndex >= this.world.width)
            || (yGridIndex >= this.world.height)
            || xGridIndex < 0 || yGridIndex < 0
        ) {
          distToHorizontalGridBeingHit = Infinity;
          break;
        }

        sector = this.world.sector(xGridIndex, yGridIndex);

        if (sector.blocking) {
          // if (sector instanceof DoorSector) {
          //   offsetRatio = TILE_SIZE / sector.offset.y;
          //   xOffsetDist = distToNextXIntersection / offsetRatio;
          //   yOffsetDist = distToNextHorizontalGrid / offsetRatio;

          //   if ((xIntersection + xOffsetDist) % TILE_SIZE > sector.offset.x) {
          //     xIntersection += xOffsetDist;
          //     horizontalGrid += yOffsetDist;
          //     distToHorizontalGridBeingHit = (xIntersection - casterX) / cos(rayAngle);
          //     break;
          //   } else {
          //     xIntersection += distToNextXIntersection;
          //     horizontalGrid += distToNextHorizontalGrid;
          //   }
          // } else {
          distToHorizontalGridBeingHit = (xIntersection - casterX) / COS[rayAngle];
          break;
          // }
        } else {
          // if (sector && sector.itemIds.length) {
          //   visibleItemIds = _.union(visibleItemIds, sector.itemIds);
          // }
          // if (sector && sector.enemyIds.length) {
          //   visibleEnemyIds = _.union(visibleEnemyIds, sector.enemyIds);
          // }
          xIntersection += distToNextXIntersection;
          horizontalGrid += distToNextHorizontalGrid;
        }
      }
    }

    if (rayAngle < DEG[90] || rayAngle > DEG[270]) {
      verticalGrid = TILE_SIZE + gridX * TILE_SIZE;
      distToNextVerticalGrid = TILE_SIZE;
      yIntersection = TAN[rayAngle] * (verticalGrid - casterX) + casterY;
    } else {
      verticalGrid = gridX * TILE_SIZE;
      distToNextVerticalGrid = -TILE_SIZE;
      yIntersection = TAN[rayAngle] * (verticalGrid - casterX) + casterY;
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
          (xGridIndex >= this.world.width)
            || (yGridIndex >= this.world.height)
            || xGridIndex < 0 || yGridIndex < 0
        ) {
          distToVerticalGridBeingHit = Infinity;
          break;
        }

        sector = this.world.sector(xGridIndex, yGridIndex);

        if (sector.blocking) {
          // if (sector instanceof Door) {
          //   offsetRatio = TILE_SIZE / sector.offset.x;
          //   yOffsetDist = distToNextYIntersection / offsetRatio;
          //   xOffsetDist = distToNextVerticalGrid / offsetRatio;

          //   if ((yIntersection + yOffsetDist) % TILE_SIZE > sector.offset.y) {
          //     yIntersection += yOffsetDist;
          //     verticalGrid += xOffsetDist;
          //     distToVerticalGridBeingHit = (yIntersection - casterY) / sin(rayAngle);
          //     break;
          //   } else {
          //     yIntersection += distToNextYIntersection;
          //     verticalGrid += distToNextVerticalGrid;
          //   }
          // } else {
          distToVerticalGridBeingHit = (yIntersection - casterY) / SIN[rayAngle];
          break;
          // }
        } else {
          // if (sector && sector.itemIds.length) {
          //   visibleItemIds = _.union(visibleItemIds, sector.itemIds);
          // }
          // if (sector && sector.enemyIds.length) {
          //   visibleEnemyIds = _.union(visibleEnemyIds, sector.enemyIds);
          // }
          yIntersection += distToNextYIntersection;
          verticalGrid += distToNextVerticalGrid;
        }
      }
    }

    if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
      xGridIndex = Math.floor(xIntersection / TILE_SIZE);
      yGridIndex = Math.floor(horizontalGrid / TILE_SIZE);
      sector = this.world.sector(xGridIndex, yGridIndex);

      // if (sector instanceof DoorSector) {
      //   xIntersection -= TILE_SIZE / 2;
      // }

      // if (sector.side.image && sector.side.value) {
      //   image = sector.side.image;
      // } else {
      //   image = sector.image;
      // }

      return {
        xIntersection: Math.floor(xIntersection),
        yIntersection: horizontalGrid,
        distance: distToHorizontalGridBeingHit,
        // door: sector instanceof Door,
        // side: 1,
        // image: image,
        // visibleItemIds: visibleItemIds,
        // visibleEnemyIds: visibleEnemyIds,
        // blood: sector.blood
      };
    }

    xGridIndex = Math.floor(verticalGrid / TILE_SIZE);
    yGridIndex = Math.floor(yIntersection / TILE_SIZE);
    sector = this.world.sector(xGridIndex, yGridIndex);

    // if (sector instanceof DoorSector) {
    //   yIntersection -= TILE_SIZE / 2;
    // }

    // if (sector.side.image && !sector.side.value) {
    //   image = sector.side.image;
    // } else {
    //   image = sector.image;
    // }

    return {
      xIntersection: verticalGrid,
      yIntersection: Math.floor(yIntersection),
      distance: distToVerticalGridBeingHit,
      // door: sector instanceof Door,
      // image: image,
      // side: 0,
      // visibleItemIds: visibleItemIds,
      // visibleEnemyIds: visibleEnemyIds
    };
  }
}
