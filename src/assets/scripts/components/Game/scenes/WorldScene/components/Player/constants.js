import { TILE_SIZE } from '~/constants/config';
import { DEG } from '~/core/physics';

/**
 * @module constants
 */

export const DEFAULTS = {
  MAX_VELOCITY: TILE_SIZE / 16,
  MAX_ROT_VELOCITY: DEG[2],
  ACCELERATION: TILE_SIZE / 256,
  ROT_ACCELERATION: 2,
};
