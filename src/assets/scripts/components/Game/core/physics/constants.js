import { SCREEN, FOV } from 'game/constants/config';

const DEG = [];

const SIN = [];

const COS = [];

const TAN = [];

const radiansToDegress = radians => radians * 180 / Math.PI;

const degreesToRadians = degress => degrees * Math.PI / 180;

for (let i = 0; i <= 360; i += 1) {
  DEG.push(Math.floor(SCREEN.WIDTH / FOV * i));
}

const radians = [];
const degrees = [];

for (let i = 0; i < DEG[360]; i += 1) {
  const radian = (i * Math.PI / (DEG[180])) + 0.00000001;
  radians.push(radian);
  degrees.push(i);
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
