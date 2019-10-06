import { SCREEN } from '~/constants/config';

/**
 * @module game/core/physics/constants
 */

const DEG = [];

const SIN = [];

const COS = [];

const TAN = [];

for (let i = 0; i <= 360; i += 1) {
  DEG.push(Math.floor(SCREEN.WIDTH / 60 * i));
}

for (let i = 0; i < SCREEN.WIDTH * 6; i += 1) {
  const radian = (i * Math.PI / (SCREEN.WIDTH * 3)) + 0.00000001;
  SIN.push(Math.sin(radian));
  COS.push(Math.cos(radian));
  TAN.push(Math.tan(radian));
}

const atan2 = (dyA = 0, dxA = 0) => {
  const radians = Math.atan2(dyA, dxA);
  const angle = Math.round(radians * DEG[180] / Math.PI) % DEG[360];

  return (angle < 0) ? angle + DEG[360] : angle;
};

export {
  DEG,
  SIN,
  COS,
  TAN,
  atan2,
};
