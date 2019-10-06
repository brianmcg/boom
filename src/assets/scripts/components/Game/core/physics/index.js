import Body from './components/Body';
import DynamicBody from './components/DynamicBody';
import World from './components/World';
import Sector from './components/Sector';
import {
  COS,
  SIN,
  TAN,
  DEG,
  atan2,
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
   * atan2 function.
   */
  atan2,
};
