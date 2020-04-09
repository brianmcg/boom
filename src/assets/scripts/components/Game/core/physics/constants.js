import { SCREEN, FOV } from 'game/constants/config';

const DEG = [];

const SIN = [];

const COS = [];

const TAN = [];

const degreesToRadians = degrees => degrees * Math.PI / 180;

for (let i = 0; i <= 360; i += 1) {
  DEG.push(degreesToRadians(i));
}

export {
  DEG,
  SIN,
  COS,
  TAN,
};
