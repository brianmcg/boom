import { TILE_SIZE } from '~/constants/config';
import { DEG } from '~/core/physics';

export const DEFAULTS = {
  MAX_VELOCITY: TILE_SIZE / 16,
  MAX_ROT_VELOCITY: DEG[2],
  ACCELERATION: TILE_SIZE / 256,
  ROT_ACCELERATION: 2,
  MAX_Y_ANGLE: 128,
  Y_ROT_VELOCITY: 4,
};
