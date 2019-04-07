import { TILE_SIZE } from '~/constants/config';
import { Sector } from '~/core/physics';
import Level from './components/Level';
import Player from './components/Player';

/**
 * @module helpers
 */

const SECTOR_TYPES = {
  START: 'start',
  END: 'end',
};

const LAYERS = {
  WALLS: 0,
  DOORS: 1,
  ITEMS: 2,
  ENEMIES: 3,
  GAME: 4,
};

const createLevel = (data) => {
  const grid = [];
  // const items = [];
  // const enemies = [];

  const mapWidth = data.layers[LAYERS.WALLS].width;
  const mapHeight = data.layers[LAYERS.WALLS].height;
  const { tiles } = data.tilesets[LAYERS.WALLS];
  // const tileProperties = data.tilesets[0].tileproperties;
  // const start = {};
  // const end = {};

  // data.layers[LAYERS.GAME].objects.forEach((object) => {
  //   if (object.name === SECTOR_TYPES.START) {
  //     start.x = Math.floor(object.x / TILE_SIZE);
  //     start.y = Math.floor(object.y / TILE_SIZE);
  //   }
  //   if (object.name === SECTOR_TYPES.END) {
  //     end.x = Math.floor(object.x / TILE_SIZE);
  //     end.y = Math.floor(object.y / TILE_SIZE);
  //   }
  // });

  for (let y = 0; y < mapHeight; y += 1) {
    const row = [];

    for (let x = 0; x < mapWidth; x += 1) {
      const index = (y * mapWidth) + x;
      const wallValue = data.layers[LAYERS.WALLS].data[index];
      // const doorValue = data.layers[LAYERS.DOORS].data[index];
      // const itemValue = data.layers[LAYERS.ITEMS].data[index];
      // const enemyValue = data.layers[LAYERS.ENEMIES].data[index];
      //
      let wallImage;

      if (wallValue) {
        wallImage = tiles[wallValue - 1].image;
      }

      const sector = new Sector({
        x: (TILE_SIZE * x) + (TILE_SIZE / 2),
        y: (TILE_SIZE * y) + (TILE_SIZE / 2),
        width: TILE_SIZE,
        height: wallImage ? TILE_SIZE : 0,
        length: TILE_SIZE,
      });

      row.push(sector);
    }

    grid.push(row);
  }

  const player = new Player({
    x: (TILE_SIZE * 2) + (TILE_SIZE / 2),
    y: (TILE_SIZE * 2) + (TILE_SIZE / 2),
    width: TILE_SIZE / 2,
    height: TILE_SIZE / 2,
    length: TILE_SIZE / 2,
  });

  const level = new Level({
    grid,
    player,
  });

  return level;
};

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const parse = (assets) => {
  const { data } = assets;
  const { map } = data;
  const level = createLevel(map);
  return { level };
};
