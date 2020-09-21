import { CELL_SIZE } from 'game/constants/config';

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

const DEGREES = [...Array(361).keys()].map(degrees => degrees * Math.PI / 180);

export const degrees = value => DEGREES[value];

const DEG_90 = degrees(90);
const DEG_180 = degrees(180);
const DEG_270 = degrees(270);
const DEG_360 = degrees(360);

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
 * Cast a ray from a caster.
 * @param  {Number}         options.startAngle  The optional ray angle.
 * @param  {DynamicEntity}  options.caster    The caster entity.
 * @return {Object}                           The cast result.
 */
export const castRay = (caster, startAngle, startX, startY) => {
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
    if (caster.isFacing(body)) {
      encounteredBodies[body.id] = body;
    }
  });

  if (startAngle === undefined) {
    startAngle = angle;
  }

  if (startX === undefined) {
    startX = x;
  }

  if (startY === undefined) {
    startY = y;
  }

  if (startAngle > 0 && startAngle < DEG_180) {
    horizontalGrid = CELL_SIZE + gridY * CELL_SIZE;
    distToNextHorizontalGrid = CELL_SIZE;
    xIntersection = (horizontalGrid - startY) / Math.tan(startAngle) + startX;
  } else {
    horizontalGrid = gridY * CELL_SIZE;
    distToNextHorizontalGrid = -CELL_SIZE;
    xIntersection = (horizontalGrid - startY) / Math.tan(startAngle) + startX;
    horizontalGrid -= 1;
  }

  if (startAngle === 0 || startAngle === DEG_180) {
    distToHorizontalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (startAngle >= DEG_90 && startAngle < DEG_270) {
      distToNextXIntersection = CELL_SIZE / Math.tan(startAngle);
      if (distToNextXIntersection > 0) {
        distToNextXIntersection = -distToNextXIntersection;
      }
    } else {
      distToNextXIntersection = CELL_SIZE / Math.tan(startAngle);
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
            distToHorizontalGridBeingHit = (xIntersection - startX) / Math.cos(startAngle);
            break;
          } else {
            xIntersection += distToNextXIntersection;
            horizontalGrid += distToNextHorizontalGrid;
          }
        } else {
          distToHorizontalGridBeingHit = (xIntersection - startX) / Math.cos(startAngle);
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

  if (startAngle < DEG_90 || startAngle > DEG_270) {
    verticalGrid = CELL_SIZE + gridX * CELL_SIZE;
    distToNextVerticalGrid = CELL_SIZE;
    yIntersection = Math.tan(startAngle) * (verticalGrid - startX) + startY;
  } else {
    verticalGrid = gridX * CELL_SIZE;
    distToNextVerticalGrid = -CELL_SIZE;
    yIntersection = Math.tan(startAngle) * (verticalGrid - startX) + startY;
    verticalGrid -= 1;
  }

  if (startAngle === DEG_90 || startAngle === DEG_270) {
    distToVerticalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (startAngle >= 0 && startAngle < DEG_180) {
      distToNextYIntersection = CELL_SIZE * Math.tan(startAngle);
      if (distToNextYIntersection < 0) {
        distToNextYIntersection = -distToNextYIntersection;
      }
    } else {
      distToNextYIntersection = CELL_SIZE * Math.tan(startAngle);
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
            distToVerticalGridBeingHit = (yIntersection - startY) / Math.sin(startAngle);
            break;
          } else {
            yIntersection += distToNextYIntersection;
            verticalGrid += distToNextVerticalGrid;
          }
        } else {
          distToVerticalGridBeingHit = (yIntersection - startY) / Math.sin(startAngle);
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

  delete encounteredBodies[id];

  if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
    Object.values(encounteredBodies).forEach((body) => {
      if (getDistanceBetween(caster, body) > distToHorizontalGridBeingHit) {
        delete encounteredBodies[body.id];
      }
    });

    return {
      startPoint: {
        x: startX,
        y: startY,
      },
      endPoint: {
        x: xIntersection,
        y: horizontalGrid,
      },
      distance: distToHorizontalGridBeingHit,
      encounteredBodies,
      isHorizontal: true,
      side: startY < horizontalCell.y
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
      x: startX,
      y: startY,
    },
    endPoint: {
      x: verticalGrid,
      y: yIntersection,
    },
    distance: distToVerticalGridBeingHit,
    encounteredBodies,
    side: startX < verticalCell.x
      ? verticalCell.front
      : verticalCell.back,
    cell: verticalCell,
  };
};
