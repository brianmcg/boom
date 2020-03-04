import Body from './components/Body';
import DynamicBody from './components/DynamicBody';
import World from './components/World';
import Sector from './components/Sector';
import DynamicSector from './components/DynamicSector';
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
  DynamicSector,
  /**
   * The cosine table.
   */
  COS,
  /**
   * The sin table.
   */
  SIN,
  /**
   * The tan table.
   */
  TAN,
  /**
   * The degrees table.
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
