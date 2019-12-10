import { TILE_SIZE } from 'game/constants/config';
import {
  DEG,
  TAN,
  COS,
  SIN,
} from './constants';
import DynamicFlatSector from './components/DynamicFlatSector';

const DEG_90 = DEG[90];
const DEG_180 = DEG[180];
const DEG_270 = DEG[270];
const DEG_360 = DEG[360];

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
let isVerticalDoor;
let isHorizontalDoor;
let horizontalSector;
let verticalSector;

const lineIntersectsLine = (l1p1, l1p2, l2p1, l2p2) => {
  let q = (l1p1.y - l2p1.y) * (l2p2.x - l2p1.x) - (l1p1.x - l2p1.x) * (l2p2.y - l2p1.y);

  const d = (l1p2.x - l1p1.x) * (l2p2.y - l2p1.y) - (l1p2.y - l1p1.y) * (l2p2.x - l2p1.x);

  if (d === 0) {
    return false;
  }

  const r = q / d;

  q = (l1p1.y - l2p1.y) * (l1p2.x - l1p1.x) - (l1p1.x - l2p1.x) * (l1p2.y - l1p1.y);

  const s = q / d;

  if (r < 0 || r > 1 || s < 0 || s > 1) {
    return false;
  }

  return true;
};

/**
 * Calculate the atan2
 * @param  {Number} dyA The first number.
 * @param  {Number} dxA The second number.
 * @return {Number}     The atan2 result.
 */
export const atan2 = (dyA = 0, dxA = 0) => {
  const radians = Math.atan2(dyA, dxA);
  const angle = Math.round(radians * DEG_180 / Math.PI) % DEG_360;

  return (angle < 0) ? angle + DEG_360 : angle;
};

/**
 * Get the distance between two bodies.
 * @param  {Body}   bodyA The first body.
 * @param  {Body}   bodyB The second body
 * @return {Number}       The distance result.
 */
export const distanceBetween = (bodyA, bodyB) => {
  const dx = bodyA.x - bodyB.x;
  const dy = bodyA.y - bodyB.y;

  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if two bodies are colliding.
 * @param  {Body} bodyA The first body.
 * @param  {Body} bodyB The second body.
 * @return {Boolean}    Are the bodies colliding.
 */
export const isBodyCollision = (bodyA, bodyB) => {
  const shapeA = bodyA.shape;
  const shapeB = bodyB.shape;

  return shapeA.x < shapeB.x + shapeB.width
    && shapeA.x + shapeA.width > shapeB.x
    && shapeA.y < shapeB.y + shapeB.length
    && shapeA.length + shapeA.y > shapeB.y;
};

/**
 * A collision between a ray and a body has occured.
 * @param  {Object}  startPoint The first point of the ray.
 * @param  {Object}  endPoint   The second point of the ray.
 * @param  {Object}  body       The body.
 * @return {Boolean}            Represents whether a collision has occured.
 */
export const isRayCollision = (startPoint, endPoint, body) => {
  const {
    x,
    y,
    width,
    length,
  } = body.shape;

  return lineIntersectsLine(
    startPoint,
    endPoint,
    { x, y },
    { x: x + width, y },
  ) || lineIntersectsLine(
    startPoint,
    endPoint,
    { x: x + width, y },
    { x: x + width, y: y + length },
  ) || lineIntersectsLine(
    startPoint,
    endPoint,
    { x: x + width, y: y + length },
    { x, y: y + length },
  ) || lineIntersectsLine(
    startPoint,
    endPoint,
    { x, y: y + length },
    { x, y },
  );
};

/**
 * Cast a ray from a caster.
 * @param  {Number}         options.rayAngle  The optional ray angle.
 * @param  {DynamicEntity}  options.caster    The caster entity.
 * @return {Object}                           The cast result.
 */
export const castRay = ({ rayAngle, caster }) => {
  const {
    id,
    x,
    y,
    gridX,
    gridY,
    angle,
    world,
  } = caster;

  const encounteredBodies = {};

  world.getSector(gridX, gridY).bodies.forEach((body) => {
    if (body.id !== id) {
      encounteredBodies[body.id] = body;
    }
  });

  if (rayAngle === undefined) {
    rayAngle = angle;
  }

  if (rayAngle > 0 && rayAngle < DEG_180) {
    horizontalGrid = TILE_SIZE + gridY * TILE_SIZE;
    distToNextHorizontalGrid = TILE_SIZE;
    xIntersection = (horizontalGrid - y) / TAN[rayAngle] + x;
  } else {
    horizontalGrid = gridY * TILE_SIZE;
    distToNextHorizontalGrid = -TILE_SIZE;
    xIntersection = (horizontalGrid - y) / TAN[rayAngle] + x;
    horizontalGrid -= 1;
  }

  if (rayAngle === 0 || rayAngle === DEG_180) {
    distToHorizontalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (rayAngle >= DEG_90 && rayAngle < DEG_270) {
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
        horizontalSector.bodies.forEach((body) => {
          encounteredBodies[body.id] = body;
        });
        xIntersection += distToNextXIntersection;
        horizontalGrid += distToNextHorizontalGrid;
      }
    }
  }

  if (rayAngle < DEG_90 || rayAngle > DEG_270) {
    verticalGrid = TILE_SIZE + gridX * TILE_SIZE;
    distToNextVerticalGrid = TILE_SIZE;
    yIntersection = TAN[rayAngle] * (verticalGrid - x) + y;
  } else {
    verticalGrid = gridX * TILE_SIZE;
    distToNextVerticalGrid = -TILE_SIZE;
    yIntersection = TAN[rayAngle] * (verticalGrid - x) + y;
    verticalGrid -= 1;
  }

  if (rayAngle === DEG_90 || rayAngle === DEG_270) {
    distToVerticalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (rayAngle >= 0 && rayAngle < DEG_180) {
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
        verticalSector.bodies.forEach((body) => {
          encounteredBodies[body.id] = body;
        });
        yIntersection += distToNextYIntersection;
        verticalGrid += distToNextVerticalGrid;
      }
    }
  }

  if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
    Object.values(encounteredBodies).forEach((body) => {
      if (distanceBetween(caster, body) > distToHorizontalGridBeingHit) {
        delete encounteredBodies[body.id];
      }
    });

    return {
      startPoint: {
        x,
        y,
      },
      endPoint: {
        x: xIntersection,
        y: horizontalGrid,
      },
      distance: distToHorizontalGridBeingHit,
      encounteredBodies,
      isDoor: isHorizontalDoor,
      isHorizontal: true,
      sector: horizontalSector,
    };
  }

  Object.values(encounteredBodies).forEach((body) => {
    if (distanceBetween(caster, body) > distToVerticalGridBeingHit) {
      delete encounteredBodies[body.id];
    }
  });

  return {
    startPoint: {
      x,
      y,
    },
    endPoint: {
      x: verticalGrid,
      y: yIntersection,
    },
    distance: distToVerticalGridBeingHit,
    encounteredBodies,
    isDoor: isVerticalDoor,
    sector: verticalSector,
  };
};
