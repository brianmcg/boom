import { TILE_SIZE } from '~/constants/config';
import { Sector } from '~/core/physics';
import { RectangleSprite } from '~/core/graphics';
import Level from './components/Level';
import Player from './components/Player';
import DoorSector from './components/DoorSector';
import GameObject from './components/GameObject';
import Item from './components/Item';
import Enemy from './components/Enemy';

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
  const objects = [];
  const items = [];
  const enemies = [];

  const mapWidth = data.layers[LAYERS.WALLS].width;
  const mapHeight = data.layers[LAYERS.WALLS].height;
  const { tiles } = data.tilesets[LAYERS.WALLS];
  const tileProperties = data.tilesets[0].tileproperties;
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
      const doorValue = data.layers[LAYERS.DOORS].data[index];
      const itemValue = data.layers[LAYERS.ITEMS].data[index];
      const enemyValue = data.layers[LAYERS.ENEMIES].data[index];
      //
      let wallImage;
      let doorImage;
      let properties;
      let sideIds;
      let doorAxisX;

      if (wallValue) {
        wallImage = tiles[wallValue - 1].image;
        sideIds = [wallImage, wallImage, wallImage, wallImage];
      }

      if (doorValue) {
        properties = tileProperties[doorValue - 1] || {};
        doorImage = tiles[doorValue - 1].image;
        doorAxisX = data.layers[LAYERS.DOORS].data[index - 1];
        sideIds = [doorImage];
      }

      if (!!doorImage && !wallImage) {
        row.push(new DoorSector({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: doorAxisX ? TILE_SIZE : 32,
          height: doorImage ? TILE_SIZE : 0,
          length: doorAxisX ? 32 : TILE_SIZE,
          axis: doorAxisX ? 'x' : 'y',
          key: properties.key,
          sideIds,
        }));
      } else {
        row.push(new Sector({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE,
          height: wallImage ? TILE_SIZE : 0,
          length: TILE_SIZE,
          sideIds,
        }));
      }

      if (itemValue) {
        properties = tileProperties[itemValue - 1] || {};
        if (properties.key) {
          items.push(new Item({
            type: tiles[itemValue - 1].image,
            x: (TILE_SIZE * x) + (TILE_SIZE / 2),
            y: (TILE_SIZE * y) + (TILE_SIZE / 2),
            width: TILE_SIZE / 2,
            length: TILE_SIZE / 2,
          }));
        } else {
          objects.push(new GameObject({
            type: tiles[itemValue - 1].image,
            x: (TILE_SIZE * x) + (TILE_SIZE / 2),
            y: (TILE_SIZE * y) + (TILE_SIZE / 2),
            width: TILE_SIZE / 2,
            height: properties.nonBlocking ? 0 : TILE_SIZE / 2,
            length: TILE_SIZE / 2,
          }));
        }
      }

      if (enemyValue) {
        enemies.push(new Enemy({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE / 2,
          height: TILE_SIZE / 2,
          length: TILE_SIZE / 2,
        }));
        // enemies.push(createEnemy({
        //   idFragment: _.last(tiles[enemyValue - 1].image.split('/')).split('_')[0],
        //   x: x * TILE_SIZE + (TILE_SIZE / 2),
        //   y: y * TILE_SIZE + (TILE_SIZE / 2)
        // }));
      }
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
    objects,
    items,
    enemies,
  });

  return level;
};

const debugCreateSprites = (level) => {
  const sprites = {};
  const { bodies } = level;

  let color;

  Object.values(bodies).forEach((body) => {
    if (body.height || body instanceof Item) {
      if (body instanceof Player) {
        color = 0x00FF00;
      } else if (body instanceof Item) {
        color = 0x0000FF;
      } else if (body instanceof Enemy) {
        color = 0xFF0000;
      } else {
        color = 0xFFFFFF;
      }
      sprites[body.id] = new RectangleSprite({
        width: body.shape.width,
        height: body.shape.length,
        color,
      });
    }
  });

  return sprites;
};

export const parse = (resources) => {
  const { data } = resources;
  const { map } = data;
  const level = createLevel(map);
  return { level };
};

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const debugParse = (resources) => {
  const { data } = resources;
  const { map } = data;
  const level = createLevel(map);
  const sprites = debugCreateSprites(level);
  return { level, sprites };
};
