import { TILE_SIZE, SCREEN } from '~/constants/config';
import { Sector } from '~/core/physics';
import { RectangleSprite } from '~/core/graphics';
import Level from './components/Level';
import Player from './components/Player';
import DoorSector from './components/DoorSector';
import GameObject from './components/GameObject';
import Item from './components/Item';
import Enemy from './components/Enemy';
import {
  BROWN,
  RED,
  YELLOW,
  BLUE,
  WHITE,
} from '~/constants/colors';

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
  const start = {};
  const end = {};

  data.layers[LAYERS.GAME].objects.forEach((object) => {
    if (object.name === SECTOR_TYPES.START) {
      start.x = Math.floor(object.x / TILE_SIZE);
      start.y = Math.floor(object.y / TILE_SIZE);
    }
    if (object.name === SECTOR_TYPES.END) {
      end.x = Math.floor(object.x / TILE_SIZE);
      end.y = Math.floor(object.y / TILE_SIZE);
    }
  });

  for (let y = 0; y < mapHeight; y += 1) {
    const row = [];

    for (let x = 0; x < mapWidth; x += 1) {
      const index = (y * mapWidth) + x;
      const wallValue = data.layers[LAYERS.WALLS].data[index];
      const doorValue = data.layers[LAYERS.DOORS].data[index];
      const itemValue = data.layers[LAYERS.ITEMS].data[index];
      const enemyValue = data.layers[LAYERS.ENEMIES].data[index];

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
          width: TILE_SIZE,
          height: TILE_SIZE,
          length: TILE_SIZE,
          axis: doorAxisX ? 'x' : 'y',
          key: properties.key,
          blocking: !!doorImage,
          sideIds,
        }));
      } else {
        const sector = new Sector({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE,
          height: wallImage ? TILE_SIZE : 0,
          length: TILE_SIZE,
          blocking: !!wallImage,
          sideIds,
        });

        sector.exit = x === end.x && y === end.y;

        row.push(sector);
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
            blocking: false,
          }));
        } else {
          objects.push(new GameObject({
            type: tiles[itemValue - 1].image,
            x: (TILE_SIZE * x) + (TILE_SIZE / 2),
            y: (TILE_SIZE * y) + (TILE_SIZE / 2),
            width: TILE_SIZE / 2,
            height: TILE_SIZE / 2,
            length: TILE_SIZE / 2,
            blocking: !properties.nonBlocking,
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
      }
    }

    grid.push(row);
  }

  const player = new Player({
    x: (TILE_SIZE * start.x) + (TILE_SIZE / 2),
    y: (TILE_SIZE * start.y) + (TILE_SIZE / 2),
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

// TODO: Create level bodySprites.
const createSprites = level => level;

const createDebugSprites = (level) => {
  const bodySprites = {};
  const { bodies } = level;

  let color;

  const dotSprites = [];

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    dotSprites.push(new RectangleSprite({
      width: 5,
      height: 5,
      color: 0xFF0000,
    }));
  }

  Object.values(bodies).forEach((body) => {
    if (body.blocking || body instanceof Item) {
      if (body instanceof Player) {
        color = YELLOW;
      } else if (body instanceof Item) {
        color = BLUE;
      } else if (body instanceof Enemy) {
        color = RED;
      } else if (body instanceof DoorSector) {
        color = BROWN;
      } else {
        color = WHITE;
      }

      bodySprites[body.id] = new RectangleSprite({
        width: body.shape.width,
        height: body.shape.length,
        color,
      });
    }
  });

  return { bodySprites, dotSprites };
};

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const parse = (resources, debug) => {
  const { data } = resources;
  const { map } = data;
  const level = createLevel(map);
  const sprites = debug ? createDebugSprites(level) : createSprites(level);

  return { level, sprites };
};
