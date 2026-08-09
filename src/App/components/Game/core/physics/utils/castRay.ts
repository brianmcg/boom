/**
 * The raycaster. `castRay` walks a ray out from a point until it hits
 * something opaque, returning one {@link Ray} per transparent layer it passed
 * through on the way.
 *
 * `castRaySection` does the walking, stepping the ray cell by cell along both
 * axes. `castCellRay` handles the one case it cannot: starting inside a cell
 * that is partway open, like a sliding door, where the near face is somewhere
 * inside the cell rather than on its boundary.
 *
 * Each of those is written as two mirrored halves, one per axis. They have
 * been that way since 2021 and are the hottest code in the game — see the note
 * on changing this module in `types.ts` before touching either.
 */
import { CELL_SIZE, WALL_LAYERS } from '@constants/config';
import { AXES, TRANSPARENCY } from '../constants';
import { DEG_90, DEG_180, DEG_270 } from './degrees';
import Ray from '../world/Ray';
import Point from '../geometry/Point';
import { isLineShapeIntersection } from './intersections';
import type { Side } from '../types';
import type Body from '../world/Body';
import type Cell from '../world/Cell';
import RetractableCell from '../world/RetractableCell';
import DisplaceableCell from '../world/DisplaceableCell';
import TransparentCell from '../world/TransparentCell';
import type World from '../world/World';

const { X, Y } = AXES;

const { FULL } = TRANSPARENCY;

const HALF_CELL = CELL_SIZE / 2;

export interface CastRayOptions {
  x: number;
  y: number;
  angle: number;
  world: World;
  /** Cast from inside a partially-open cell before stepping to the next one. */
  checkInitialCell?: boolean;
  ignoreOverlay?: boolean;
  /** Height of the ray; cells no taller than this are passed straight through. */
  elavation?: number;
  /** Offsets the ray's origin along its own angle, so a body doesn't hit itself. */
  radius?: number;
}

/** What {@link castCellRay} needs on top of the public options. */
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

    if (
      horizontalOverlay ||
      (initialCell instanceof TransparentCell &&
        initialCell.transparency === FULL)
    ) {
      if (initialCell.reverse) {
        if (y < horizontalGrid) {
          return null;
        }
      } else if (y > horizontalGrid) {
        return null;
      }
    }

    // if door offset miss.
    if (!horizontalOverlay && initialCell instanceof RetractableCell) {
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
        isLineShapeIntersection(initialCellBody.shape, {
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

  if (
    verticalOverlay ||
    (initialCell instanceof TransparentCell &&
      initialCell.transparency === FULL)
  ) {
    if (initialCell.reverse) {
      if (x < verticalGrid) {
        return null;
      }
    } else if (x > verticalGrid) {
      return null;
    }
  }

  // if door offset miss.
  if (!verticalOverlay && initialCell instanceof RetractableCell) {
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
      isLineShapeIntersection(initialCellBody.shape, {
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
          if (horizontalCell instanceof RetractableCell) {
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
            } else if (xOffsetHit > horizontalCell.offset.x) {
              xIntersection += xOffsetDist;
              horizontalGrid += yOffsetDist;
              distToHorizontalGridBeingHit = (xIntersection - x) / cosAngle;
              break;
            } else {
              xIntersection += distToNextXIntersection;
              horizontalGrid += distToNextHorizontalGrid;
            }
          } else if (horizontalCell instanceof DisplaceableCell) {
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
          } else if (horizontalCell instanceof TransparentCell) {
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
          if (verticalCell instanceof RetractableCell) {
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
          } else if (verticalCell instanceof DisplaceableCell) {
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
          } else if (verticalCell instanceof TransparentCell) {
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
        isLineShapeIntersection(initialCellBody.shape, {
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
        !isLineShapeIntersection(encounterdBody.shape, {
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
      isLineShapeIntersection(initialCellBody.shape, {
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
      !isLineShapeIntersection(encounterdBody.shape, {
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

    if (!(currentRay.cell instanceof TransparentCell || currentRay.isOverlay)) {
      break;
    }
  }

  return result;
};
