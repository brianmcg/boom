import Body from './components/Body';
import DynamicBody from './components/DynamicBody';
import World from './components/World';
import Sector from './components/Sector';
import DynamicFlatSector from './components/DynamicFlatSector';
import {
  distanceBetween,
  castRay,
  atan2,
  isRayCollision,
  isBodyCollision,
} from './helpers';
import {
  COS,
  SIN,
  TAN,
  DEG,
} from './constants';

/**
 * @module  game/core/physics
 */

export {
  /**
   * The body component.
   */
  Body,
  /**
   * The dynamic body component.
   */
  DynamicBody,
  /**
   * The world component.
   */
  World,
  /**
   * The sector component.
   */
  Sector,
  /**
   * The flat sector component.
   */
  DynamicFlatSector,
  /**
   * The cosine table.
   * @const
   */
  COS,
  /**
   * The sin table.
   * @const
   */
  SIN,
  /**
   * The tan table.
   * @const
   */
  TAN,
  /**
   * The degrees table.
   * @const
   */
  DEG,
  /**
   * The atan2 function.
   */
  atan2,
  /**
   * The distance function.
   */
  distanceBetween,
  /**
   * The cast ray function.
   */
  castRay,
  /**
   * The is ray collision function,
   */
  isRayCollision,
  /**
   * The is body collision function.
   */
  isBodyCollision,
};
