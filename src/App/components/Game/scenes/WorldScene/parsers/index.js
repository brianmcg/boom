import { createWorld } from './bodies';
import { createSprites } from './sprites';

export const parse = ({ scene, graphics, data, text, renderer, isMapView }) => {
  const world = createWorld({
    data,
    graphics,
    scene,
  });

  const sprites = createSprites({
    world,
    graphics,
    text,
    renderer,
    isMapView,
  });

  return {
    world,
    sprites,
  };
};
