import { SCREEN, FOV } from 'game/constants/config';

const DEG = [];

const SIN = [];

const COS = [];

const TAN = [];

for (let i = 0; i <= 360; i += 1) {
  DEG.push(Math.floor(SCREEN.WIDTH / FOV * i));
}

for (let i = 0; i < DEG[360]; i += 1) {
  const radian = (i * Math.PI / (DEG[180])) + 0.00000001;
  SIN.push(Math.sin(radian));
  COS.push(Math.cos(radian));
  TAN.push(Math.tan(radian));
}

export {
  DEG,
  SIN,
  COS,
  TAN,
};
