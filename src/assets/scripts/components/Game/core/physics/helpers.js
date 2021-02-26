import { CELL_SIZE, WALL_LAYERS } from 'game/constants/config';

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
let horizontalBody;
let verticalBody;

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
}

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
}

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
}

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
}

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
}

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
}

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
}

/**
 * Is a dynamic body facing a another body.
 * @param  {DynamicBody}  bodyA   The dynamic body.
 * @param  {Body}         bodyB   The second body.
 * @return {Boolean}              Is the dynamic body facing the body.
 */
export const isFacing = (bodyA, bodyB) => {
  const angle = (getAngleBetween(bodyA, bodyB) - bodyA.angle + DEG_360) % DEG_360;
  return angle > DEG_270 || angle < DEG_90;
}

/**
 * Cast a ray.
 * @param  {Number} options.x     The x coordinate of the starting point.
 * @param  {Number} options.y     The y coordinate of the starting point.
 * @param  {Number} options.angle The angle of the ray.
 * @param  {World}  options.world The world in which the ray is cast.
 * @return {Object}               The cast result.
 */
const castRaySection = ({
  x,
  y,
  angle,
  world,
}) => {
  const encounteredBodies = {};
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);

  world.getCell(gridX, gridY).bodies.forEach((body) => {
    if ((isFacing({ x, y, angle }, body)) && (x !== body.x && y !== body.y)) {
      encounteredBodies[body.id] = body;
    }
  });

  if (angle > 0 && angle < DEG_180) {
    horizontalGrid = CELL_SIZE + gridY * CELL_SIZE;
    distToNextHorizontalGrid = CELL_SIZE;
    xIntersection = (horizontalGrid - y) / Math.tan(angle) + x;
  } else {
    horizontalGrid = gridY * CELL_SIZE;
    distToNextHorizontalGrid = -CELL_SIZE;
    xIntersection = (horizontalGrid - y) / Math.tan(angle) + x;
    horizontalGrid -= 1;
  }

  if (angle === 0 || angle === DEG_180) {
    distToHorizontalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (angle >= DEG_90 && angle < DEG_270) {
      distToNextXIntersection = CELL_SIZE / Math.tan(angle);
      if (distToNextXIntersection > 0) {
        distToNextXIntersection = -distToNextXIntersection;
      }
    } else {
      distToNextXIntersection = CELL_SIZE / Math.tan(angle);
      if (distToNextXIntersection < 0) {
        distToNextXIntersection = -distToNextXIntersection;
      }
    }

    while (true) {
      xGridIndex = Math.floor(xIntersection / CELL_SIZE);
      yGridIndex = Math.floor(horizontalGrid / CELL_SIZE);

      if (
        xGridIndex >= world.width
          || yGridIndex >= world.length
          || xGridIndex < 0
          || yGridIndex < 0
      ) {
        distToHorizontalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      horizontalCell = world.getCell(xGridIndex, yGridIndex);

      if (horizontalCell.blocking) {
        if (horizontalCell.axis) {
          if (horizontalCell.offset.y) {
            offsetRatio = CELL_SIZE / horizontalCell.offset.y;
            xOffsetDist = distToNextXIntersection / offsetRatio;
            yOffsetDist = distToNextHorizontalGrid / offsetRatio;
          } else {
            xOffsetDist = Number.MAX_VALUE;
            yOffsetDist = Number.MAX_VALUE;
          }

          if ((xIntersection + xOffsetDist) % CELL_SIZE > horizontalCell.offset.x) {
            xIntersection += xOffsetDist;
            horizontalGrid += yOffsetDist;

            distToHorizontalGridBeingHit = (xIntersection - x) / Math.cos(angle);
            break;
          } else {
            xIntersection += distToNextXIntersection;
            horizontalGrid += distToNextHorizontalGrid;
          }
        } else {
          distToHorizontalGridBeingHit = (xIntersection - x) / Math.cos(angle);
          break;
        }
      } else {
        for (let i = 0, len = horizontalCell.bodies.length; i < len; i += 1) {
          horizontalBody = horizontalCell.bodies[i];
          encounteredBodies[horizontalBody.id] = horizontalBody;
        }

        xIntersection += distToNextXIntersection;
        horizontalGrid += distToNextHorizontalGrid;
      }
    }
  }

  if (angle < DEG_90 || angle > DEG_270) {
    verticalGrid = CELL_SIZE + gridX * CELL_SIZE;
    distToNextVerticalGrid = CELL_SIZE;
    yIntersection = Math.tan(angle) * (verticalGrid - x) + y;
  } else {
    verticalGrid = gridX * CELL_SIZE;
    distToNextVerticalGrid = -CELL_SIZE;
    yIntersection = Math.tan(angle) * (verticalGrid - x) + y;
    verticalGrid -= 1;
  }

  if (angle === DEG_90 || angle === DEG_270) {
    distToVerticalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (angle >= 0 && angle < DEG_180) {
      distToNextYIntersection = CELL_SIZE * Math.tan(angle);
      if (distToNextYIntersection < 0) {
        distToNextYIntersection = -distToNextYIntersection;
      }
    } else {
      distToNextYIntersection = CELL_SIZE * Math.tan(angle);
      if (distToNextYIntersection > 0) {
        distToNextYIntersection = -distToNextYIntersection;
      }
    }

    while (true) {
      xGridIndex = Math.floor(verticalGrid / CELL_SIZE);
      yGridIndex = Math.floor(yIntersection / CELL_SIZE);

      if (
        xGridIndex >= world.width
          || yGridIndex >= world.length
          || xGridIndex < 0
          || yGridIndex < 0
      ) {
        distToVerticalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      verticalCell = world.getCell(xGridIndex, yGridIndex);

      if (verticalCell.blocking) {
        if (verticalCell.axis) {
          if (verticalCell.offset.x) {
            offsetRatio = CELL_SIZE / verticalCell.offset.x;
            yOffsetDist = distToNextYIntersection / offsetRatio;
            xOffsetDist = distToNextVerticalGrid / offsetRatio;
          } else {
            yOffsetDist = Number.MAX_VALUE;
            xOffsetDist = Number.MAX_VALUE;
          }

          if ((yIntersection + yOffsetDist) % CELL_SIZE > verticalCell.offset.y) {
            yIntersection += yOffsetDist;
            verticalGrid += xOffsetDist;
            distToVerticalGridBeingHit = (yIntersection - y) / Math.sin(angle);
            break;
          } else {
            yIntersection += distToNextYIntersection;
            verticalGrid += distToNextVerticalGrid;
          }
        } else {
          distToVerticalGridBeingHit = (yIntersection - y) / Math.sin(angle);
          break;
        }
      } else {
        for (let i = 0, len = verticalCell.bodies.length; i < len; i += 1) {
          verticalBody = verticalCell.bodies[i];
          encounteredBodies[verticalBody.id] = verticalBody;
        }

        yIntersection += distToNextYIntersection;
        verticalGrid += distToNextVerticalGrid;
      }
    }
  }

  if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
    Object.values(encounteredBodies).forEach((body) => {
      if (getDistanceBetween({ x, y }, body) > distToHorizontalGridBeingHit) {
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
      side: y < horizontalCell.y
        ? horizontalCell.left
        : horizontalCell.right,
      cell: horizontalCell,
    };
  }

  Object.values(encounteredBodies).forEach((body) => {
    if (getDistanceBetween({ x, y }, body) > distToVerticalGridBeingHit) {
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
    side: x < verticalCell.x
      ? verticalCell.front
      : verticalCell.back,
    cell: verticalCell,
  };
}

/**
 * Cast a long ray that goes through bars.
 * @param  {Number} options.x     The x coordinate of the starting point.
 * @param  {Number} options.y     The y coordinate of the starting point.
 * @param  {Number} options.angle The angle of the ray.
 * @param  {World}  options.world The world in which the ray is cast.
 * @return {Array}                The cast results.
 */
export const castRay = (options) => {
  const result = [];

  for (let i = 0; i < WALL_LAYERS; i += 1) {
    const previousRay = result[i - 1];

    let currentRay;

    if (previousRay) {
      currentRay = castRaySection(Object.assign(options, previousRay.endPoint));
      currentRay.distance += previousRay.distance;
      Object.assign(currentRay.encounteredBodies, previousRay.encounteredBodies);
    } else {
      currentRay = castRaySection(options);
    }

    result.push(currentRay);

    if (!currentRay.cell.bars) {
      break;
    }
  }

  return result;
}
