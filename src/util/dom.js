import { SCREEN } from '@constants/config';
import van from 'vanjs-core';

const { add, tags, state } = van;

const scale = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const widthRatio = windowWidth / SCREEN.WIDTH;
  const heightRatio = windowHeight / SCREEN.HEIGHT;
  // return Math.min(widthRatio, heightRatio);
  return Math.max(1, Math.floor(Math.min(widthRatio, heightRatio)));
};

export { add, tags, scale, state };
