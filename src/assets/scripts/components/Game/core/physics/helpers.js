import {
  DEG,
  TAN,
  COS,
  SIN,
} from './constants';
import DynamicFlatSector from './components/DynamicFlatSector';
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
let side;
let isVerticalDoor;
let isHorizontalDoor;
let horizontalSector;
let verticalSector;

export const atan2 = (dyA = 0, dxA = 0) => {
  const radians = Math.atan2(dyA, dxA);
  const angle = Math.round(radians * DEG[180] / Math.PI) % DEG[360];

  return (angle < 0) ? angle + DEG[360] : angle;
};

export const distanceBetween = (bodyA, bodyB) => {
  const dx = bodyA.x - bodyB.x;
  const dy = bodyA.y - bodyB.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const castRay = ({ rayAngle, caster }) => {
  const {
    x,
    y,
    gridX,
    gridY,
    angle,
    world,
  } = caster;

  const { bodies } = world;

  let visibleBodyIds = world.getSector(gridX, gridY).bodies.map(body => body.id)
    .filter(id => caster.id !== id);

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
    distToHorizontalGridBeingHit = Number.MAX_VALUE;
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
        distToHorizontalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      horizontalSector = world.getSector(xGridIndex, yGridIndex);

      if (horizontalSector.blocking) {
        isHorizontalDoor = horizontalSector instanceof DynamicFlatSector;
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
        visibleBodyIds = visibleBodyIds.concat(horizontalSector.bodies.map(body => body.id));
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
    distToVerticalGridBeingHit = Number.MAX_VALUE;
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
        distToVerticalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      verticalSector = world.getSector(xGridIndex, yGridIndex);

      if (verticalSector.blocking) {
        isVerticalDoor = verticalSector instanceof DynamicFlatSector;

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
        visibleBodyIds = visibleBodyIds.concat(verticalSector.bodies.map(body => body.id));
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
      side = horizontalSector.left;
    } else {
      side = horizontalSector.right;
    }

    visibleBodyIds = visibleBodyIds.reduce((result, id) => {
      if (
        distanceBetween(caster, bodies[id]) <= distToHorizontalGridBeingHit && !result.includes(id)
      ) {
        result.push(id);
      }
      return result;
    }, []);

    return {
      distance: distToHorizontalGridBeingHit,
      isHorizontal: true,
      side,
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
    side = verticalSector.front;
  } else {
    side = verticalSector.back;
  }

  visibleBodyIds = visibleBodyIds.reduce((result, id) => {
    if (distanceBetween(caster, bodies[id]) <= distToVerticalGridBeingHit && !result.includes(id)) {
      result.push(id);
    }
    return result;
  }, []);

  return {
    distance: distToVerticalGridBeingHit,
    side,
    visibleBodyIds,
    sectorIntersection,
    xIntersection: verticalGrid,
    yIntersection,
  };
};
