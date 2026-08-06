import { CELL_SIZE, WALL_LAYERS } from '@constants/config';
import { AXES, TRANSPARENCY } from './constants';
import { DEG_90, DEG_180, DEG_270, DEG_360 } from './degrees';
import Ray from './components/Ray';
import Point, { getDistanceBetween, getAngleBetween } from './components/Point';
import type Shape from './components/Shape';
import type {
  CastRayOptions,
  Line,
  Positioned,
  RayCollision,
  Side,
} from './types';
import type Body from './components/Body';
import type Cell from './components/Cell';

const { X, Y } = AXES;

const { FULL } = TRANSPARENCY;

const HALF_CELL = CELL_SIZE / 2;

const getLineLineIntersection = (
  l1p1: Point,
  l1p2: Point,
  l2p1: Point,
  l2p2: Point
): RayCollision | null => {
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

const lineIntersectsLine = (
  l1p1: Point,
  l1p2: Point,
  l2p1: Point,
  l2p2: Point
): boolean => {
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

export const isRayCollision = (
  body: { shape: Shape },
  { startPoint, endPoint }: Line
): boolean => {
  const { topLeft, topRight, bottomRight, bottomLeft } = body.shape.corners();

  return (
    lineIntersectsLine(startPoint, endPoint, topLeft, topRight) ||
    lineIntersectsLine(startPoint, endPoint, topRight, bottomRight) ||
    lineIntersectsLine(startPoint, endPoint, bottomRight, bottomLeft) ||
    lineIntersectsLine(startPoint, endPoint, bottomLeft, topLeft)
  );
};

export const getRayCollision = (
  body: { shape: Shape },
  { startPoint, endPoint }: Line
): RayCollision | null => {
  const { topLeft, topRight, bottomRight, bottomLeft } = body.shape.corners();

  return [
    getLineLineIntersection(startPoint, endPoint, topLeft, topRight),
    getLineLineIntersection(startPoint, endPoint, topRight, bottomRight),
    getLineLineIntersection(startPoint, endPoint, bottomRight, bottomLeft),
    getLineLineIntersection(startPoint, endPoint, bottomLeft, topLeft),
  ].reduce<RayCollision | null>((memo, intersection) => {
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

export const isBodyCollision = (
  bodyA: { x: number; y: number; shape: Shape; previousPos: Point },
  bodyB: { shape: Shape }
): boolean => {
  if (bodyA.shape.overlaps(bodyB.shape)) {
    return true;
  }

  // Overlapping where it stands is the common case; this catches a body that
  // moved far enough in one frame to pass clean through the other.
  const startPoint = bodyA.previousPos;
  const endPoint = new Point(bodyA.x, bodyA.y);

  return isRayCollision(bodyB, { startPoint, endPoint });
};

export const isFacing = (
  bodyA: Positioned & { angle: number },
  bodyB: Positioned
): boolean => {
  const angle =
    (getAngleBetween(bodyA, bodyB) - bodyA.angle + DEG_360) % DEG_360;
  return angle > DEG_270 || angle < DEG_90;
};

interface CastCellRayOptions extends CastRayOptions {
  gridX: number;
  gridY: number;
  initialCell: Cell;
}

const castCellRay = ({
  x,
  y,
  angle,
  ignoreOverlay = true,
  radius = 0,
  gridX,
  gridY,
  initialCell,
}: CastCellRayOptions): Ray | null => {
  let horizontalGrid: number;
  let verticalGrid: number;
  let distToHorizontalGridBeingHit: number;
  let distToVerticalGridBeingHit: number;
  let xIntersection: number;
  let yIntersection: number;
  let xOffsetHit: number;
  let yOffsetHit: number;

  let side: Side | undefined;
  let rayEndPoint: Point;
  let initialCellBody: Body;
  const encounteredBodies: Record<string, Body> = {};

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const tanAngle = Math.tan(angle);
  const rayStart = new Point(x + cosAngle * radius, y + sinAngle * radius);

  if (angle > 0 && angle < DEG_180) {
    horizontalGrid = CELL_SIZE + gridY * CELL_SIZE;

    if (
      (initialCell.blocking || initialCell.overlay) &&
      initialCell.axis === X &&
      y < horizontalGrid - initialCell.offset.y
    ) {
      horizontalGrid -= initialCell.offset.y;
    }

    xIntersection = (horizontalGrid - y) / tanAngle + x;
  } else {
    horizontalGrid = gridY * CELL_SIZE;

    if (
      (initialCell.blocking || initialCell.overlay) &&
      initialCell.axis === X &&
      y > horizontalGrid + (CELL_SIZE - initialCell.offset.y)
    ) {
      horizontalGrid += CELL_SIZE - initialCell.offset.y;
    }

    xIntersection = (horizontalGrid - y) / tanAngle + x;
    horizontalGrid -= 1;
  }

  distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;

  const horizontalOverlay =
    initialCell.axis === X && !ignoreOverlay && !!initialCell.overlay;

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

    yIntersection = tanAngle * (verticalGrid - x) + y;
  } else {
    verticalGrid = gridX * CELL_SIZE;

    if (
      (initialCell.blocking || initialCell.overlay) &&
      initialCell.axis === Y &&
      verticalGrid + (CELL_SIZE - initialCell.offset.x) < x
    ) {
      verticalGrid += CELL_SIZE - initialCell.offset.x;
    }

    yIntersection = tanAngle * (verticalGrid - x) + y;
    verticalGrid -= 1;
  }

  distToVerticalGridBeingHit = (yIntersection - y) / sinAngle;

  const verticalOverlay =
    initialCell.axis === Y && !ignoreOverlay && !!initialCell.overlay;

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

    rayEndPoint = new Point(xIntersection, horizontalGrid);

    for (let i = 0, n = initialCell.bodies.length; i < n; i++) {
      initialCellBody = initialCell.bodies[i];

      if (
        x !== initialCellBody.x &&
        y !== initialCellBody.y &&
        isRayCollision(initialCellBody, {
          startPoint: rayStart,
          endPoint: rayEndPoint,
        })
      ) {
        encounteredBodies[initialCellBody.id] = initialCellBody;
      }
    }

    side = y < initialCell.y ? initialCell.left : initialCell.right;

    return new Ray({
      startPoint: new Point(x, y),
      endPoint: rayEndPoint,
      distance: distToHorizontalGridBeingHit,
      encounteredBodies,
      isHorizontal: true,
      side: horizontalOverlay ? initialCell.overlay : side,
      cell: initialCell,
      angle,
      isOverlay: horizontalOverlay,
    });
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

  rayEndPoint = new Point(verticalGrid, yIntersection);

  for (let i = 0, n = initialCell.bodies.length; i < n; i++) {
    initialCellBody = initialCell.bodies[i];

    if (
      x !== initialCellBody.x &&
      y !== initialCellBody.y &&
      isRayCollision(initialCellBody, {
        startPoint: rayStart,
        endPoint: rayEndPoint,
      })
    ) {
      encounteredBodies[initialCellBody.id] = initialCellBody;
    }
  }

  return new Ray({
    startPoint: new Point(x, y),
    endPoint: rayEndPoint,
    distance: distToVerticalGridBeingHit,
    encounteredBodies,
    isHorizontal: false,
    side: verticalOverlay ? initialCell.overlay : side,
    cell: initialCell,
    angle,
    isOverlay: verticalOverlay,
  });
};

const castRaySection = ({
  x,
  y,
  angle,
  world,
  ignoreOverlay = true,
  elavation = 0,
  radius = 0,
}: CastRayOptions): Ray => {
  let horizontalGrid: number;
  let verticalGrid: number;
  let distToNextHorizontalGrid: number;
  let distToNextVerticalGrid: number;
  let distToHorizontalGridBeingHit: number;
  let distToVerticalGridBeingHit: number;
  let distToNextXIntersection: number;
  let distToNextYIntersection: number;
  let xIntersection: number;
  let yIntersection: number;
  let xGridIndex: number;
  let yGridIndex: number;
  let xOffsetDist: number;
  let yOffsetDist: number;
  let xOffsetHit: number;
  let yOffsetHit: number;
  let offsetRatio: number;
  let horizontalBody: Body;
  let verticalBody: Body;
  // Default false rather than left unassigned: a ray that never enters a
  // stepping loop still reports "no overlay here" rather than `undefined`.
  let horizontalOverlay = false;
  let verticalOverlay = false;
  let side: Side | undefined;
  let rayEndPoint: Point;
  let initialCellBody: Body;
  let encounteredBodyValues: Body[];
  let encounterdBody: Body;

  const encounteredBodies: Record<string, Body> = {};
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const tanAngle = Math.tan(angle);
  const rayStart = new Point(x + cosAngle * radius, y + sinAngle * radius);
  const originPoint = new Point(x, y);

  const initialCell = world.getCell(gridX, gridY)!;

  // Each stepping loop below overwrites its cell on the first in-bounds
  // iteration, so this fallback only survives when the ray leaves the grid
  // immediately on that axis. That leaves the matching distance at MAX_VALUE,
  // so the ray renders as nothing â€” but it must still name a real cell,
  // because castRay reads `ray.cell.transparency` to decide whether to
  // continue into the next wall layer.
  let horizontalCell: Cell = initialCell;
  let verticalCell: Cell = initialCell;

  if (angle > 0 && angle < DEG_180) {
    horizontalGrid = CELL_SIZE + gridY * CELL_SIZE;
    distToNextHorizontalGrid = CELL_SIZE;
    xIntersection = (horizontalGrid - y) / tanAngle + x;
  } else {
    horizontalGrid = gridY * CELL_SIZE;
    distToNextHorizontalGrid = -CELL_SIZE;
    xIntersection = (horizontalGrid - y) / tanAngle + x;
    horizontalGrid -= 1;
  }

  if (angle === 0 || angle === DEG_180) {
    distToHorizontalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (angle >= DEG_90 && angle < DEG_270) {
      distToNextXIntersection = CELL_SIZE / tanAngle;
      if (distToNextXIntersection > 0) {
        distToNextXIntersection = -distToNextXIntersection;
      }
    } else {
      distToNextXIntersection = CELL_SIZE / tanAngle;
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

      horizontalCell = world.getCell(xGridIndex, yGridIndex)!;

      horizontalOverlay = !ignoreOverlay && !!horizontalCell.overlay;

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
                (xIntersection - x) / cosAngle - 0.01;
              break;
            } else if (horizontalCell.double) {
              if (
                xOffsetHit < HALF_CELL - horizontalCell.offset.x / 2 ||
                xOffsetHit >
                  CELL_SIZE - (HALF_CELL - horizontalCell.offset.x / 2)
              ) {
                xIntersection += xOffsetDist;
                horizontalGrid += yOffsetDist;
                distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;
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
              distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;
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
              distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;
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
              distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;
              break;
            } else {
              xIntersection += distToNextXIntersection;
              horizontalGrid += distToNextHorizontalGrid;
            }
          } else {
            distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;
            break;
          }
        } else {
          distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;
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
    yIntersection = tanAngle * (verticalGrid - x) + y;
  } else {
    verticalGrid = gridX * CELL_SIZE;
    distToNextVerticalGrid = -CELL_SIZE;
    yIntersection = tanAngle * (verticalGrid - x) + y;
    verticalGrid -= 1;
  }

  if (angle === DEG_90 || angle === DEG_270) {
    distToVerticalGridBeingHit = Number.MAX_VALUE;
  } else {
    if (angle >= 0 && angle < DEG_180) {
      distToNextYIntersection = CELL_SIZE * tanAngle;
      if (distToNextYIntersection < 0) {
        distToNextYIntersection = -distToNextYIntersection;
      }
    } else {
      distToNextYIntersection = CELL_SIZE * tanAngle;
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

      verticalCell = world.getCell(xGridIndex, yGridIndex)!;

      verticalOverlay = !ignoreOverlay && !!verticalCell.overlay;

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
                (yIntersection - y) / sinAngle - 0.01;
              break;
            } else if (verticalCell.double) {
              if (
                yOffsetHit < HALF_CELL - verticalCell.offset.y / 2 ||
                yOffsetHit > CELL_SIZE - (HALF_CELL - verticalCell.offset.y / 2)
              ) {
                yIntersection += yOffsetDist;
                verticalGrid += xOffsetDist;
                distToVerticalGridBeingHit = (yIntersection - y) / sinAngle;
                break;
              } else {
                yIntersection += distToNextYIntersection;
                verticalGrid += distToNextVerticalGrid;
              }
            } else if (yOffsetHit > verticalCell.offset.y) {
              yIntersection += yOffsetDist;
              verticalGrid += xOffsetDist;
              distToVerticalGridBeingHit = (yIntersection - y) / sinAngle;
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
              distToVerticalGridBeingHit = (yIntersection - y) / sinAngle;
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
              distToVerticalGridBeingHit = (yIntersection - y) / sinAngle;
              break;
            } else {
              yIntersection += distToNextYIntersection;
              verticalGrid += distToNextVerticalGrid;
            }
          } else {
            distToVerticalGridBeingHit = (yIntersection - y) / sinAngle;
            break;
          }
        } else {
          distToVerticalGridBeingHit = (yIntersection - y) / sinAngle;
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
    rayEndPoint = new Point(xIntersection, horizontalGrid);

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
          startPoint: rayStart,
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
          startPoint: originPoint,
          endPoint: rayEndPoint,
        })
      ) {
        delete encounteredBodies[encounterdBody.id];
      }
    }

    side = y < horizontalCell.y ? horizontalCell.left : horizontalCell.right;

    return new Ray({
      startPoint: new Point(x, y),
      endPoint: rayEndPoint,
      distance: distToHorizontalGridBeingHit,
      encounteredBodies,
      isHorizontal: true,
      side: horizontalOverlay ? horizontalCell.overlay : side,
      cell: horizontalCell,
      angle,
      isOverlay: horizontalOverlay,
    });
  }

  rayEndPoint = new Point(verticalGrid, yIntersection);

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
        startPoint: rayStart,
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
        startPoint: new Point(x, y),
        endPoint: rayEndPoint,
      })
    ) {
      delete encounteredBodies[encounterdBody.id];
    }
  }

  side = x < verticalCell.x ? verticalCell.front : verticalCell.back;

  return new Ray({
    startPoint: new Point(x, y),
    endPoint: rayEndPoint,
    distance: distToVerticalGridBeingHit,
    encounteredBodies,
    isHorizontal: false,
    side: verticalOverlay ? verticalCell.overlay : side,
    cell: verticalCell,
    angle,
    isOverlay: verticalOverlay,
  });
};

export const castRay = ({
  x,
  y,
  angle,
  world,
  checkInitialCell,
  ...other
}: CastRayOptions): Ray[] => {
  let currentRay: Ray | null | undefined;
  let previousRay: Ray | undefined;

  const result: Ray[] = [];
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

      currentRay.continueFrom(previousRay);
    } else {
      const options = Object.assign(other, startPoint, {
        world,
        angle: rayAngle,
      });

      if (checkInitialCell) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);
        const initialCell = world.getCell(gridX, gridY)!;

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
