import { DRAW_DISTANCE } from '~/constants/config';
import { GREY } from '~/constants/colors';

export const calculateTint = (brightness, distance = 0, side = 0) => {
  let intensity = 1;

  if (distance > DRAW_DISTANCE) {
    distance = DRAW_DISTANCE;
  }

  if (side) {
    intensity -= 0.1;
  }

  intensity += brightness;
  intensity -= (distance / DRAW_DISTANCE);

  if (intensity > 1) {
    intensity = 1;
  }

  if (intensity < 0) {
    intensity = 0;
  }

  return Math.round(intensity * 255) * GREY;
};
