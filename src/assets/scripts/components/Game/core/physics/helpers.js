import { CELL_SIZE } from 'game/constants/config';
import {
  DEG,
  TAN,
  COS,
  SIN,
} from './constants';

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
let horizontalCell;
let verticalCell;
let offsetRatio;

/**
 * Get the distance between two bodies.
 * @param  {Body}   bodyA The first body.
 * @param  {Body}   bodyB The second body
 * @return {Number}       The distance result.
 */
export const getDistanceBetween = (bodyA, bodyB) => {
  const dx = bodyA.x - bodyB.x;
  const dy = bodyA.y - bodyB.y;

  return Math.sqrt(dx * dx + dy * dy);
};

const getLineLineIntersection = (l1p1, l1p2, l2p1, l2p2) => {
  const a1 = l1p2.y - l1p1.y;
  const b1 = l1p1.x - l1p2.x;
  const c1 = (a1 * l1p1.x) + (b1 * l1p1.y);
  const a2 = l2p2.y - l2p1.y;
  const b2 = l2p1.x - l2p2.x;
  const c2 = (a2 * l2p1.x) + (b2 * l2p1.y);
  const determinant = (a1 * b2) - (a2 * b1);

  if (determinant === 0) {
    return null;
  }

  const x = ((b2 * c1) - (b1 * c2)) / determinant;
  const y = ((a1 * c2) - (a2 * c1)) / determinant;

  if (l2p1.x === l2p2.x) {
    if (l2p1.y < l2p2.y) {
      if (y >= l2p1.y && y <= l2p2.y) {
        return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
      }
      return null;
    }

    if (y >= l2p2.y && y <= l2p1.y) {
      return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
    }

    return null;
  }

  if (l2p1.y === l2p2.y) {
    if (l2p1.x < l2p2.x) {
      if (x >= l2p1.x && x <= l2p2.x) {
        return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
      }
      return null;
    }

    if (x >= l2p2.x && x <= (l2p1.x)) {
      return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
    }

    return null;
  }

  return null;
};

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
    && shapeA.y < shapeB.y + shapeB.width
    && shapeA.width + shapeA.y > shapeB.y;
};

/**
 * A collision between a ray and a body has occured.
 * @param  {Object}  startPoint The first point of the ray.
 * @param  {Object}  endPoint   The second point of the ray.
 * @param  {Object}  body       The body.
 * @return {Boolean}            Represents whether a collision has occured.
 */
export const isRayCollision = (body, { startPoint, endPoint }) => {
  const { x, y, width } = body.shape;

  return lineIntersectsLine(
    startPoint,
    endPoint,
    { x, y },
    { x: x + width, y },
  ) || lineIntersectsLine(
    startPoint,
    endPoint,
    { x: x + width, y },
    { x: x + width, y: y + width },
  ) || lineIntersectsLine(
    startPoint,
    endPoint,
    { x: x + width, y: y + width },
    { x, y: y + width },
  ) || lineIntersectsLine(
    startPoint,
    endPoint,
    { x, y: y + width },
    { x, y },
  );
};

/**
 * A collision between a ray and a body has occured.
 * @param  {Object}  startPoint The first point of the ray.
 * @param  {Object}  endPoint   The second point of the ray.
 * @param  {Object}  body       The body.
 * @return {Boolean}            Represents whether a collision has occured.
 */
export const getRayCollision = (body, { startPoint, endPoint }) => {
  const { x, y, width } = body.shape;

  return [
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x, y },
      { x: x + width, y },
    ),
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x: x + width, y },
      { x: x + width, y: y + width },
    ),
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x: x + width, y: y + width },
      { x, y: y + width },
    ),
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x, y: y + width },
      { x, y },
    ),
  ].reduce((memo, intersection) => {
    if (!intersection) {
      return memo;
    }

    if (!memo) {
      return intersection;
    }

    if (intersection.distance < memo.distance) {
      return intersection;
    }

    return memo;
  }, null);
};

/**
 * Get angle between two bodies.
 * @param  {Body} bodyA The first body.
 * @param  {Body} bodyB The second body.
 * @return {Number}     The angle between two bodies.
 */
export const getAngleBetween = (bodyA, bodyB) => {
  const dx = bodyB.x - bodyA.x;
  const dy = bodyB.y - bodyA.y;

  const angle = Math.atan2(dy, dx) % DEG_360;

  return angle < 0 ? angle + DEG_360 : angle;
};

/**
 * Check if a dynamic body is facing a body.
 * @param  {Body} dynamicBody The dynamic body.
 * @param  {Body} body        The body.
 * @return {Boolean}          The result of the check.
 */
export const isFacing = (dynamicBody, body) => {
  const angle = (getAngleBetween(dynamicBody, body) - dynamicBody.angle + DEG_360) % DEG_360;

  return angle > DEG_270 || angle < DEG_90;
};

/**
 * Cast a ray from a caster.
 * @param  {Number}         options.rayAngle  The optional ray angle.
 * @param  {DynamicEntity}  options.caster    The caster entity.
 * @return {Object}                           The cast result.
 */
export const castRay = (caster, rayAngle) => {
  const {
    id,
    x,
    y,
    gridX,
    gridY,
    angle,
    parent,
  } = caster;

  const encounteredBodies = {};

  parent.getCell(gridX, gridY).bodies.forEach((body) => {
    if (body.id !== id && isFacing(caster, body)) {
      encounteredBodies[body.id] = body;
    }
  });

  if (rayAngle === undefined) {
    rayAngle = angle;
  }

  if (rayAngle > 0 && rayAngle < DEG_180) {
    horizontalGrid = CELL_SIZE + gridY * CELL_SIZE;
    distToNextHorizontalGrid = CELL_SIZE;
    xIntersection = (horizontalGrid - y) / Math.tan(rayAngle) + x;
  } else {
    horizontalGrid = gridY * CELL_SIZE;
    distToNextHorizontalGrid = -CELL_SIZE;
    xIntersection = (horizontalGrid - y) / Math.tan(rayAngle) + x;
    horizontalGrid -= 1;
  }

  if (rayAngle === 0 || rayAngle === DEG_180) {
    distToHorizontalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (rayAngle >= DEG_90 && rayAngle < DEG_270) {
      distToNextXIntersection = CELL_SIZE / Math.tan(rayAngle);
      if (distToNextXIntersection > 0) {
        distToNextXIntersection = -distToNextXIntersection;
      }
    } else {
      distToNextXIntersection = CELL_SIZE / Math.tan(rayAngle);
      if (distToNextXIntersection < 0) {
        distToNextXIntersection = -distToNextXIntersection;
      }
    }

    while (true) {
      xGridIndex = Math.floor(xIntersection / CELL_SIZE);
      yGridIndex = Math.floor(horizontalGrid / CELL_SIZE);

      if (
        xGridIndex >= parent.width
          || yGridIndex >= parent.height
          || xGridIndex < 0
          || yGridIndex < 0
      ) {
        distToHorizontalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      horizontalCell = parent.getCell(xGridIndex, yGridIndex);

      if (horizontalCell.blocking) {
        if (horizontalCell.axis) {
          offsetRatio = CELL_SIZE / horizontalCell.offset.y;
          xOffsetDist = distToNextXIntersection / offsetRatio;
          yOffsetDist = distToNextHorizontalGrid / offsetRatio;

          if ((xIntersection + xOffsetDist) % CELL_SIZE > horizontalCell.offset.x) {
            xIntersection += xOffsetDist;
            horizontalGrid += yOffsetDist;
            distToHorizontalGridBeingHit = (xIntersection - x) / Math.cos(rayAngle);
            break;
          } else {
            xIntersection += distToNextXIntersection;
            horizontalGrid += distToNextHorizontalGrid;
          }
        } else {
          distToHorizontalGridBeingHit = (xIntersection - x) / Math.cos(rayAngle);
          break;
        }
      } else {
        horizontalCell.bodies.forEach((body) => {
          encounteredBodies[body.id] = body;
        });
        xIntersection += distToNextXIntersection;
        horizontalGrid += distToNextHorizontalGrid;
      }
    }
  }

  if (rayAngle < DEG_90 || rayAngle > DEG_270) {
    verticalGrid = CELL_SIZE + gridX * CELL_SIZE;
    distToNextVerticalGrid = CELL_SIZE;
    yIntersection = Math.tan(rayAngle) * (verticalGrid - x) + y;
  } else {
    verticalGrid = gridX * CELL_SIZE;
    distToNextVerticalGrid = -CELL_SIZE;
    yIntersection = Math.tan(rayAngle) * (verticalGrid - x) + y;
    verticalGrid -= 1;
  }

  if (rayAngle === DEG_90 || rayAngle === DEG_270) {
    distToVerticalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (rayAngle >= 0 && rayAngle < DEG_180) {
      distToNextYIntersection = CELL_SIZE * Math.tan(rayAngle);
      if (distToNextYIntersection < 0) {
        distToNextYIntersection = -distToNextYIntersection;
      }
    } else {
      distToNextYIntersection = CELL_SIZE * Math.tan(rayAngle);
      if (distToNextYIntersection > 0) {
        distToNextYIntersection = -distToNextYIntersection;
      }
    }

    while (true) {
      xGridIndex = Math.floor(verticalGrid / CELL_SIZE);
      yGridIndex = Math.floor(yIntersection / CELL_SIZE);

      if (
        xGridIndex >= parent.width
          || yGridIndex >= parent.height
          || xGridIndex < 0
          || yGridIndex < 0
      ) {
        distToVerticalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      verticalCell = parent.getCell(xGridIndex, yGridIndex);

      if (verticalCell.blocking) {
        if (verticalCell.axis) {
          offsetRatio = CELL_SIZE / verticalCell.offset.x;
          yOffsetDist = distToNextYIntersection / offsetRatio;
          xOffsetDist = distToNextVerticalGrid / offsetRatio;

          if ((yIntersection + yOffsetDist) % CELL_SIZE > verticalCell.offset.y) {
            yIntersection += yOffsetDist;
            verticalGrid += xOffsetDist;
            distToVerticalGridBeingHit = (yIntersection - y) / Math.sin(rayAngle);
            break;
          } else {
            yIntersection += distToNextYIntersection;
            verticalGrid += distToNextVerticalGrid;
          }
        } else {
          distToVerticalGridBeingHit = (yIntersection - y) / Math.sin(rayAngle);
          break;
        }
      } else {
        verticalCell.bodies.forEach((body) => {
          encounteredBodies[body.id] = body;
        });
        yIntersection += distToNextYIntersection;
        verticalGrid += distToNextVerticalGrid;
      }
    }
  }

  if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
    Object.values(encounteredBodies).forEach((body) => {
      if (getDistanceBetween(caster, body) > distToHorizontalGridBeingHit) {
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
      isHorizontal: true,
      side: caster.y < horizontalCell.y
        ? horizontalCell.left
        : horizontalCell.right,
      cell: horizontalCell,
    };
  }

  Object.values(encounteredBodies).forEach((body) => {
    if (getDistanceBetween(caster, body) > distToVerticalGridBeingHit) {
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
    side: caster.x < verticalCell.x
      ? verticalCell.front
      : verticalCell.back,
    cell: verticalCell,
  };
};
