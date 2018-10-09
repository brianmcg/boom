import * as PIXI from 'pixi.js';
import Scene from './components/Scene';
import Application from './components/Application';
import Sprite from './components/Sprite';

const clearCache = () => {
  const { TextureCache } = PIXI.utils;

  Object.keys(TextureCache).forEach((key) => {
    if (TextureCache[key]) {
      TextureCache[key].destroy(true);
    }
  });
};

export {
  Application,
  Scene,
  Sprite,
};

export default { clearCache };
