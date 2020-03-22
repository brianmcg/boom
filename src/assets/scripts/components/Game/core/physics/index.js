import Body from './components/Body';
import DynamicBody from './components/DynamicBody';
import World from './components/World';
import Cell from './components/Cell';
import DynamicCell from './components/DynamicCell';
import { atan2 } from './helpers';
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
   * The cell component.
   */
  Cell,
  /**
   * The flat cell component.
   */
  DynamicCell,
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
};
