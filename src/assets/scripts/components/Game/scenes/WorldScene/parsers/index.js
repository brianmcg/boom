import { createWorld } from './bodies';
import { createSprites } from './sprites';

/**
 * Parses the loaded scene assets.
 * @param  {Scene}  options.scene     The world scene.
 * @param  {Object} options.graphics  The scene graphics.
 * @param  {Object} options.data      The scene data.
 * @param  {Object} options.text      The scene text.
 * @return {Object}                   The parsed scene data.
 */
export const parse = ({
  scene,
  graphics,
  data,
  text,
  renderer,
  mapView,
}) => {
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
    mapView,
  });

  return {
    world,
    sprites,
  };
};
