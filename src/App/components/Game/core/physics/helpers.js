/**
 * @module  game/core/physics/helpers
 */

import { CELL_SIZE, WALL_LAYERS } from '@constants/config';
import { AXES, TRANSPARENCY } from './constants';

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
let xOffsetHit;
let yOffsetHit;
let initialCell;
let horizontalCell;
let verticalCell;
let offsetRatio;
let horizontalBody;
let verticalBody;
let horizontalOverlay;
let verticalOverlay;
let side;
let rayEndPoint;
let initialCellBody;
let encounteredBodyValues;
let encounterdBody;

const DEGREES = [...Array(361).keys()].map(
  degrees => (degrees * Math.PI) / 180
);

const { X, Y } = AXES;

const { FULL } = TRANSPARENCY;

const HALF_CELL = CELL_SIZE / 2;

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
  const c1 = a1 * l1p1.x + b1 * l1p1.y;
  const a2 = l2p2.y - l2p1.y;
  const b2 = l2p1.x - l2p2.x;
  const c2 = a2 * l2p1.x + b2 * l2p1.y;
  const determinant = a1 * b2 - a2 * b1;

  if (determinant === 0) {
    return null;
  }

  const x = (b2 * c1 - b1 * c2) / determinant;
  const y = (a1 * c2 - a2 * c1) / determinant;

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

    if (x >= l2p2.x && x <= l2p1.x) {
      return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
    }

    return null;
  }

  return null;
};

const lineIntersectsLine = (l1p1, l1p2, l2p1, l2p2) => {
  let q =
    (l1p1.y - l2p1.y) * (l2p2.x - l2p1.x) -
    (l1p1.x - l2p1.x) * (l2p2.y - l2p1.y);

  const d =
    (l1p2.x - l1p1.x) * (l2p2.y - l2p1.y) -
    (l1p2.y - l1p1.y) * (l2p2.x - l2p1.x);

  if (d === 0) {
    return false;
  }

  const r = q / d;

  q =
    (l1p1.y - l2p1.y) * (l1p2.x - l1p1.x) -
    (l1p1.x - l2p1.x) * (l1p2.y - l1p1.y);

  const s = q / d;

  if (r < 0 || r > 1 || s < 0 || s > 1) {
    return false;
  }

  return true;
};

/**
 * A collision between a ray and a body has occured.
 * @param  {Body}    body           The body.
 * @param  {Object}  ray.startPoint The first point of the ray.
 * @param  {Object}  ray.endPoint   The second point of the ray.
 * @return {Boolean}                Represents whether a collision has occured.
 */
export const isRayCollision = (body, { startPoint, endPoint }) => {
  const { x, y, width, length } = body.shape;

  return (
    lineIntersectsLine(startPoint, endPoint, { x, y }, { x: x + width, y }) ||
    lineIntersectsLine(
      startPoint,
      endPoint,
      { x: x + width, y },
      { x: x + width, y: y + length }
    ) ||
    lineIntersectsLine(
      startPoint,
      endPoint,
      { x: x + width, y: y + length },
      { x, y: y + length }
    ) ||
    lineIntersectsLine(startPoint, endPoint, { x, y: y + length }, { x, y })
  );
};

/**
 * A collision between a ray and a body has occured.
 * @param  {Body}    body           The body.
 * @param  {Object}  ray.startPoint The first point of the ray.
 * @param  {Object}  ray.endPoint   The second point of the ray.
 * @return {Object}                 The point where the collision occurred.
 */
export const getRayCollision = (body, { startPoint, endPoint }) => {
  const { x, y, width } = body.shape;

  return [
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x, y },
      { x: x + width, y }
    ),
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x: x + width, y },
      { x: x + width, y: y + width }
    ),
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x: x + width, y: y + width },
      { x, y: y + width }
    ),
    getLineLineIntersection(
      startPoint,
      endPoint,
      { x, y: y + width },
      { x, y }
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
 * Check if two bodies are colliding.
 * @param  {Body} bodyA The first body.
 * @param  {Body} bodyB The second body.
 * @return {Boolean}    Are the bodies colliding.
 */
export const isBodyCollision = (bodyA, bodyB) => {
  // Note: used for alternative collision detection.
  const startPoint = bodyA.previousPos;
  const endPoint = { x: bodyA.x, y: bodyA.y };

  const shapeA = bodyA.shape;
  const shapeB = bodyB.shape;

  const collision =
    shapeA.x < shapeB.x + shapeB.width &&
    shapeA.x + shapeA.width > shapeB.x &&
    shapeA.y < shapeB.y + shapeB.length &&
    shapeA.length + shapeA.y > shapeB.y;

  return collision || isRayCollision(bodyB, { startPoint, endPoint });
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
 * Is a dynamic body facing a another body.
 * @param  {DynamicBody}  bodyA   The first body.
 * @param  {Body}         bodyB   The second body.
 * @return {Boolean}              Is the dynamic body facing the body.
 */
export const isFacing = (bodyA, bodyB) => {
  const angle =
    (getAngleBetween(bodyA, bodyB) - bodyA.angle + DEG_360) % DEG_360;
  return angle > DEG_270 || angle < DEG_90;
};

const castCellRay = ({
  x,
  y,
  angle,
  ignoreOverlay = true,
  radius = 0,
  gridX,
  gridY,
  initialCell,
}) => {
  const encounteredBodies = {};

  if (angle > 0 && angle < DEG_180) {
    horizontalGrid = CELL_SIZE + gridY * CELL_SIZE;

    if (
      (initialCell.blocking || initialCell.overlay) &&
      initialCell.axis === X &&
      y < horizontalGrid - initialCell.offset.y
    ) {
      horizontalGrid -= initialCell.offset.y;
    }

    xIntersection = (horizontalGrid - y) / Math.tan(angle) + x;
  } else {
    horizontalGrid = gridY * CELL_SIZE;

    if (
      (initialCell.blocking || initialCell.overlay) &&
      initialCell.axis === X &&
      y > horizontalGrid + (CELL_SIZE - initialCell.offset.y)
    ) {
      horizontalGrid += CELL_SIZE - initialCell.offset.y;
    }

    xIntersection = (horizontalGrid - y) / Math.tan(angle) + x;
    horizontalGrid -= 1;
  }

  distToHorizontalGridBeingHit = (xIntersection - x) / Math.cos(angle);

  horizontalOverlay =
    initialCell.axis === X && !ignoreOverlay && initialCell.overlay;

  if (horizontalOverlay) {
    distToHorizontalGridBeingHit -= 0.01;
  }

  if (angle < DEG_90 || angle > DEG_270) {
    verticalGrid = CELL_SIZE + gridX * CELL_SIZE;

    if (
      (initialCell.blocking || initialCell.overlay) &&
      initialCell.axis === Y &&
      x < verticalGrid - initialCell.offset.x
    ) {
      verticalGrid -= initialCell.offset.x;
    }

    yIntersection = Math.tan(angle) * (verticalGrid - x) + y;
  } else {
    verticalGrid = gridX * CELL_SIZE;

    if (
      (initialCell.blocking || initialCell.overlay) &&
      initialCell.axis === Y &&
      verticalGrid + (CELL_SIZE - initialCell.offset.x) < x
    ) {
      verticalGrid += CELL_SIZE - initialCell.offset.x;
    }

    yIntersection = Math.tan(angle) * (verticalGrid - x) + y;
    verticalGrid -= 1;
  }

  distToVerticalGridBeingHit = (yIntersection - y) / Math.sin(angle);

  verticalOverlay =
    initialCell.axis === Y && !ignoreOverlay && initialCell.overlay;

  if (verticalOverlay) {
    distToVerticalGridBeingHit -= 0.01;
  }

  if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
    if (initialCell.axis === Y) {
      return null;
    }

    if (!initialCell.blocking && !horizontalOverlay) {
      return null;
    }

    if (horizontalOverlay || initialCell.transparency === FULL) {
      if (initialCell.reverse) {
        if (y < horizontalGrid) {
          return null;
        }
      } else if (y > horizontalGrid) {
        return null;
      }
    }

    // if door offset miss.
    if (!horizontalOverlay && initialCell.isDoor) {
      xOffsetHit = xIntersection % CELL_SIZE;

      if (initialCell.double) {
        if (
          initialCell.offset.x % CELL_SIZE > 0 &&
          xOffsetHit > HALF_CELL - initialCell.offset.x / 2 &&
          xOffsetHit < CELL_SIZE - (HALF_CELL - initialCell.offset.x / 2)
        ) {
          return null;
        }
      } else if (initialCell.offset.x && xOffsetHit < initialCell.offset.x) {
        return null;
      }
    }

    rayEndPoint = { x: xIntersection, y: horizontalGrid };

    for (let i = 0, n = initialCell.bodies.length; i < n; i++) {
      initialCellBody = initialCell.bodies[i];

      if (
        x !== initialCellBody.x &&
        y !== initialCellBody.y &&
        isRayCollision(initialCellBody, {
          startPoint: {
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
          },
          endPoint: rayEndPoint,
        })
      ) {
        encounteredBodies[initialCellBody.id] = initialCellBody;
      }
    }

    side = y < initialCell.y ? initialCell.left : initialCell.right;

    return {
      startPoint: { x, y },
      endPoint: rayEndPoint,
      distance: distToHorizontalGridBeingHit,
      encounteredBodies,
      isHorizontal: true,
      side: horizontalOverlay ? initialCell.overlay : side,
      cell: initialCell,
      angle,
      isOverlay: horizontalOverlay,
    };
  }

  if (initialCell.axis === X) {
    return null;
  }

  if (!initialCell.blocking && !verticalOverlay) {
    return null;
  }

  if (verticalOverlay || initialCell.transparency === FULL) {
    if (initialCell.reverse) {
      if (x < verticalGrid) {
        return null;
      }
    } else if (x > verticalGrid) {
      return null;
    }
  }

  // if door offset miss.
  if (!verticalOverlay && initialCell.isDoor) {
    yOffsetHit = yIntersection % CELL_SIZE;

    if (initialCell.double) {
      if (
        initialCell.offset.y % CELL_SIZE > 0 &&
        yOffsetHit > HALF_CELL - initialCell.offset.y / 2 &&
        yOffsetHit < CELL_SIZE - (HALF_CELL - initialCell.offset.y / 2)
      ) {
        return null;
      }
    } else if (initialCell.offset.y && yOffsetHit < initialCell.offset.y) {
      return null;
    }
  }

  side = x < initialCell.x ? initialCell.front : initialCell.back;

  rayEndPoint = { x: verticalGrid, y: yIntersection };

  for (let i = 0, n = initialCell.bodies.length; i < n; i++) {
    initialCellBody = initialCell.bodies[i];

    if (
      x !== initialCellBody.x &&
      y !== initialCellBody.y &&
      isRayCollision(initialCellBody, {
        startPoint: {
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
        },
        endPoint: rayEndPoint,
      })
    ) {
      encounteredBodies[initialCellBody.id] = initialCellBody;
    }
  }

  return {
    startPoint: { x, y },
    endPoint: rayEndPoint,
    distance: distToVerticalGridBeingHit,
    encounteredBodies,
    side: verticalOverlay ? initialCell.overlay : side,
    cell: initialCell,
    angle,
    isOverlay: verticalOverlay,
  };
};

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
  ignoreOverlay = true,
  elavation = 0,
  radius = 0,
}) => {
  const encounteredBodies = {};
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);

  initialCell = world.getCell(gridX, gridY);

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
        xGridIndex >= world.width ||
        yGridIndex >= world.length ||
        xGridIndex < 0 ||
        yGridIndex < 0
      ) {
        distToHorizontalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      horizontalCell = world.getCell(xGridIndex, yGridIndex);

      horizontalOverlay = !ignoreOverlay && horizontalCell.overlay;

      if (
        (horizontalCell.blocking && horizontalCell.height > elavation) ||
        horizontalOverlay
      ) {
        if (horizontalCell.axis) {
          if (horizontalCell.isDoor) {
            if (horizontalCell.reverse) {
              if (y < horizontalCell.y) {
                offsetRatio = CELL_SIZE / (CELL_SIZE - horizontalCell.offset.y);
              } else {
                offsetRatio = CELL_SIZE / horizontalCell.offset.y;
              }
            } else if (y < horizontalCell.y) {
              offsetRatio = CELL_SIZE / horizontalCell.offset.y;
            } else {
              offsetRatio = CELL_SIZE / (CELL_SIZE - horizontalCell.offset.y);
            }

            xOffsetDist = distToNextXIntersection / offsetRatio;
            yOffsetDist = distToNextHorizontalGrid / offsetRatio;

            xOffsetHit = (xIntersection + xOffsetDist) % CELL_SIZE;

            if (horizontalOverlay) {
              xIntersection += xOffsetDist;
              horizontalGrid += yOffsetDist;
              distToHorizontalGridBeingHit =
                (xIntersection - x) / Math.cos(angle) - 0.01;
              break;
            } else if (horizontalCell.double) {
              if (
                xOffsetHit < HALF_CELL - horizontalCell.offset.x / 2 ||
                xOffsetHit >
                  CELL_SIZE - (HALF_CELL - horizontalCell.offset.x / 2)
              ) {
                xIntersection += xOffsetDist;
                horizontalGrid += yOffsetDist;
                distToHorizontalGridBeingHit =
                  (xIntersection - x) / Math.cos(angle);
                break;
              } else {
                xIntersection += distToNextXIntersection;
                horizontalGrid += distToNextHorizontalGrid;
              }
            } else if (
              (xIntersection + xOffsetDist) % CELL_SIZE >
              horizontalCell.offset.x
            ) {
              xIntersection += xOffsetDist;
              horizontalGrid += yOffsetDist;
              distToHorizontalGridBeingHit =
                (xIntersection - x) / Math.cos(angle);
              break;
            } else {
              xIntersection += distToNextXIntersection;
              horizontalGrid += distToNextHorizontalGrid;
            }
          } else if (horizontalCell.isPushWall) {
            offsetRatio = CELL_SIZE / horizontalCell.offset.y;
            xOffsetDist = distToNextXIntersection / offsetRatio;
            yOffsetDist = distToNextHorizontalGrid / offsetRatio;

            if (
              Math.floor((xIntersection + xOffsetDist) / CELL_SIZE) ===
              horizontalCell.gridX
            ) {
              xIntersection += xOffsetDist;
              horizontalGrid += yOffsetDist;
              distToHorizontalGridBeingHit =
                (xIntersection - x) / Math.cos(angle);
              break;
            } else {
              xIntersection += distToNextXIntersection;
              horizontalGrid += distToNextHorizontalGrid;
            }
          } else if (horizontalCell.transparency) {
            if (horizontalCell.offset.y) {
              if (horizontalCell.reverse) {
                if (y < horizontalCell.y) {
                  offsetRatio =
                    CELL_SIZE / (CELL_SIZE - horizontalCell.offset.y);
                } else {
                  offsetRatio = CELL_SIZE / horizontalCell.offset.y;
                }
              } else if (y < horizontalCell.y) {
                offsetRatio = CELL_SIZE / horizontalCell.offset.y;
              } else {
                offsetRatio = CELL_SIZE / (CELL_SIZE - horizontalCell.offset.y);
              }

              xOffsetDist = distToNextXIntersection / offsetRatio;
              yOffsetDist = distToNextHorizontalGrid / offsetRatio;
            } else {
              xOffsetDist = Number.MAX_VALUE;
              yOffsetDist = Number.MAX_VALUE;
            }

            if (
              (xIntersection + xOffsetDist) % CELL_SIZE >
              horizontalCell.offset.x
            ) {
              xIntersection += xOffsetDist;
              horizontalGrid += yOffsetDist;
              distToHorizontalGridBeingHit =
                (xIntersection - x) / Math.cos(angle);
              break;
            } else {
              xIntersection += distToNextXIntersection;
              horizontalGrid += distToNextHorizontalGrid;
            }
          } else {
            distToHorizontalGridBeingHit =
              (xIntersection - x) / Math.cos(angle);
            break;
          }
        } else {
          distToHorizontalGridBeingHit = (xIntersection - x) / Math.cos(angle);
          break;
        }
      } else {
        for (let i = 0, n = horizontalCell.bodies.length; i < n; i++) {
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
        xGridIndex >= world.width ||
        yGridIndex >= world.length ||
        xGridIndex < 0 ||
        yGridIndex < 0
      ) {
        distToVerticalGridBeingHit = Number.MAX_VALUE;
        break;
      }

      verticalCell = world.getCell(xGridIndex, yGridIndex);

      verticalOverlay = !ignoreOverlay && verticalCell.overlay;

      if (
        (verticalCell.blocking && verticalCell.height > elavation) ||
        verticalOverlay
      ) {
        if (verticalCell.axis) {
          if (verticalCell.isDoor) {
            if (verticalCell.reverse) {
              if (x < verticalCell.x) {
                offsetRatio = CELL_SIZE / (CELL_SIZE - verticalCell.offset.x);
              } else {
                offsetRatio = CELL_SIZE / verticalCell.offset.x;
              }
            } else if (x < verticalCell.x) {
              offsetRatio = CELL_SIZE / verticalCell.offset.x;
            } else {
              offsetRatio = CELL_SIZE / (CELL_SIZE - verticalCell.offset.x);
            }

            yOffsetDist = distToNextYIntersection / offsetRatio;
            xOffsetDist = distToNextVerticalGrid / offsetRatio;

            yOffsetHit = (yIntersection + yOffsetDist) % CELL_SIZE;

            if (verticalOverlay) {
              yIntersection += yOffsetDist;
              verticalGrid += xOffsetDist;
              distToVerticalGridBeingHit =
                (yIntersection - y) / Math.sin(angle) - 0.01;
              break;
            } else if (verticalCell.double) {
              if (
                yOffsetHit < HALF_CELL - verticalCell.offset.y / 2 ||
                yOffsetHit > CELL_SIZE - (HALF_CELL - verticalCell.offset.y / 2)
              ) {
                yIntersection += yOffsetDist;
                verticalGrid += xOffsetDist;
                distToVerticalGridBeingHit =
                  (yIntersection - y) / Math.sin(angle);
                break;
              } else {
                yIntersection += distToNextYIntersection;
                verticalGrid += distToNextVerticalGrid;
              }
            } else if (yOffsetHit > verticalCell.offset.y) {
              yIntersection += yOffsetDist;
              verticalGrid += xOffsetDist;
              distToVerticalGridBeingHit =
                (yIntersection - y) / Math.sin(angle);
              break;
            } else {
              yIntersection += distToNextYIntersection;
              verticalGrid += distToNextVerticalGrid;
            }
          } else if (verticalCell.isPushWall) {
            offsetRatio = CELL_SIZE / verticalCell.offset.x;
            yOffsetDist = distToNextYIntersection / offsetRatio;
            xOffsetDist = distToNextVerticalGrid / offsetRatio;

            if (
              Math.floor((yIntersection + yOffsetDist) / CELL_SIZE) ===
              verticalCell.gridY
            ) {
              yIntersection += yOffsetDist;
              verticalGrid += xOffsetDist;
              distToVerticalGridBeingHit =
                (yIntersection - y) / Math.sin(angle);
              break;
            } else {
              yIntersection += distToNextYIntersection;
              verticalGrid += distToNextVerticalGrid;
            }
          } else if (verticalCell.transparency) {
            if (verticalCell.offset.x) {
              if (verticalCell.reverse) {
                if (x < verticalCell.x) {
                  offsetRatio = CELL_SIZE / (CELL_SIZE - verticalCell.offset.x);
                } else {
                  offsetRatio = CELL_SIZE / verticalCell.offset.x;
                }
              } else if (x < verticalCell.x) {
                offsetRatio = CELL_SIZE / verticalCell.offset.x;
              } else {
                offsetRatio = CELL_SIZE / (CELL_SIZE - verticalCell.offset.x);
              }

              yOffsetDist = distToNextYIntersection / offsetRatio;
              xOffsetDist = distToNextVerticalGrid / offsetRatio;
            } else {
              yOffsetDist = Number.MAX_VALUE;
              xOffsetDist = Number.MAX_VALUE;
            }

            if (
              (yIntersection + yOffsetDist) % CELL_SIZE >
              verticalCell.offset.y
            ) {
              yIntersection += yOffsetDist;
              verticalGrid += xOffsetDist;
              distToVerticalGridBeingHit =
                (yIntersection - y) / Math.sin(angle);
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
          distToVerticalGridBeingHit = (yIntersection - y) / Math.sin(angle);
          break;
        }
      } else {
        for (let i = 0, n = verticalCell.bodies.length; i < n; i++) {
          verticalBody = verticalCell.bodies[i];
          encounteredBodies[verticalBody.id] = verticalBody;
        }

        yIntersection += distToNextYIntersection;
        verticalGrid += distToNextVerticalGrid;
      }
    }
  }

  if (distToHorizontalGridBeingHit < distToVerticalGridBeingHit) {
    rayEndPoint = { x: xIntersection, y: horizontalGrid };

    for (let i = 0, n = horizontalCell.bodies.length; i < n; i++) {
      horizontalBody = horizontalCell.bodies[i];
      encounteredBodies[horizontalBody.id] = horizontalBody;
    }

    for (let i = 0, n = initialCell.bodies.length; i < n; i++) {
      initialCellBody = initialCell.bodies[i];

      if (
        x !== initialCellBody.x &&
        y !== initialCellBody.y &&
        isRayCollision(initialCellBody, {
          startPoint: {
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
          },
          endPoint: rayEndPoint,
        })
      ) {
        encounteredBodies[initialCellBody.id] = initialCellBody;
      }
    }

    encounteredBodyValues = Object.values(encounteredBodies);

    for (let i = 0, n = encounteredBodyValues.length; i < n; i++) {
      encounterdBody = encounteredBodyValues[i];

      if (
        !isRayCollision(encounterdBody, {
          startPoint: { x, y },
          endPoint: rayEndPoint,
        })
      ) {
        delete encounteredBodies[encounterdBody.id];
      }
    }

    side = y < horizontalCell.y ? horizontalCell.left : horizontalCell.right;

    return {
      startPoint: { x, y },
      endPoint: rayEndPoint,
      distance: distToHorizontalGridBeingHit,
      encounteredBodies,
      isHorizontal: true,
      side: horizontalOverlay ? horizontalCell.overlay : side,
      cell: horizontalCell,
      angle,
      isOverlay: horizontalOverlay,
    };
  }

  rayEndPoint = { x: verticalGrid, y: yIntersection };

  for (let i = 0, n = verticalCell.bodies.length; i < n; i++) {
    verticalBody = verticalCell.bodies[i];
    encounteredBodies[verticalBody.id] = verticalBody;
  }

  for (let i = 0, n = initialCell.bodies.length; i < n; i++) {
    initialCellBody = initialCell.bodies[i];

    if (
      x !== initialCellBody.x &&
      y !== initialCellBody.y &&
      isRayCollision(initialCellBody, {
        startPoint: {
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
        },
        endPoint: rayEndPoint,
      })
    ) {
      encounteredBodies[initialCellBody.id] = initialCellBody;
    }
  }

  encounteredBodyValues = Object.values(encounteredBodies);

  for (let i = 0, n = encounteredBodyValues.length; i < n; i++) {
    encounterdBody = encounteredBodyValues[i];

    if (
      !isRayCollision(encounterdBody, {
        startPoint: { x, y },
        endPoint: rayEndPoint,
      })
    ) {
      delete encounteredBodies[encounterdBody.id];
    }
  }

  side = x < verticalCell.x ? verticalCell.front : verticalCell.back;

  return {
    startPoint: { x, y },
    endPoint: rayEndPoint,
    distance: distToVerticalGridBeingHit,
    encounteredBodies,
    side: verticalOverlay ? verticalCell.overlay : side,
    cell: verticalCell,
    angle,
    isOverlay: verticalOverlay,
  };
};

/**
 * Cast a ray that goes through transparent cells.
 * @param  {Number} options.x     The x coordinate of the starting point.
 * @param  {Number} options.y     The y coordinate of the starting point.
 * @param  {Number} options.angle The angle of the ray.
 * @param  {World}  options.world The world in which the ray is cast.
 * @return {Array}                The raycast results.
 */
export const castRay = ({ x, y, angle, world, checkInitialCell, ...other }) => {
  let currentRay;
  let previousRay;

  const result = [];
  const rayAngle = angle % DEG_90 === 0 ? angle + 0.0001 : angle;
  const startPoint = { x, y };

  for (let i = 0; i < WALL_LAYERS; i++) {
    previousRay = result[i - 1];

    if (previousRay) {
      currentRay = castRaySection(
        Object.assign(other, previousRay.endPoint, {
          world,
          angle: rayAngle,
        })
      );

      currentRay.distance += previousRay.distance;
      currentRay.startPoint = startPoint;

      Object.assign(
        currentRay.encounteredBodies,
        previousRay.encounteredBodies
      );
    } else {
      const options = Object.assign(other, startPoint, {
        world,
        angle: rayAngle,
      });

      if (checkInitialCell) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);
        const initialCell = world.getCell(gridX, gridY);

        if (initialCell.offset.x || initialCell.offset.y) {
          currentRay = castCellRay(
            Object.assign(options, {
              initialCell,
              gridX,
              gridY,
            })
          );
        }
      }

      if (!currentRay) {
        currentRay = castRaySection(options);
      }
    }

    result.push(currentRay);

    if (!(currentRay.cell.transparency || currentRay.isOverlay)) {
      break;
    }
  }

  return result;
};
